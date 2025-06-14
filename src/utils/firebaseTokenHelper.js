// src/utils/firebaseTokenHelper.js
import { getToken } from 'firebase/messaging';
import { messaging } from '../firebase';
import { getOrCreateDeviceId } from './deviceHelper';

export const getFirebaseTokenAndDeviceId = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Notification permission denied');

    const fcmToken = await getToken(messaging, {
      vapidKey: 'BM0X-0GP48K4ncqczgolW-LkBWmcvrQnqtzPh6EL2TfiL8iGAoNGjf2ymzyZNQUtAu7j2TMvQEVKnR1IXJSFA7o', 
    });

    const deviceId = getOrCreateDeviceId();
    return { fcmToken, deviceId };
  } catch (err) {
    console.error('Error getting FCM token/device ID:', err);
    return null;
  }
};
