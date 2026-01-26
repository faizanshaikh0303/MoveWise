const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const geohash = require('ngeohash');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const monthMap = {
  'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
  'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

const PROGRESS_FILE = 'import_progress.json';
const BATCH_SIZE = 10;
const DELAY_MS = 2000; // 2 seconds between batches
const MAX_RETRIES = 5;

async function getExistingCount() {
  try {
    const snapshot = await db.collection('crime_data_la').count().get();
    return snapshot.data().count;
  } catch (e) {
    return 0;
  }
}

// Load progress
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      console.log(`📂 Resuming from ${data.imported} records`);
      return data;
    }
  } catch (e) {}
  return { imported: 0, crimes: [] };
}

// Save progress
function saveProgress(imported, crimes) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ imported, crimes }));
}

// Wait with retry
async function waitForConnection(seconds = 5) {
  console.log(`⏳ Waiting ${seconds}s for connection to stabilize...`);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// Test if connection is working
async function testConnection() {
  try {
    await db.collection('test_connection').doc('ping').set({ 
      timestamp: admin.firestore.Timestamp.now() 
    }, { merge: true });
    return true;
  } catch (e) {
    return false;
  }
}

async function importRobust(csvFilePath) {
  console.log('🚀 Robust import (handles unstable connections)...\n');

  // Load previous progress
  let progress = loadProgress();
  let crimes = progress.crimes;
  
  // If no crimes in progress, collect them
  if (crimes.length === 0) {
    console.log('📖 Reading CSV...');
    
    await new Promise((resolve, reject) => {
      let stopped = false;
      const stream = fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (stopped) return;

          try {
            const lat = parseFloat(row.LAT);
            const lon = parseFloat(row.LON);
            if (!lat || !lon || lat === 0 || lon === 0) return;
            
            const timeOcc = row['TIME OCC'];
            const dateOcc = row['DATE OCC'];
            if (!timeOcc || !dateOcc) return;
            
            const timeInt = parseInt(timeOcc);
            const hour = Math.floor(timeInt / 100);
            if (hour < 0 || hour > 23) return;
            
            const dateParts = dateOcc.trim().split(' ');
            if (dateParts.length < 3) return;
            
            const year = parseInt(dateParts[0]);
            const month = monthMap[dateParts[1]];
            const day = parseInt(dateParts[2]);
            
            if (month === undefined || year !== 2024) return;
            
            const crimeDate = new Date(year, month, day, hour, 0, 0);
            if (isNaN(crimeDate.getTime())) return;
            
            crimes.push({
              lat,
              lon,
              geohash: geohash.encode(lat, lon, 7),
              hour: hour,
              date: admin.firestore.Timestamp.fromDate(crimeDate),
              type: row['Crm Cd Desc'] || 'UNKNOWN',
              area: row['AREA NAME'] || 'UNKNOWN',
              year: year,
              month: month + 1,
            });
            
            // Collect 1000 for now
            if (crimes.length >= 1000 && !stopped) {
              stopped = true;
              stream.destroy();
            }
          } catch (e) {}
        })
        .on('close', () => {
          console.log(`✅ Collected ${crimes.length} crimes\n`);
          saveProgress(0, crimes);
          resolve();
        })
        .on('error', reject);
    });
  }
  
  // Import with robust error handling
  console.log(`📊 Importing ${crimes.length} crimes (starting from ${progress.imported})...`);
  console.log(`⚙️  Batch size: ${BATCH_SIZE}, Delay: ${DELAY_MS}ms\n`);
  
  // Check Firebase for actual count
    const existingCount = await getExistingCount();
    console.log(`📊 Found ${existingCount} existing records in Firebase`);

    let imported = Math.max(progress.imported, existingCount);
    if (imported > 0) {
    console.log(`⏭️  Skipping first ${imported} records\n`);
    }
  
  for (let i = imported; i < crimes.length; i += BATCH_SIZE) {
    const end = Math.min(i + BATCH_SIZE, crimes.length);
    const batchCrimes = crimes.slice(i, end);
    
    // Try to import this batch with retries
    let success = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Test connection first
        const connected = await testConnection();
        if (!connected) {
          console.log(`❌ Connection lost, waiting...`);
          await waitForConnection(10);
          continue;
        }
        
        // Create and commit batch
        const batch = db.batch();
        for (const crime of batchCrimes) {
          const docRef = db.collection('crime_data_la').doc();
          batch.set(docRef, crime);
        }
        
        await batch.commit();
        success = true;
        
        imported += batchCrimes.length;
        const percent = ((imported / crimes.length) * 100).toFixed(0);
        console.log(`✅ ${imported} / ${crimes.length} (${percent}%)`);
        
        // Save progress
        saveProgress(imported, crimes);
        
        // Delay before next batch
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        break;
        
      } catch (error) {
        console.log(`⚠️  Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
        
        if (attempt === MAX_RETRIES) {
          console.log(`\n💾 Progress saved at ${imported} records`);
          console.log(`🔄 Run the script again to resume`);
          throw new Error('Max retries exceeded');
        }
        
        await waitForConnection(5);
      }
    }
    
    if (!success) break;
  }
  
  if (imported >= crimes.length) {
    console.log('\n🎉 Import complete!');
    // Clean up progress file
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
  }
}

const csvPath = process.argv[2] || './LA_Crime_2024.csv';

importRobust(csvPath)
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Stopped:', error.message);
    console.log('💡 Run the script again to resume from where it stopped');
    process.exit(1);
  });