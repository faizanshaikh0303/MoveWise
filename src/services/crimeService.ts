// Crime Service - Handles all crime data queries and analysis
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as geofire from 'geofire-common';

export interface Crime {
  id: string;
  lat: number;
  lng: number;
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
  
  // Validate coordinates
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    console.error('❌ Invalid coordinates:', { lat, lng });
    return [];
  }
  
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.error('❌ Coordinates out of range:', { lat, lng });
    return [];
  }
  
  const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters
  const center: [number, number] = [lat, lng]; // Explicitly type as tuple
  
  let bounds;
  try {
    bounds = geofire.geohashQueryBounds(center, radiusMeters);
  } catch (error) {
    console.error('❌ Error generating geohash bounds:', error);
    console.log('Center value:', center, 'Types:', typeof center[0], typeof center[1]);
    return [];
  }
  
  const crimes: Crime[] = [];
  
  try {
    for (const bound of bounds) {
      const q = query(
        collection(db, 'crime_data_la'),
        where('geohash', '>=', bound[0]),
        where('geohash', '<=', bound[1])
      );
      
      const snapshot = await getDocs(q);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const docLat = data.lat;
        const docLng = data.lng;
        
        // Calculate distance to verify it's within radius
        const distanceInM = geofire.distanceBetween([docLat, docLng], center);
        const distanceInMiles = distanceInM / 1609.34;
        
        if (distanceInMiles <= radiusMiles) {
          crimes.push({
            id: doc.id,
            lat: docLat,
            lng: docLng,
            type: data.type || 'unknown',
            date: data.date || '',
            time: data.time || '',
            geohash: data.geohash || '',
          });
        }
      });
    }
    
    console.log(`✅ Found ${crimes.length} crimes within ${radiusMiles} mile(s)`);
    return crimes;
  } catch (error) {
    console.error('❌ Error querying crimes:', error);
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
