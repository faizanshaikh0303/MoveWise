import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration (paste the config you copied earlier)
const firebaseConfig = {
  apiKey: "AIzaSyAeeIpGPs29H2qeU_qrRqAJtdSg-zHhyNY",
  authDomain: "movewise-7f0a6.firebaseapp.com",
  projectId: "movewise-7f0a6",
  storageBucket: "movewise-7f0a6.firebasestorage.app",
  messagingSenderId: "190527460597",
  appId: "1:190527460597:web:b87db9f849076becca21bc",
  measurementId: "G-DSN2E3L4TR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };