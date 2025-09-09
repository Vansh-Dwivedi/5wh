const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// In-memory storage for device tokens (use Redis/Database in production)
let deviceTokens = new Set();
let notificationHistory = [];

// Store device token for push notifications
router.post('/register-device', async (req, res) => {
  try {
    const { deviceToken, deviceInfo } = req.body;
    
    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        message: 'Device token is required'
      });
    }

    // Store device token (in production, save to database with user info)
    deviceTokens.add(deviceToken);
    
    console.log(`📱 Device registered for notifications: ${deviceToken.substring(0, 20)}...`);
    
    res.json({
      success: true,
      message: 'Device registered successfully',
      deviceCount: deviceTokens.size
    });

  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device'
    });
  }
});

// Test endpoint without auth to check routing
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Notification routes are working!',
    timestamp: new Date()
  });
});

// Test push notification endpoint without auth for debugging
router.post('/push-notification-test', async (req, res) => {
  try {
    console.log('📤 Test push notification endpoint hit (no auth)');
    console.log('Body:', req.body);
    
    const { title, message, type, soundType, targetAudience } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Create notification object
    const notification = {
      id: Date.now(),
      title,
      message,
      type: type || 'general',
      soundType: soundType || 'default',
      targetAudience: targetAudience || 'all',
      timestamp: new Date(),
      sentBy: 'test-user',
      deviceCount: deviceTokens.size
    };

    // Store in history
    notificationHistory.unshift(notification);
    
    console.log(`🔔 Test notification created: ${title}`);

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      deviceCount: deviceTokens.size,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        timestamp: notification.timestamp
      }
    });

  } catch (error) {
    console.error('Error sending test push notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

// Send push notification to all registered devices
router.post('/push-notification', auth, async (req, res) => {
  try {
    console.log('📤 Push notification endpoint hit');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    const { title, message, type, soundType, targetAudience } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Create notification object
    const notification = {
      id: Date.now(),
      title,
      message,
      type: type || 'general',
      soundType: soundType || 'default',
      targetAudience: targetAudience || 'all',
      timestamp: new Date(),
      sentBy: req.user.id,
      deviceCount: deviceTokens.size
    };

    // Store in history
    notificationHistory.unshift(notification);
    
    // Keep only last 100 notifications
    if (notificationHistory.length > 100) {
      notificationHistory = notificationHistory.slice(0, 100);
    }

    console.log(`🔔 Sending notification to ${deviceTokens.size} devices:`);
    console.log(`   Title: ${title}`);
    console.log(`   Message: ${message}`);
    console.log(`   Type: ${type}`);

    // In a real implementation, you would:
    // 1. Send to Firebase Cloud Messaging (FCM) - FREE
    // 2. Send to Apple Push Notification Service (APNS) - FREE
    // 3. Use Expo Push Notifications - FREE with limits
    
    // For now, we'll simulate the notification and store it for polling
    // Mobile apps can poll /api/notifications/latest to get new notifications

    res.json({
      success: true,
      message: 'Notification sent successfully',
      deviceCount: deviceTokens.size,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        timestamp: notification.timestamp
      }
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

// Get latest notifications for polling (mobile app checks this endpoint)
router.get('/latest', async (req, res) => {
  try {
    const { lastCheck } = req.query;
    const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(0);
    
    // Get notifications newer than last check
    const newNotifications = notificationHistory.filter(notif => 
      new Date(notif.timestamp) > lastCheckTime
    );

    res.json({
      success: true,
      notifications: newNotifications,
      count: newNotifications.length,
      serverTime: new Date()
    });

  } catch (error) {
    console.error('Error fetching latest notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get notification history (admin panel)
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedHistory = notificationHistory.slice(startIndex, endIndex);

    res.json({
      success: true,
      notifications: paginatedHistory,
      pagination: {
        page,
        limit,
        total: notificationHistory.length,
        hasMore: endIndex < notificationHistory.length
      }
    });

  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification history'
    });
  }
});

// Get statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayNotifications = notificationHistory.filter(notif => 
      new Date(notif.timestamp) >= today
    );

    const stats = {
      totalDevices: deviceTokens.size,
      totalNotifications: notificationHistory.length,
      todayNotifications: todayNotifications.length,
      lastNotification: notificationHistory[0] || null,
      notificationTypes: {
        breaking: notificationHistory.filter(n => n.type === 'breaking').length,
        live: notificationHistory.filter(n => n.type === 'live').length,
        general: notificationHistory.filter(n => n.type === 'general').length
      }
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
