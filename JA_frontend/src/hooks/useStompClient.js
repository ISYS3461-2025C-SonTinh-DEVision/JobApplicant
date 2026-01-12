/**
 * useStompClient Hook
 * 
 * Custom hook for STOMP over WebSocket with real-time notifications.
 * Supports multiple subscriptions for different queue destinations.
 * 
 * Features:
 * - STOMP protocol support (compatible with Spring WebSocket)
 * - Multiple queue subscriptions
 * - Auto-reconnect with exponential backoff
 * - Connection state tracking
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless Hook Pattern
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../config/apiConfig';

// Connection states
export const STOMP_STATE = {
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    RECONNECTING: 'RECONNECTING',
    ERROR: 'ERROR',
};

// Default configuration
const DEFAULT_CONFIG = {
    reconnectAttempts: 5,
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: process.env.NODE_ENV === 'development',
};

/**
 * Custom STOMP WebSocket hook for real-time communication
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} STOMP client state and methods
 */
export default function useStompClient(options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };

    // State
    const [connectionState, setConnectionState] = useState(STOMP_STATE.DISCONNECTED);
    const [error, setError] = useState(null);

    // Refs
    const clientRef = useRef(null);
    const subscriptionsRef = useRef(new Map());
    const reconnectAttemptRef = useRef(0);
    const mountedRef = useRef(true);

    // Event handlers refs
    const onConnectRef = useRef(options.onConnect);
    const onDisconnectRef = useRef(options.onDisconnect);
    const onErrorRef = useRef(options.onError);
    const messageHandlersRef = useRef(options.messageHandlers || {});

    // Update refs when options change
    useEffect(() => {
        onConnectRef.current = options.onConnect;
        onDisconnectRef.current = options.onDisconnect;
        onErrorRef.current = options.onError;
        messageHandlersRef.current = options.messageHandlers || {};
    }, [options.onConnect, options.onDisconnect, options.onError, options.messageHandlers]);

    /**
     * Log debug messages
     */
    const log = useCallback((...args) => {
        if (config.debug) {
            console.log('[STOMP]', ...args);
        }
    }, [config.debug]);

    /**
     * Get WebSocket URL for STOMP connection
     */
    const getWebSocketUrl = useCallback(() => {
        const baseUrl = API_BASE_URL.replace(/^http/, 'ws');
        // SockJS-compatible endpoint typically ends with /websocket
        return `${baseUrl}/ws/notifications/websocket`;
    }, []);

    /**
     * Connect to STOMP server
     */
    const connect = useCallback(() => {
        if (!mountedRef.current) return;

        // Get auth token
        const token = localStorage.getItem('auth_token');
        if (!token) {
            log('No auth token, skipping STOMP connection');
            return;
        }

        // Close existing connection
        if (clientRef.current?.connected) {
            clientRef.current.deactivate();
        }

        setConnectionState(STOMP_STATE.CONNECTING);
        setError(null);

        const wsUrl = getWebSocketUrl();
        log('Connecting to:', wsUrl);

        // Create STOMP client
        const client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                'Authorization': `Bearer ${token}`,
            },
            debug: (str) => {
                if (config.debug) {
                    console.log('[STOMP Debug]', str);
                }
            },
            reconnectDelay: config.reconnectDelay,
            heartbeatIncoming: config.heartbeatIncoming,
            heartbeatOutgoing: config.heartbeatOutgoing,

            onConnect: (frame) => {
                if (!mountedRef.current) return;

                log('Connected:', frame);
                setConnectionState(STOMP_STATE.CONNECTED);
                reconnectAttemptRef.current = 0;

                // Subscribe to user notification queue (personal notifications)
                const notificationSub = client.subscribe('/user/queue/notifications', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        log('Notification received:', data);
                        messageHandlersRef.current.onNotification?.(data);
                    } catch (e) {
                        log('Failed to parse notification:', e);
                    }
                });
                subscriptionsRef.current.set('notifications', notificationSub);

                // Subscribe to admin action queue (for real-time deactivation notifications)
                const adminActionSub = client.subscribe('/user/queue/admin-action', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        log('Admin action received:', data);
                        messageHandlersRef.current.onAdminAction?.(data);
                    } catch (e) {
                        log('Failed to parse admin action:', e);
                    }
                });
                subscriptionsRef.current.set('admin-action', adminActionSub);

                // Subscribe to notification count updates
                const countSub = client.subscribe('/user/queue/notification-count', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        log('Notification count update:', data);
                        messageHandlersRef.current.onNotificationCount?.(data);
                    } catch (e) {
                        log('Failed to parse notification count:', e);
                    }
                });
                subscriptionsRef.current.set('notification-count', countSub);

                // Subscribe to broadcast topic for system-wide notifications
                const broadcastSub = client.subscribe('/topic/notifications', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        log('Broadcast notification received:', data);
                        messageHandlersRef.current.onNotification?.(data);
                    } catch (e) {
                        log('Failed to parse broadcast notification:', e);
                    }
                });
                subscriptionsRef.current.set('broadcast-notifications', broadcastSub);

                // Subscribe to broadcast admin actions (job deletions, company deactivations)
                const broadcastAdminSub = client.subscribe('/topic/admin-action', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        log('Broadcast admin action received:', data);
                        messageHandlersRef.current.onAdminAction?.(data);
                    } catch (e) {
                        log('Failed to parse broadcast admin action:', e);
                    }
                });
                subscriptionsRef.current.set('broadcast-admin-action', broadcastAdminSub);

                // Call user callback
                onConnectRef.current?.(frame);
            },

            onDisconnect: (frame) => {
                if (!mountedRef.current) return;

                log('Disconnected:', frame);
                setConnectionState(STOMP_STATE.DISCONNECTED);
                subscriptionsRef.current.clear();

                // Call user callback
                onDisconnectRef.current?.(frame);
            },

            onStompError: (frame) => {
                if (!mountedRef.current) return;

                log('STOMP error:', frame);
                setConnectionState(STOMP_STATE.ERROR);
                setError(frame.headers?.message || 'STOMP connection error');

                // Call user callback
                onErrorRef.current?.(frame);
            },

            onWebSocketError: (event) => {
                if (!mountedRef.current) return;

                log('WebSocket error:', event);
                setError('WebSocket connection error');

                // Call user callback
                onErrorRef.current?.(event);
            },
        });

        clientRef.current = client;
        client.activate();
    }, [getWebSocketUrl, config, log]);

    /**
     * Disconnect from STOMP server
     */
    const disconnect = useCallback(() => {
        log('Disconnecting');

        // Unsubscribe all
        subscriptionsRef.current.forEach((sub) => {
            try {
                sub.unsubscribe();
            } catch (e) {
                log('Error unsubscribing:', e);
            }
        });
        subscriptionsRef.current.clear();

        // Deactivate client
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
        }

        setConnectionState(STOMP_STATE.DISCONNECTED);
    }, [log]);

    /**
     * Send a message to a destination
     */
    const sendMessage = useCallback((destination, body, headers = {}) => {
        if (!clientRef.current?.connected) {
            log('Cannot send message: not connected');
            return false;
        }

        clientRef.current.publish({
            destination,
            body: typeof body === 'string' ? body : JSON.stringify(body),
            headers,
        });

        log('Message sent to', destination, body);
        return true;
    }, [log]);

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
    }, []); // Only run on mount/unmount

    return {
        // State
        connectionState,
        isConnected: connectionState === STOMP_STATE.CONNECTED,
        isConnecting: connectionState === STOMP_STATE.CONNECTING,
        error,

        // Methods
        connect,
        disconnect,
        sendMessage,
    };
}

// Named export for convenience
export { useStompClient };
