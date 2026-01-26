import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface Crime {
  lat: number;
  lon: number;
  hour: number;
  type: string;
  area: string;
  year: number;
  month: number;
  geohash: string;
}

// Query crimes near a location using geohash
export async function queryCrimesNearLocation(
  lat: number,
  lng: number,
  radiusMiles: number = 1
): Promise<Crime[]> {
  try {
    console.log(`🔍 Querying crimes near ${lat}, ${lng} (radius: ${radiusMiles} miles)`);
    
    // For now, get all crimes and filter by distance
    // Later we'll optimize with geohash queries
    const crimesRef = collection(db, 'crime_data_la');
    const snapshot = await getDocs(crimesRef);
    
    const crimes: Crime[] = [];
    const radiusInDegrees = radiusMiles / 69; // Rough conversion: 1 degree ≈ 69 miles
    
    snapshot.forEach((doc) => {
      const data = doc.data() as Crime;
      
      // Calculate distance (simple euclidean for now)
      const distance = Math.sqrt(
        Math.pow(data.lat - lat, 2) + Math.pow(data.lon - lng, 2)
      );
      
      if (distance <= radiusInDegrees) {
        crimes.push(data);
      }
    });
    
    console.log(`✅ Found ${crimes.length} crimes within ${radiusMiles} mile(s)`);
    return crimes;
    
  } catch (error) {
    console.error('Error querying crimes:', error);
    throw error;
  }
}

// Analyze crime patterns by hour of day
export function analyzeCrimeByHour(crimes: Crime[]): { [hour: number]: number } {
  const hourCounts: { [hour: number]: number } = {};
  
  // Initialize all hours to 0
  for (let h = 0; h < 24; h++) {
    hourCounts[h] = 0;
  }
  
  // Count crimes by hour
  crimes.forEach(crime => {
    hourCounts[crime.hour] = (hourCounts[crime.hour] || 0) + 1;
  });
  
  return hourCounts;
}

// Get peak crime hours (top 5)
export function getPeakCrimeHours(hourCounts: { [hour: number]: number }): number[] {
  return Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .slice(0, 5)
    .map(([hour]) => parseInt(hour));
}

// Calculate crime score (0-10, where 10 is safest)
export function calculateCrimeScore(crimes: Crime[]): number {
  if (crimes.length === 0) return 10;
  
  // Simple scoring based on crime density
  // 0 crimes = 10, 50+ crimes = 0
  const score = Math.max(0, 10 - (crimes.length / 5));
  
  return parseFloat(score.toFixed(1));
}

// Calculate user's exposure to crime based on their active hours
export function calculateUserExposure(
  hourCounts: { [hour: number]: number },
  userActiveHours: number[]
): {
  overlapPercentage: number;
  exposure: 'low' | 'medium' | 'high';
  riskHours: number[];
} {
  const peakHours = getPeakCrimeHours(hourCounts);
  
  // Find overlap between user's active hours and peak crime hours
  const riskHours = userActiveHours.filter(h => peakHours.includes(h));
  const overlapPercentage = (riskHours.length / peakHours.length) * 100;
  
  let exposure: 'low' | 'medium' | 'high';
  if (overlapPercentage < 20) {
    exposure = 'low';
  } else if (overlapPercentage < 50) {
    exposure = 'medium';
  } else {
    exposure = 'high';
  }
  
  return {
    overlapPercentage,
    exposure,
    riskHours
  };
}

// Analyze crime types
export function analyzeCrimeTypes(crimes: Crime[]): { [type: string]: number } {
  const typeCounts: { [type: string]: number } = {};
  
  crimes.forEach(crime => {
    typeCounts[crime.type] = (typeCounts[crime.type] || 0) + 1;
  });
  
  return typeCounts;
}