/**
 * useWebSocket Hook
 * 
 * Custom hook for WebSocket connection management with real-time notifications.
 * Implements Requirement 5.3.1 for real-time notification service.
 * 
 * Features:
 * - Auto-reconnect with exponential backoff
 * - Connection state tracking
 * - Message queue for offline scenarios
 * - Event-based API
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless Hook Pattern
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

// WebSocket connection states
export const WS_STATE = {
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    RECONNECTING: 'RECONNECTING',
    ERROR: 'ERROR',
};

// Default configuration
const DEFAULT_CONFIG = {
    reconnectAttempts: 5,
    reconnectInterval: 1000,
    maxReconnectInterval: 30000,
    heartbeatInterval: 30000,
    debug: process.env.NODE_ENV === 'development',
};

/**
 * Custom WebSocket hook for real-time communication
 * 
 * @param {string} endpoint - WebSocket endpoint path (e.g., '/ws/notifications')
 * @param {Object} options - Configuration options
 * @returns {Object} WebSocket state and methods
 */
export default function useWebSocket(endpoint, options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };

    // State
    const [connectionState, setConnectionState] = useState(WS_STATE.DISCONNECTED);
    const [lastMessage, setLastMessage] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);

    // Refs for persistence across renders
    const wsRef = useRef(null);
    const reconnectAttemptRef = useRef(0);
    const reconnectTimeoutRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);
    const messageQueueRef = useRef([]);
    const mountedRef = useRef(true);

    // Event handlers refs
    const onOpenRef = useRef(options.onOpen);
    const onCloseRef = useRef(options.onClose);
    const onMessageRef = useRef(options.onMessage);
    const onErrorRef = useRef(options.onError);

    // Update refs when options change
    useEffect(() => {
        onOpenRef.current = options.onOpen;
        onCloseRef.current = options.onClose;
        onMessageRef.current = options.onMessage;
        onErrorRef.current = options.onError;
    }, [options.onOpen, options.onClose, options.onMessage, options.onError]);

    /**
     * Log debug messages
     */
    const log = useCallback((...args) => {
        if (config.debug) {
            console.log('[WebSocket]', ...args);
        }
    }, [config.debug]);

    /**
     * Build WebSocket URL
     */
    const getWebSocketUrl = useCallback(() => {
        const baseUrl = API_BASE_URL.replace(/^http/, 'ws');
        const token = localStorage.getItem('auth_token');
        const url = new URL(endpoint, baseUrl);

        // Add auth token as query param if exists
        if (token) {
            url.searchParams.set('token', token);
        }

        return url.toString();
    }, [endpoint]);

    /**
     * Clear all timers
     */
    const clearTimers = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    }, []);

    /**
     * Send heartbeat to keep connection alive
     */
    const sendHeartbeat = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'HEARTBEAT', timestamp: Date.now() }));
            log('Heartbeat sent');
        }
    }, [log]);

    /**
     * Process queued messages
     */
    const processMessageQueue = useCallback(() => {
        while (messageQueueRef.current.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
            const message = messageQueueRef.current.shift();
            wsRef.current.send(JSON.stringify(message));
            log('Sent queued message:', message);
        }
    }, [log]);

    /**
     * Connect to WebSocket server
     */
    const connect = useCallback(() => {
        if (!mountedRef.current) return;

        // Close existing connection
        if (wsRef.current) {
            wsRef.current.close();
        }

        clearTimers();
        setConnectionState(WS_STATE.CONNECTING);
        setError(null);

        const url = getWebSocketUrl();
        log('Connecting to:', url);

        try {
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                if (!mountedRef.current) return;

                log('Connected');
                setConnectionState(WS_STATE.CONNECTED);
                reconnectAttemptRef.current = 0;

                // Start heartbeat
                heartbeatIntervalRef.current = setInterval(sendHeartbeat, config.heartbeatInterval);

                // Process queued messages
                processMessageQueue();

                // Call user callback
                onOpenRef.current?.();
            };

            wsRef.current.onclose = (event) => {
                if (!mountedRef.current) return;

                log('Connection closed:', event.code, event.reason);
                clearTimers();
                setConnectionState(WS_STATE.DISCONNECTED);

                // Call user callback
                onCloseRef.current?.(event);

                // Attempt reconnect if not a clean close
                if (event.code !== 1000 && reconnectAttemptRef.current < config.reconnectAttempts) {
                    scheduleReconnect();
                }
            };

            wsRef.current.onmessage = (event) => {
                if (!mountedRef.current) return;

                try {
                    const data = JSON.parse(event.data);
                    log('Message received:', data);

                    // Skip heartbeat responses
                    if (data.type === 'HEARTBEAT_ACK') return;

                    setLastMessage(data);
                    setMessages(prev => [...prev.slice(-99), data]); // Keep last 100 messages

                    // Call user callback
                    onMessageRef.current?.(data);
                } catch (e) {
                    log('Failed to parse message:', e);
                    // Handle non-JSON messages
                    setLastMessage({ raw: event.data });
                    onMessageRef.current?.({ raw: event.data });
                }
            };

            wsRef.current.onerror = (event) => {
                if (!mountedRef.current) return;

                log('Connection error:', event);
                setConnectionState(WS_STATE.ERROR);
                setError('WebSocket connection error');

                // Call user callback
                onErrorRef.current?.(event);
            };

        } catch (e) {
            log('Failed to create WebSocket:', e);
            setConnectionState(WS_STATE.ERROR);
            setError(e.message);
        }
    }, [getWebSocketUrl, clearTimers, sendHeartbeat, processMessageQueue, config, log]);

    /**
     * Schedule reconnection with exponential backoff
     */
    const scheduleReconnect = useCallback(() => {
        if (!mountedRef.current) return;

        reconnectAttemptRef.current++;
        const delay = Math.min(
            config.reconnectInterval * Math.pow(2, reconnectAttemptRef.current - 1),
            config.maxReconnectInterval
        );

        log(`Scheduling reconnect attempt ${reconnectAttemptRef.current} in ${delay}ms`);
        setConnectionState(WS_STATE.RECONNECTING);

        reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
                connect();
            }
        }, delay);
    }, [connect, config, log]);

    /**
     * Disconnect from WebSocket server
     */
    const disconnect = useCallback(() => {
        log('Disconnecting');
        clearTimers();

        if (wsRef.current) {
            wsRef.current.close(1000, 'User initiated disconnect');
            wsRef.current = null;
        }

        setConnectionState(WS_STATE.DISCONNECTED);
    }, [clearTimers, log]);

    /**
     * Send a message through WebSocket
     * Queue if not connected
     */
    const sendMessage = useCallback((message) => {
        const payload = typeof message === 'string' ? message : JSON.stringify(message);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(payload);
            log('Message sent:', message);
            return true;
        } else {
            // Queue message for later
            messageQueueRef.current.push(message);
            log('Message queued:', message);
            return false;
        }
    }, [log]);

    /**
     * Clear message history
     */
    const clearMessages = useCallback(() => {
        setMessages([]);
        setLastMessage(null);
    }, []);

    // Connect on mount, disconnect on unmount
    useEffect(() => {
        mountedRef.current = true;

        if (options.autoConnect !== false) {
            connect();
        }

        return () => {
            mountedRef.current = false;
            disconnect();
        };
    }, [endpoint]); // Reconnect if endpoint changes

    return {
        // State
        connectionState,
        isConnected: connectionState === WS_STATE.CONNECTED,
        isConnecting: connectionState === WS_STATE.CONNECTING,
        isReconnecting: connectionState === WS_STATE.RECONNECTING,
        lastMessage,
        messages,
        error,

        // Methods
        connect,
        disconnect,
        sendMessage,
        clearMessages,

        // Queue info
        queuedMessageCount: messageQueueRef.current.length,
    };
}

// Named export for convenience
export { useWebSocket };
