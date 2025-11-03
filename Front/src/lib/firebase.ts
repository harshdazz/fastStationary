import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

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

// 👉 Only connect to emulators if running locally
// if (window.location.hostname === "localhost") {
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, "localhost", 8080);
//   connectStorageEmulator(storage, "localhost", 9199);
//   console.log("Connected to Firebase emulators");
// }

export default app;
