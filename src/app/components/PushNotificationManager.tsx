'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Bell, BellOff } from 'lucide-react';

export default function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const checkSubscription = useCallback(async () => {
    try {
      console.log('Checking subscription status...');
      if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker registration:', registration);
      
      if (!registration.pushManager) {
        console.log('Push Manager not supported');
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      console.log('Current push subscription:', subscription);
      
      const isCurrentlySubscribed = !!subscription;
      console.log('Is currently subscribed:', isCurrentlySubscribed);
      
      setIsSubscribed(isCurrentlySubscribed);
      setSubscription(subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribeToPushNotifications = async () => {
    try {
      console.log('Attempting to subscribe to push notifications...');
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker registration:', registration);
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return;
      }

      // Get VAPID public key from environment variable
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log('VAPID public key available:', !!vapidPublicKey);
      
      if (!vapidPublicKey) {
        console.error('VAPID public key not found');
        toast.error('VAPID public key not configured');
        return;
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      console.log('Application server key created');

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      console.log('Successfully subscribed:', subscription);

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
      console.log('Server response:', await response.json());

      await checkSubscription(); // Re-check subscription status
      toast.success('Successfully subscribed to push notifications!');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to subscribe to push notifications');
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    try {
      console.log('Attempting to unsubscribe from push notifications...');
      if (!subscription) {
        console.log('No active subscription found');
        return;
      }

      await subscription.unsubscribe();
      console.log('Successfully unsubscribed from push service');
      
      // Notify server about unsubscribe
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
      console.log('Server response:', await response.json());

      await checkSubscription(); // Re-check subscription status
      toast.success('Successfully unsubscribed from push notifications');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to unsubscribe from push notifications');
    }
  };

  // Helper function to convert base64 string to Uint8Array
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribeFromPushNotifications : subscribeToPushNotifications}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
    >
      {isSubscribed ? (
        <>
          <Bell className="h-4 w-4" />
          Disable Notifications
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          Enable Notifications
        </>
      )}
    </button>
  );
} 