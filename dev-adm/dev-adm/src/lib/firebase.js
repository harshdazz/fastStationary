import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDedv1pDKz4YtBqSQrA2D1OrwAnHcEJ_nU",
  authDomain: "fir-admin-d1ae6.firebaseapp.com",
  projectId: "fir-admin-d1ae6",
  storageBucket: "fir-admin-d1ae6.firebasestorage.app",
  messagingSenderId: "326542251535",
  appId: "1:326542251535:web:6d20e54d4a0fbcf2e9357a",
  measurementId: "G-KP4VCLTBLL",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
