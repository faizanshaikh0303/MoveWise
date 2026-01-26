const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function countDocuments() {
  try {
    console.log('📊 Counting documents in crime_data_la...\n');
    
    const snapshot = await db.collection('crime_data_la').count().get();
    const count = snapshot.data().count;
    
    console.log(`✅ Total documents: ${count}`);
    
    // Also get a sample document to verify data
    const sampleDoc = await db.collection('crime_data_la').limit(1).get();
    if (!sampleDoc.empty) {
      console.log('\n📄 Sample document:');
      console.log(sampleDoc.docs[0].data());
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

countDocuments();