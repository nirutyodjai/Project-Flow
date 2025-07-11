import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/**
 * Initializes and returns the Firebase app instance, creating it only if it doesn't already exist.
 * This singleton pattern prevents re-initialization and is safe for both server and client components.
 * Returns null if Firebase is not configured.
 * @returns {FirebaseApp | null} The initialized Firebase app instance or null.
 */
function getFirebaseApp(): FirebaseApp | null {
    if (app) {
        return app;
    }

    if (getApps().length === 0) {
        if (!firebaseConfig.apiKey) {
            console.warn("Firebase API Key is not set. Some features will be disabled.");
            return null;
        }
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    return app;
}

/**
 * Returns the Firebase Auth instance.
 * @returns {Auth | null} The Firebase Auth instance or null if not configured.
 */
export function getFirebaseAuth(): Auth | null {
    const app = getFirebaseApp();
    if (!app) {
        return null;
    }
    if (!auth) {
        auth = getAuth(app);
    }
    return auth;
}

/**
 * Returns the Firestore instance.
 * @returns {Firestore | null} The Firestore instance or null if not configured.
 */
export function getDb(): Firestore | null {
    const app = getFirebaseApp();
    if (!app) {
        return null;
    }
    if (!db) {
        db = getFirestore(app);
    }
    return db;
}
