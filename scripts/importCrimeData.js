// Import LA Crime Data to Firebase
// Run this script once: node scripts/importCrimeData.js

const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const geohash = require('ngeohash');

// Your Firebase config
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Batch settings
const BATCH_SIZE = 500;
let batch = db.batch();
let batchCount = 0;
let totalImported = 0;

// Month name to number mapping
const monthMap = {
  'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
  'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

async function importCrimeData(csvFilePath) {
  console.log('🚀 Starting crime data import...');
  console.log(`Reading from: ${csvFilePath}`);

  const crimes = [];
  let processedCount = 0;
  let skippedCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        processedCount++;

        try {
          // Extract data
          const lat = parseFloat(row.LAT);
          const lon = parseFloat(row.LON);
          const timeOcc = row['TIME OCC'];
          const dateOcc = row['DATE OCC']; // Format: "2020 Nov 07 12:00:00 AM"
          const crimeType = row['Crm Cd Desc'];
          const area = row['AREA NAME'];

          // Validate coordinates
          if (!lat || !lon || isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
            skippedCount++;
            return;
          }

          // Validate time and date
          if (!timeOcc || !dateOcc) {
            skippedCount++;
            return;
          }

          // Parse time (format: 0000 to 2359)
          const timeInt = parseInt(timeOcc);
          if (isNaN(timeInt) || timeInt < 0 || timeInt > 2359) {
            skippedCount++;
            return;
          }
          const hour = Math.floor(timeInt / 100);
          if (hour < 0 || hour > 23) {
            skippedCount++;
            return;
          }

          // Parse date (format: "2020 Nov 07 12:00:00 AM")
          const dateParts = dateOcc.trim().split(' ');
          if (dateParts.length < 3) {
            skippedCount++;
            return;
          }

          const year = parseInt(dateParts[0]);
          const monthStr = dateParts[1];
          const day = parseInt(dateParts[2]);

          // Get month number
          const month = monthMap[monthStr];

          // Validate date parts
          if (isNaN(year) || month === undefined || isNaN(day) ||
              day < 1 || day > 31 ||
              year < 2020 || year > 2025) {
            skippedCount++;
            return;
          }

          // Create date object
          const crimeDate = new Date(year, month, day, hour, 0, 0);
          
          // Validate the date object
          if (isNaN(crimeDate.getTime())) {
            skippedCount++;
            return;
          }

          // Generate geohash
          const geoHash = geohash.encode(lat, lon, 7);

          // Create crime document
          const crimeDoc = {
            lat,
            lon,
            geohash: geoHash,
            hour: hour,
            date: admin.firestore.Timestamp.fromDate(crimeDate),
            dateString: dateOcc,
            type: crimeType || 'UNKNOWN',
            area: area || 'UNKNOWN',
            year: year,
            month: month + 1, // Store as 1-12 for easier queries
          };

          crimes.push(crimeDoc);

          // Log progress
          if (processedCount % 10000 === 0) {
            console.log(`📊 Processed ${processedCount} rows (${crimes.length} valid, ${skippedCount} skipped)...`);
          }

        } catch (error) {
          // Skip this row if any error occurs
          skippedCount++;
          if (skippedCount <= 10) {
            console.log(`⚠️  Skipping row ${processedCount}: ${error.message}`);
          }
        }
      })
      .on('end', async () => {
        console.log(`\n✅ CSV parsing complete!`);
        console.log(`📊 Total rows processed: ${processedCount}`);
        console.log(`⚠️  Rows skipped (invalid data): ${skippedCount}`);
        console.log(`✨ Valid crimes to import: ${crimes.length}`);
        
        if (crimes.length === 0) {
          console.log('\n❌ No valid crimes to import. Check the CSV format.');
          resolve();
          return;
        }
        
        console.log(`\n⏳ Starting Firestore import (this may take 5-10 minutes)...\n`);

        try {
            console.log('📦 Preparing first batch...');
  
            for (let i = 0; i < crimes.length; i++) {
                const crime = crimes[i];
                const docRef = db.collection('crime_data_la').doc();
                batch.set(docRef, crime);
                batchCount++;

                // Show progress every 100 items added to batch
                if (i > 0 && i % 100 === 0 && batchCount < BATCH_SIZE) {
                process.stdout.write(`\r📝 Building batch: ${batchCount}/${BATCH_SIZE} items...`);
                }

                if (batchCount === BATCH_SIZE) {
                process.stdout.write('\r🔄 Committing batch to Firestore...        \n');
                await batch.commit();
                totalImported += batchCount;
                console.log(`✅ Imported ${totalImported} / ${crimes.length} crimes (${((totalImported/crimes.length)*100).toFixed(1)}%)`);
                batch = db.batch();
                batchCount = 0;
                }
            }

          // Commit remaining
          if (batchCount > 0) {
            await batch.commit();
            totalImported += batchCount;
          }

          console.log(`\n🎉 Import complete!`);
          console.log(`📊 Total crimes imported: ${totalImported}`);
          console.log(`\n✅ Data is now in Firestore collection: crime_data_la`);
          
          resolve();
        } catch (error) {
          console.error('❌ Error importing to Firestore:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

// Run the import
const csvPath = process.argv[2] || './LA_Crime_2024.csv';

importCrimeData(csvPath)
  .then(() => {
    console.log('\n✨ All done! You can now query this data in your app.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });