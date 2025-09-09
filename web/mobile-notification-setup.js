// Add this to your React Native app's App.js or main component

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';

// 1. Register device for push notifications when app starts
const registerDeviceForNotifications = async () => {
  try {
    // Generate a unique device token (in production, use FCM/APNS token)
    const deviceId = await AsyncStorage.getItem('deviceId') || 
                    `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await AsyncStorage.setItem('deviceId', deviceId);

    // Register with your server
    const response = await fetch('http://192.168.29.147:5000/api/notifications/register-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceToken: deviceId,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
          appVersion: '1.0.0'
        }
      })
    });

    const data = await response.json();
    console.log('📱 Device registered for notifications:', data);
    
  } catch (error) {
    console.error('❌ Failed to register device:', error);
  }
};

// 2. Check for new notifications every 30 seconds
const checkForNotifications = async () => {
  try {
    const lastCheck = await AsyncStorage.getItem('lastNotificationCheck') || new Date(0).toISOString();
    
    const response = await fetch(
      `http://192.168.29.147:5000/api/notifications/latest?lastCheck=${lastCheck}`
    );
    const data = await response.json();
    
    if (data.success && data.notifications.length > 0) {
      console.log(`🔔 Received ${data.notifications.length} new notifications`);
      
      // Show each notification
      data.notifications.forEach(notification => {
        showLocalNotification(notification);
      });
      
      // Update last check time
      await AsyncStorage.setItem('lastNotificationCheck', data.serverTime);
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
};

// 3. Show local notification with sound
const showLocalNotification = (notification) => {
  // Configure notification sound based on type
  let soundName = 'default';
  if (notification.soundType === 'urgent') soundName = 'urgent_alert.mp3';
  if (notification.soundType === 'breaking') soundName = 'breaking_news.mp3';
  
  PushNotification.localNotification({
    title: notification.title,
    message: notification.message,
    soundName: soundName,
    playSound: true,
    vibrate: true,
    vibration: 300,
    importance: 'high',
    priority: 'high',
    largeIcon: 'ic_launcher',
    smallIcon: 'ic_notification',
    color: '#c41e3a', // 5WH Media brand color
    channelId: '5wh-notifications',
    userInfo: {
      type: notification.type,
      timestamp: notification.timestamp
    }
  });
};

// 4. Initialize notifications when app starts
export const initializeNotifications = () => {
  // Register device
  registerDeviceForNotifications();
  
  // Start checking for notifications every 30 seconds
  const notificationInterval = setInterval(checkForNotifications, 30000);
  
  // Check immediately
  checkForNotifications();
  
  return () => {
    clearInterval(notificationInterval);
  };
};

// 5. Configure PushNotification
PushNotification.configure({
  onRegister: function (token) {
    console.log('📱 Push notification token:', token);
  },
  
  onNotification: function (notification) {
    console.log('📱 Notification received:', notification);
    
    if (notification.userInteraction) {
      // User tapped the notification
      console.log('User tapped notification');
      // Navigate to relevant screen based on notification.userInfo.type
    }
  },
  
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  
  popInitialNotification: true,
  requestPermissions: true,
});

// Create notification channel (Android)
PushNotification.createChannel(
  {
    channelId: '5wh-notifications',
    channelName: '5WH Media Notifications',
    channelDescription: 'Notifications from 5WH Media app',
    playSound: true,
    soundName: 'default',
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`Notification channel created: ${created}`)
);

export default {
  registerDeviceForNotifications,
  checkForNotifications,
  showLocalNotification,
  initializeNotifications
};
