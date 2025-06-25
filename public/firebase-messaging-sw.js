// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
 apiKey: "AIzaSyDSJ8r73OsF3b0aF27JzoHjHVfKHkYDMTs",
  authDomain: "http://bidding-app-de135.firebaseapp.com",
  projectId: "bidding-app-de135",
  storageBucket: "http://bidding-app-de135.firebasestorage.app",
  messagingSenderId: "1098780501455",
  appId: "1:1098780501455:web:c5a22af91902f565529eba",
  measurementId: "G-Z5MDF4Z37T"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
