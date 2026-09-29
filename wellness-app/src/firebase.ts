import { initializeApp, getApps } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "qwiklabs-gcp-03-478f309b432f",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:20299313946:web:f98ada42304d61da44f2a3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "qwiklabs-gcp-03-478f309b432f.firebasestorage.app",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "qwiklabs-gcp-03-478f309b432f.firebaseapp.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "20299313946"
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Enable offline caching via IndexedDB persistence where supported
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Multiple tabs open; IndexedDB offline persistence can only be enabled in one tab at a time.");
    } else if (err.code === "unimplemented") {
      console.warn("The browser does not support all features required for Firestore offline persistence.");
    }
  });
}
