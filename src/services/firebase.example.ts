import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// INSTRUCTIONS:
// 1. Copy this file to firebase.ts
// 2. Replace with your actual Firebase config
// 3. Never commit firebase.ts to Git

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };