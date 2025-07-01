// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; 
import { VAPID_KEY } from "../src/utils/firebasevap";

const firebaseConfig = {
  apiKey: "AIzaSyDSJ8r73OsF3b0aF27JzoHjHVfKHkYDMTs",
  authDomain: "bidding-app-de135.firebaseapp.com",
  projectId: "bidding-app-de135",
  storageBucket: "bidding-app-de135.appspot.com",
  messagingSenderId: "1098780501455",
  appId: "1:1098780501455:web:c5a22af91902f565529eba",
  measurementId: "G-Z5MDF4Z37T"
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
