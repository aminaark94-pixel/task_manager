/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase Service Worker for Cloud Messaging
 * This file handles background notifications
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration (same as in your app)
const firebaseConfig = {
  apiKey: 'AIzaSyDso2Dp_BWFfOi2nm3lbfE3GuK50uU8wDk',
  authDomain: 'family-task-manager-ab5eb.firebaseapp.com',
  projectId: 'family-task-manager-ab5eb',
  storageBucket: 'family-task-manager-ab5eb.firebasestorage.app',
  messagingSenderId: '610979676329',
  appId: '1:610979676329:web:5639a5683e20d741eba9b8'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📬 Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Family Task Manager';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/family-icon.png',
    badge: '/family-badge.png',
    tag: 'family-task-notification',
    requireInteraction: false,
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Focus or open the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
