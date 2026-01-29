// Crime Service - Handles all crime data queries and analysis
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as geofire from 'geofire-common';

export interface Crime {
  id: string;
  lat: number;
  lng: number; // We standardize to 'lng' internally even if stored as 'lon'
  type: string;
  date: string;
  time: string;
  geohash: string;
}

/**
 * Query crimes within a radius of a location
 */
export async function queryCrimesNearLocation(
  lat: number,
  lng: number,
  radiusMiles: number
): Promise<Crime[]> {
  console.log(`🔍 Querying crimes near ${lat}, ${lng} (radius: ${radiusMiles} miles)`);
  
  // Validate and clean coordinates
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    console.error('❌ Invalid coordinates:', { lat, lng });
    return [];
  }
  
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.error('❌ Coordinates out of range:', { lat, lng });
    return [];
  }
  
  // Round coordinates to 6 decimal places (about 0.11 meters precision)
  // This prevents precision issues with geofire
  const cleanLat = Math.round(lat * 1000000) / 1000000;
  const cleanLng = Math.round(lng * 1000000) / 1000000;
  
  console.log(`✅ Cleaned coordinates: ${cleanLat}, ${cleanLng}`);
  
  const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters
  const center: [number, number] = [cleanLat, cleanLng]; // Explicitly type as tuple
  
  let bounds;
  try {
    bounds = geofire.geohashQueryBounds(center, radiusMeters);
    console.log(`✅ Generated ${bounds.length} geohash bounds`);
  } catch (error) {
    console.error('❌ Error generating geohash bounds:', error);
    console.log('Center value:', center, 'Types:', typeof center[0], typeof center[1]);
    return [];
  }
  
  const crimes: Crime[] = [];
  
  try {
    for (const bound of bounds) {
      // Validate bound before using it
      if (!bound || bound.length !== 2 || typeof bound[0] !== 'string' || typeof bound[1] !== 'string') {
        console.warn('⚠️ Skipping invalid bound:', bound);
        continue;
      }
      
      try {
        const q = query(
          collection(db, 'crime_data_la'),
          where('geohash', '>=', bound[0]),
          where('geohash', '<=', bound[1])
        );
        
        const snapshot = await getDocs(q);
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Get coordinates - database uses 'lon' not 'lng'
          let docLat = data.lat;
          let docLng = data.lon || data.lng || data.longitude; // Try common variations
          
          // Check if coordinates exist at all
          if (docLat === undefined || docLat === null || docLng === undefined || docLng === null) {
            // Skip silently - these are bad data
            return;
          }
          
          // Convert to numbers if they're strings
          if (typeof docLat === 'string') docLat = parseFloat(docLat);
          if (typeof docLng === 'string') docLng = parseFloat(docLng);
          
          // Validate after conversion
          if (typeof docLat !== 'number' || typeof docLng !== 'number' || isNaN(docLat) || isNaN(docLng)) {
            return;
          }
          
          // Calculate distance to verify it's within radius
          try {
            const distanceInM = geofire.distanceBetween([docLat, docLng], [cleanLat, cleanLng]);
            const distanceInMiles = distanceInM / 1609.34;
            
            if (distanceInMiles <= radiusMiles) {
              crimes.push({
                id: doc.id,
                lat: docLat,
                lng: docLng, // Standardize to 'lng' in our Crime interface
                type: data.type || 'unknown',
                date: data.date || '',
                time: data.time || data.hour?.toString() || '', // Use 'hour' field if 'time' doesn't exist
                geohash: data.geohash || '',
              });
            }
          } catch (distError) {
            // Skip crimes with distance calculation errors
            return;
          }
        });
      } catch (boundError) {
        console.warn('⚠️ Error querying bound:', bound, boundError);
        // Continue with next bound instead of failing entirely
        continue;
      }
    }
    
    console.log(`✅ Found ${crimes.length} crimes within ${radiusMiles} mile(s)`);
    return crimes;
  } catch (error) {
    console.error('❌ Error querying crimes:', error);
    console.log('⚠️ Attempting fallback bounding box query...');
    
    // Fallback: Use simple bounding box instead of geohash
    return await fallbackBoundingBoxQuery(cleanLat, cleanLng, radiusMiles);
  }
}

/**
 * Fallback method using bounding box instead of geohash
 */
