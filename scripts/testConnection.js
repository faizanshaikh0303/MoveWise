const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testSimpleWrite() {
  console.log('🧪 Testing direct write to Firestore...\n');
  
  try {
    console.log('Attempt 1: Single document write...');
    const docRef = await db.collection('test_connection').add({
      message: 'Hello from script',
      timestamp: admin.firestore.Timestamp.now()
    });
    console.log('✅ SUCCESS! Document ID:', docRef.id);
    
    console.log('\nAttempt 2: Reading it back...');
    const doc = await db.collection('test_connection').doc(docRef.id).get();
    console.log('✅ SUCCESS! Data:', doc.data());
    
    console.log('\n🎉 Connection is working! The issue is elsewhere.');
    
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    console.error('\nFull error:', error);
  }
  
  process.exit(0);
}

testSimpleWrite();