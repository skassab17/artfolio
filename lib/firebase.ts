// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDDFro5Hf_kIqSvFpWsOZU177zo6Akajkg",
  authDomain: "artfolio-6c0c2.firebaseapp.com",
  projectId: "artfolio-6c0c2",
  storageBucket: "artfolio-6c0c2.appspot.com",
  messagingSenderId: "475182164507",
  appId: "1:475182164507:web:1af4f78ebcb7dc784a26be",
  measurementId: "G-WYNZ6L1LH6"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/** Simulator-safe Firestore instance */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const auth    = getAuth(app);    // warning is OK for now
export const storage = getStorage(app);