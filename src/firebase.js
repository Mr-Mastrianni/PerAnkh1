import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCT3m23nhRzZLFRdo4nLQcsWDII8J4CM2Y",
  authDomain: "per-ankh-b10e8.firebaseapp.com",
  projectId: "per-ankh-b10e8",
  storageBucket: "per-ankh-b10e8.firebasestorage.app",
  messagingSenderId: "676958000724",
  appId: "1:676958000724:web:67ab5e14563e74665a3fc1",
  measurementId: "G-4SF18N9PZN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
