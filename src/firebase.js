// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; 
import { VAPID_KEY } from "../src/utils/firebasevap";

const firebaseConfig = {
apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Firestore & Auth exports
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Messaging only in the browser
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

export { messaging, getToken, onMessage, firebaseConfig };

/**
 * Register FCM token for a given user ID.
 * @returns {Promise<string|null>} the FCM token, or null if none.
 */
export async function registerFcmToken(uid) {
  if (!messaging) {
    console.warn("FCM is not supported in this environment.");
    return null;
  }

  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) {
      console.warn("No FCM token retrieved.");
      return null;
    }

    // Persist token on your backend
    await fetch("/api/users/fcm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, token })
    });

    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}

/**
 * Listen for in-app (foreground) messages.
 * @param {Function} callback Receives the payload when a message arrives.
 * @returns {Function} unsubscribe function
 */
export function listenForInAppPush(callback) {
  if (!messaging) {
    console.warn("FCM is not supported in this environment.");
    return () => {};
  }

  return onMessage(messaging, callback);
}