async function fallbackBoundingBoxQuery(
  lat: number,
  lng: number,
  radiusMiles: number
): Promise<Crime[]> {
  try {
    // Calculate bounding box (approximate)
    const latDegreePerMile = 1 / 69; // 1 degree latitude = ~69 miles
    const lngDegreePerMile = 1 / (69 * Math.cos((lat * Math.PI) / 180)); // Adjusted for latitude
    
    const latMin = lat - (radiusMiles * latDegreePerMile);
    const latMax = lat + (radiusMiles * latDegreePerMile);
    const lngMin = lng - (radiusMiles * lngDegreePerMile);
    const lngMax = lng + (radiusMiles * lngDegreePerMile);
    
    console.log(`📦 Bounding box: lat ${latMin} to ${latMax}, lng ${lngMin} to ${lngMax}`);
    
    // Query crimes within bounding box
    const q = query(
      collection(db, 'crime_data_la'),
      where('lat', '>=', latMin),
      where('lat', '<=', latMax)
    );
    
    const snapshot = await getDocs(q);
    const crimes: Crime[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Get coordinates - database uses 'lon' not 'lng'
      let docLat = data.lat;
      let docLng = data.lon || data.lng || data.longitude;
      
      // Convert to numbers if they're strings
      if (typeof docLat === 'string') docLat = parseFloat(docLat);
      if (typeof docLng === 'string') docLng = parseFloat(docLng);
      
      // Validate coordinates
      if (typeof docLat !== 'number' || typeof docLng !== 'number' || isNaN(docLat) || isNaN(docLng)) {
        return;
      }
      
      // Check if within longitude bounds
      if (docLng < lngMin || docLng > lngMax) {
        return;
      }
      
      // Calculate actual distance
      const R = 3959; // Earth's radius in miles
      const dLat = (docLat - lat) * (Math.PI / 180);
      const dLng = (docLng - lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * (Math.PI / 180)) * Math.cos(docLat * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      if (distance <= radiusMiles) {
        crimes.push({
          id: doc.id,
          lat: docLat,
          lng: docLng, // Standardize to 'lng' in our interface
          type: data.type || 'unknown',
          date: data.date || '',
          time: data.time || data.hour?.toString() || '',
          geohash: data.geohash || '',
        });
      }
    });
    
    console.log(`✅ Fallback found ${crimes.length} crimes`);
    return crimes;
  } catch (error) {
    console.error('❌ Fallback query also failed:', error);
    return [];
  }
}

/**
 * Analyze crimes by hour of day
 */
export function analyzeCrimeByHour(crimes: Crime[]): { [hour: number]: number } {
  const hourCounts: { [hour: number]: number } = {};
  
  // Initialize all hours to 0
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }
  
  crimes.forEach((crime) => {
    if (crime.time) {
      const hour = parseInt(crime.time.split(':')[0]);
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        hourCounts[hour]++;
      }
    }
  });
  
  return hourCounts;
}

/**
 * Calculate overall crime score (1-10, higher is safer)
 */
export function calculateCrimeScore(crimes: Crime[]): number {
  const crimeCount = crimes.length;
  
  // Score based on crime count in a 5-mile radius
  // 0 crimes = 10/10 (perfect)
  // 1-5 crimes = 9/10 (excellent)
  // 6-10 crimes = 8/10 (very good)
  // 11-20 crimes = 7/10 (good)
  // 21-30 crimes = 6/10 (above average)
  // 31-50 crimes = 5/10 (average)
  // 51-75 crimes = 4/10 (below average)
  // 76-100 crimes = 3/10 (concerning)
  // 101-150 crimes = 2/10 (high risk)
  // 150+ crimes = 1/10 (very high risk)
  
  if (crimeCount === 0) return 10;
  if (crimeCount <= 5) return 9;
  if (crimeCount <= 10) return 8;
  if (crimeCount <= 20) return 7;
  if (crimeCount <= 30) return 6;
  if (crimeCount <= 50) return 5;
  if (crimeCount <= 75) return 4;
  if (crimeCount <= 100) return 3;
  if (crimeCount <= 150) return 2;
  return 1;
}

/**
 * Calculate user's exposure to crime based on their active hours
 */
export function calculateUserExposure(
  crimeByHour: { [hour: number]: number },
  userActiveHours: number[]
): {
  exposure: 'low' | 'medium' | 'high';
  riskHours: number[];
  riskPercentage: number;
} {
  // If no crimes at all, exposure is low
  const totalCrimes = Object.values(crimeByHour).reduce((sum, count) => sum + count, 0);
  
  if (totalCrimes === 0) {
    return {
      exposure: 'low',
      riskHours: [],
      riskPercentage: 0,
    };
  }
  
  // Calculate crimes during user's active hours
  let crimesInActiveHours = 0;
  userActiveHours.forEach((hour) => {
    crimesInActiveHours += crimeByHour[hour] || 0;
  });
  
  const riskPercentage = (crimesInActiveHours / totalCrimes) * 100;
  
  // Find high-risk hours (hours with above-average crime)
  const avgCrimesPerHour = totalCrimes / 24;
  const riskHours = Object.entries(crimeByHour)
    .filter(([_, count]) => count > avgCrimesPerHour)
    .map(([hour]) => parseInt(hour))
    .filter((hour) => userActiveHours.includes(hour));
  
  // Determine exposure level
  let exposure: 'low' | 'medium' | 'high';
  if (riskPercentage < 20) {
    exposure = 'low';
  } else if (riskPercentage < 50) {
    exposure = 'medium';
  } else {
    exposure = 'high';
  }
  
  return {
    exposure,
    riskHours,
    riskPercentage: Math.round(riskPercentage),
  };
}

/**
 * Get crime description based on score
 */
export function getCrimeDescription(score: number): string {
  if (score >= 9) return 'Very Safe';
  if (score >= 7) return 'Safe';
  if (score >= 5) return 'Average';
  if (score >= 3) return 'Concerning';
  return 'High Risk';
}

/**
 * Get exposure description
 */
export function getExposureDescription(exposure: 'low' | 'medium' | 'high'): string {
  switch (exposure) {
    case 'low':
      return 'Low crime exposure during your active hours';
    case 'medium':
      return 'Moderate crime exposure during your active hours';
    case 'high':
      return 'High crime exposure during your active hours';
  }
}
