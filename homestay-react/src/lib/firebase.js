import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Real Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCiQWAiLfC-hYPN0ImtyLvy86YTLj9P5TE",
  authDomain: "homestay-2f599.firebaseapp.com",
  projectId: "homestay-2f599",
  storageBucket: "homestay-2f599.firebasestorage.app",
  messagingSenderId: "338158432247",
  appId: "1:338158432247:web:f08c71fc3e8d6a162688f2",
  measurementId: "G-47ELD639QZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;