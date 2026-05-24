import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let authInstance = null;
let dbInstance = null;
let isFirebaseEnabled = false;

// Initialize Firebase only if configurations are active in the environment
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    isFirebaseEnabled = true;
    console.log("WatchMatch Cloud database synced.");
  } catch (error) {
    console.error("Firebase failed to initialize:", error);
  }
} else {
  console.warn("Firebase credentials not configured. Running WatchMatch in Local Guest Mode.");
}

export const auth = authInstance;
export const db = dbInstance;
export { isFirebaseEnabled };
