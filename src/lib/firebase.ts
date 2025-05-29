// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6ALvnN6aX0DMVhePhkUow9VrPauBCqgQ",
  authDomain: "tap2go-kuucn.firebaseapp.com",
  projectId: "tap2go-kuucn",
  storageBucket: "tap2go-kuucn.firebasestorage.app",
  messagingSenderId: "828629511294",
  appId: "1:828629511294:web:fae32760ca3c3afcb87c2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
