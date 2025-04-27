// lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth }      from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage }   from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDFro5Hf_kIqSvFpWsOZU177zo6Akajkg",
  authDomain: "artfolio-6c0c2.firebaseapp.com",
  projectId: "artfolio-6c0c2",
  storageBucket: "artfolio-6c0c2.firebasestorage.app",
  messagingSenderId: "475182164507",
  appId: "1:475182164507:web:1af4f78ebcb7dc784a26be",
  measurementId: "G-WYNZ6L1LH6"
};

/** 2)  Only initialize once when hot-reload runs */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

/** 3)  Export the services you need */
export const auth     = getAuth(app);
export const db       = getFirestore(app);
export const storage  = getStorage(app);