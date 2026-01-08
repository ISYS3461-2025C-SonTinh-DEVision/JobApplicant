package com.DEVision.JobApplicant.notification.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.DEVision.JobApplicant.notification.external.dto.NotificationRequest;
import com.DEVision.JobApplicant.notification.external.dto.NotificationResponse;
import com.DEVision.JobApplicant.notification.external.service.NotificationExternalService;
import com.DEVision.JobApplicant.notification.internal.dto.NotificationListResponse;
import com.DEVision.JobApplicant.notification.internal.service.NotificationInternalService;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API for notification management
 * Note: Primary usage is via NotificationExternalService from backend services
 * These endpoints are for frontend and optional direct access
 */
@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Management", 
     description = "REST endpoints for notifications. Frontend connects via WebSocket at /ws/notifications for real-time updates.")
public class NotificationController {
    
    @Autowired
    private NotificationExternalService externalService;
    
    @Autowired
    private NotificationInternalService internalService;
    
    @Operation(
        summary = "Create notification",
        description = "Create a new notification for a user. Saves to DB and sends via WebSocket. " +
                     "NOTE: Backend services should use NotificationExternalService.sendNotification() instead."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Notification created and sent via WebSocket"),
        @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @Parameter(description = "Notification data including userId, title, content, and optional type")
            @Valid @RequestBody NotificationRequest request) {
        try {
            NotificationResponse response = externalService.sendNotification(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error creating notification: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    @Operation(
        summary = "Get user notifications",
        description = "Retrieve all notifications for a user with metadata (total count and unread count)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notifications retrieved with metadata"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<NotificationListResponse> getUserNotifications(
            @Parameter(description = "User ID to fetch notifications for")
            @PathVariable String userId) {
        try {
            NotificationListResponse response = internalService.getUserNotifications(userId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching notifications: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Get unread notifications",
        description = "Retrieve only unread notifications for a user. Frontend typically uses this on initial load."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Unread notifications retrieved"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @Parameter(description = "User ID to fetch unread notifications for")
            @PathVariable String userId) {
        try {
            List<NotificationResponse> notifications = internalService.getUnreadNotifications(userId);
            return new ResponseEntity<>(notifications, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching unread notifications: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Get unread count",
        description = "Get count of unread notifications. Frontend can display badge with this count. " +
                     "Real-time updates sent via WebSocket to /user/{userId}/queue/notification-count"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Count retrieved"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @Parameter(description = "User ID to get unread count for")
            @PathVariable String userId) {
        try {
            long count = externalService.getUnreadCount(userId);
            Map<String, Long> response = new HashMap<>();
            response.put("unreadCount", count);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching unread count: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Mark notification as read",
        description = "Mark a specific notification as read. Updates unread count."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Marked as read"),
        @ApiResponse(responseCode = "404", description = "Notification not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @Parameter(description = "Notification ID to mark as read")
            @PathVariable String notificationId) {
        try {
            NotificationResponse response = internalService.markAsRead(notificationId);
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Mark all as read",
        description = "Mark all notifications as read for a user. Typically used by 'Mark all read' button."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All notifications marked as read"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @Parameter(description = "User ID to mark all notifications as read")
            @PathVariable String userId) {
        try {
            internalService.markAllAsRead(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications marked as read");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error marking all as read: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Delete notification",
        description = "Delete a specific notification from the database"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification deleted"),
        @ApiResponse(responseCode = "404", description = "Notification not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @Parameter(description = "Notification ID to delete")
            @PathVariable String notificationId) {
        try {
            boolean deleted = internalService.deleteNotification(notificationId);
            Map<String, String> response = new HashMap<>();
            
            if (deleted) {
                response.put("message", "Notification deleted successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("message", "Notification not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("Error deleting notification: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Delete all user notifications",
        description = "Delete all notifications for a user. Use with caution - this cannot be undone."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All notifications deleted"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Map<String, String>> deleteAllUserNotifications(
            @Parameter(description = "User ID to delete all notifications for")
            @PathVariable String userId) {
        try {
            internalService.deleteAllUserNotifications(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications deleted successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error deleting all notifications: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ===== /me Endpoints - Current User Operations =====
    
    @Operation(
        summary = "Get my notifications",
        description = "Retrieve notifications for the current authenticated user with metadata (total count and unread count). " +
                     "Uses JWT token to identify user. " +
                     "Optional query parameter 'unread=true' to filter only unread notifications."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notifications retrieved with metadata"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/me")
    public ResponseEntity<?> getMyNotifications(
            @Parameter(description = "Filter to show only unread notifications", required = false)
            @RequestParam(required = false, defaultValue = "false") boolean unread) {
        try {
            NotificationListResponse response = internalService.getMyNotifications(unread);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error fetching my notifications: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Mark my notification as read",
        description = "Mark a specific notification as read for the current authenticated user. " +
                     "Updates unread count. Only allows marking own notifications."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Marked as read"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized to mark this notification"),
        @ApiResponse(responseCode = "404", description = "Notification not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PatchMapping("/me/{notificationId}/read")
    public ResponseEntity<?> markMyNotificationAsRead(
            @Parameter(description = "Notification ID to mark as read")
            @PathVariable String notificationId) {
        try {
            NotificationResponse response = internalService.markMyNotificationAsRead(notificationId);
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            Map<String, String> error = new HashMap<>();
            error.put("message", "Notification not found");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error marking my notification as read: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Mark all my notifications as read",
        description = "Mark all notifications as read for the current authenticated user. " +
                     "Typically used by 'Mark all read' button. Uses JWT token to identify user."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All notifications marked as read"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PatchMapping("/me/read-all")
    public ResponseEntity<?> markMyAllAsRead() {
        try {
            internalService.markMyAllAsRead();
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications marked as read");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error marking all as read: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Delete my notification",
        description = "Delete a specific notification for the current authenticated user. " +
                     "Only allows deleting own notifications."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification deleted"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "403", description = "Not authorized to delete this notification"),
        @ApiResponse(responseCode = "404", description = "Notification not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/me/{notificationId}")
    public ResponseEntity<?> deleteMyNotification(
            @Parameter(description = "Notification ID to delete")
            @PathVariable String notificationId) {
        try {
            boolean deleted = internalService.deleteMyNotification(notificationId);
            Map<String, String> response = new HashMap<>();
            
            if (deleted) {
                response.put("message", "Notification deleted successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("message", "Notification not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error deleting my notification: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Delete all my notifications",
        description = "Delete all notifications for the current authenticated user. " +
                     "Use with caution - this cannot be undone. Uses JWT token to identify user."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All notifications deleted"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAllNotifications() {
        try {
            internalService.deleteMyAllNotifications();
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications deleted successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error deleting all my notifications: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

