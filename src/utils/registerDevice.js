// src/utils/registerDevice.js
import { getFirebaseTokenAndDeviceId } from './firebaseTokenHelper';
import axios from 'axios';
import { url } from '../../mainurl';

export const registerDevice = async (tokenStr) => {
  try {
    const data = await getFirebaseTokenAndDeviceId();
    if (!data) return;

    const response = await axios.post(
      `${url}/auth/fcm-update/`,
      {
        fcm_token: data.fcmToken,
        device_id: data.deviceId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenStr}`,
        },
      }
    );

    console.log('Device registered successfully.');
  } catch (err) {
    console.error('Device registration failed:', err?.response?.data || err.message);
  }
};

