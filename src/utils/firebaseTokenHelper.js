import { getToken } from 'firebase/messaging';
import { messaging } from '../firebase';
import { getOrCreateDeviceId } from './deviceHelper';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const getFirebaseTokenAndDeviceId = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Notification permission denied');

    const fcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    const deviceId = getOrCreateDeviceId();
    return { fcmToken, deviceId };
  } catch (err) {
    console.error('Error getting FCM token/device ID:', err);
    return null;
  }
};
