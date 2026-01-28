// Fully lazy-loaded Firebase - NOTHING loads until getDb() is called
let firebaseDb: any = null;
let isInitializing = false;

export const getDb = async () => {
  // Return existing instance if already initialized
  if (firebaseDb) {
    return firebaseDb;
  }

  // Wait if already initializing
  if (isInitializing) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (firebaseDb) {
          clearInterval(checkInterval);
          resolve(firebaseDb);
        }
      }, 100);
    });
  }

  // Initialize Firebase
  isInitializing = true;
  try {
    console.log('🔥 Initializing Firebase...');
    
    // Dynamic import of Firebase modules
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');

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
    firebaseDb = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    return firebaseDb;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

// DO NOT EXPORT THESE - they load Firebase immediately!
// Instead, import them dynamically in the functions that need them

// Helper to get Firestore functions dynamically
export const getFirestoreFunctions = async () => {
  const firestore = await import('firebase/firestore');
  return {
    collection: firestore.collection,
    addDoc: firestore.addDoc,
    getDocs: firestore.getDocs,
    query: firestore.query,
    orderBy: firestore.orderBy,
    limit: firestore.limit,
    where: firestore.where,
    Timestamp: firestore.Timestamp,
  };
};