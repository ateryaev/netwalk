import { initializeApp } from 'firebase/app';
import {
    getAuth, signInAnonymously, onAuthStateChanged
} from 'firebase/auth';
import {
    getDatabase, ref, onValue, set, query, orderByChild, limitToLast, get, runTransaction
} from 'firebase/database';

// Read Firebase config from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Helper function to get the current UID safely
const getCurrentUid = () => auth.currentUser?.uid;

export {
    auth, db,
    signInAnonymously, onAuthStateChanged,
    ref, set, get, query, orderByChild, limitToLast, onValue, runTransaction,
    getCurrentUid
};
