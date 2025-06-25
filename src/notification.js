// src/notifications.js
import { messaging, getToken } from "./firebase";

export const requestFirebaseNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: "BM0X-0GP48K4ncqczgolW-LkBWmcvrQnqtzPh6EL2TfiL8iGAoNGjf2ymzyZNQUtAu7j2TMvQEVKnR1IXJSFA7o",
      });
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("Permission not granted");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};
