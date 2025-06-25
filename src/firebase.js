// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDSJ8r73OsF3b0aF27JzoHjHVfKHkYDMTs",
  authDomain: "http://bidding-app-de135.firebaseapp.com",
  projectId: "bidding-app-de135",
  storageBucket: "http://bidding-app-de135.firebasestorage.app",
  messagingSenderId: "1098780501455",
  appId: "1:1098780501455:web:c5a22af91902f565529eba",
  measurementId: "G-Z5MDF4Z37T"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
