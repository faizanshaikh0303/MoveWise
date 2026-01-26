const fs = require('fs');
const csv = require('csv-parser');

const csvPath = process.argv[2] || './LA_Crime_2024.csv';

console.log('🔍 Debugging CSV file...\n');

let count = 0;

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    count++;
    if (count <= 3) {
      console.log(`\n=== Row ${count} ===`);
      console.log('All columns:', Object.keys(row));
      console.log('\nSample data:');
      console.log('LAT:', row.LAT);
      console.log('LON:', row.LON);
      console.log('TIME OCC:', row['TIME OCC']);
      console.log('DATE OCC:', row['DATE OCC']);
      console.log('Crm Cd Desc:', row['Crm Cd Desc']);
      console.log('AREA NAME:', row['AREA NAME']);
    }
    if (count === 3) {
      console.log('\n✅ Showing first 3 rows. Press Ctrl+C to stop.');
      process.exit(0);
    }
  })
  .on('error', (error) => {
    console.error('Error:', error);
  });