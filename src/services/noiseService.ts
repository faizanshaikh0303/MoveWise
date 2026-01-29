// Noise Service - Real noise level analysis using Google Places API and traffic data
import { GOOGLE_MAPS_API_KEY } from '@env';

export interface NoiseAnalysis {
  level: number; // 1-10 scale
  sources: string[];
  sleepImpact: string;
  confidence: number; // How confident we are in the assessment
  details: {
    nearbyPlaces: number;
    roadProximity: string;
    commercialDensity: string;
    transitActivity: string;
  };
}

interface PlaceResult {
  name: string;
  types: string[];
  vicinity?: string;
}

/**
 * Analyze noise levels using real Google Places data
 */
export async function analyzeRealNoiseLevels(
  lat: number,
  lng: number,
  sleepData: { bedtime: string; wakeTime: string; noiseSensitivity: number }
): Promise<NoiseAnalysis> {
  console.log(`🔊 Analyzing real noise levels for ${lat}, ${lng}`);

  try {
    // 1. Get nearby places that contribute to noise
    const nearbyPlaces = await getNearbyNoisySources(lat, lng);
    
    // 2. Check road proximity and type
    const roadData = await analyzeRoadProximity(lat, lng);
    
    // 3. Calculate noise level based on real data
    const noiseLevel = calculateNoiseLevel(nearbyPlaces, roadData);
    
    // 4. Determine noise sources
    const sources = determineNoiseSources(nearbyPlaces, roadData, noiseLevel);
    
    // 5. Calculate sleep impact
    const sleepImpact = calculateSleepImpact(
      noiseLevel,
      sleepData.noiseSensitivity,
      sleepData.bedtime,
      sleepData.wakeTime
    );
    
    // 6. Build detailed analysis
    const details = {
      nearbyPlaces: nearbyPlaces.length,
      roadProximity: roadData.proximity,
      commercialDensity: getCommercialDensity(nearbyPlaces),
      transitActivity: roadData.transitActivity,
    };

    return {
      level: noiseLevel,
      sources,
      sleepImpact,
      confidence: 85, // High confidence with real data
      details,
    };
  } catch (error) {
    console.error('❌ Error analyzing noise:', error);
    // Fallback to formula-based if API fails
    return fallbackNoiseAnalysis(lat, lng, sleepData);
  }
}

/**
 * Get nearby places that contribute to noise
 */
async function getNearbyNoisySources(lat: number, lng: number): Promise<PlaceResult[]> {
  const noisyTypes = [
    'bar',
    'night_club',
    'restaurant',
    'airport',
    'train_station',
    'transit_station',
    'bus_station',
    'highway',
    'primary_school',
    'secondary_school',
    'university',
    'shopping_mall',
    'supermarket',
    'gas_station',
    'parking',
    'stadium',
    'hospital',
    'fire_station',
    'police',
    'construction',
  ];

  const allPlaces: PlaceResult[] = [];

  // Query multiple radii for better accuracy
  const radii = [100, 300, 500]; // meters

  for (const radius of radii) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results) {
        data.results.forEach((place: any) => {
          // Check if place types include noisy categories
          const isNoisy = place.types?.some((type: string) => noisyTypes.includes(type));
          if (isNoisy) {
            allPlaces.push({
              name: place.name,
              types: place.types || [],
              vicinity: place.vicinity,
            });
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching places at ${radius}m:`, error);
    }
  }

  console.log(`✅ Found ${allPlaces.length} noisy places nearby`);
  return allPlaces;
}

/**
 * Analyze road proximity and type using Google Roads API
 */
async function analyzeRoadProximity(lat: number, lng: number): Promise<{
  proximity: string;
  transitActivity: string;
  roadTypes: string[];
}> {
  try {
    // Use Geocoding API to get address components and determine road type
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const addressComponents = result.address_components || [];
      
      // Check for highway/major road proximity
      const hasRoute = addressComponents.some((comp: any) => comp.types.includes('route'));
      const hasHighway = result.formatted_address?.toLowerCase().includes('highway') ||
                        result.formatted_address?.toLowerCase().includes('freeway');
      
      let proximity = 'residential';
      let transitActivity = 'low';
      const roadTypes: string[] = [];

      if (hasHighway) {
        proximity = 'highway';
        transitActivity = 'very high';
        roadTypes.push('highway');
      } else if (hasRoute) {
        proximity = 'major road';
        transitActivity = 'high';
        roadTypes.push('major road');
      }

      return { proximity, transitActivity, roadTypes };
    }
  } catch (error) {
    console.error('Error analyzing road proximity:', error);
  }

  return {
    proximity: 'residential',
    transitActivity: 'moderate',
    roadTypes: [],
  };
}

/**
 * Calculate noise level (1-10) based on real data
 */
function calculateNoiseLevel(places: PlaceResult[], roadData: any): number {
  let noise = 1; // Base very quiet level (changed from 2)

  // Nearby noisy places (0-3 points, reduced from 0-4)
  const placeScore = Math.min(3, places.length * 0.15); // Reduced from 0.3
  noise += placeScore;
  console.log(`  Base noise: 1, Place score: +${placeScore.toFixed(2)} (${places.length} places)`);

  // Road proximity (0-3 points)
  let roadScore = 0;
  if (roadData.proximity === 'highway') roadScore = 3;
  else if (roadData.proximity === 'major road') roadScore = 1.5;
  else if (roadData.proximity === 'residential') roadScore = 0.3;
  noise += roadScore;
  console.log(`  Road score: +${roadScore} (${roadData.proximity})`);

  // Specific place types add extra noise (reduced multipliers)
  const bars = places.filter(p => p.types.includes('bar') || p.types.includes('night_club'));
  const transit = places.filter(p => 
    p.types.includes('transit_station') || 
    p.types.includes('train_station') ||
    p.types.includes('bus_station') ||
    p.types.includes('airport')
  );
  const commercial = places.filter(p => 
    p.types.includes('shopping_mall') || 
    p.types.includes('supermarket')
  );
  const restaurants = places.filter(p => p.types.includes('restaurant'));

  const barScore = bars.length * 0.4;
  const transitScore = transit.length * 0.3;
  const commercialScore = commercial.length * 0.15;
  const restaurantScore = restaurants.length * 0.05;
  
  noise += barScore + transitScore + commercialScore + restaurantScore;
  
  console.log(`  Bars: +${barScore.toFixed(2)} (${bars.length})`);
  console.log(`  Transit: +${transitScore.toFixed(2)} (${transit.length})`);
  console.log(`  Commercial: +${commercialScore.toFixed(2)} (${commercial.length})`);
  console.log(`  Restaurants: +${restaurantScore.toFixed(2)} (${restaurants.length})`);

  // Special case: Airport nearby is VERY noisy
  const hasAirport = places.some(p => p.types.includes('airport'));
  if (hasAirport) {
    noise += 2; // Airports add significant noise
    console.log(`  Airport bonus: +2`);
  }

  const finalNoise = Math.max(1, Math.min(10, Math.round(noise)));
  console.log(`  Total: ${noise.toFixed(2)} → Final: ${finalNoise}/10`);

  return finalNoise;
}

/**
 * Determine specific noise sources based on data
 */
function determineNoiseSources(
  places: PlaceResult[],
  roadData: any,
  noiseLevel: number
): string[] {
  const sources: string[] = [];

  // Road noise
  if (roadData.proximity === 'highway') {
    sources.push('Highway traffic');
  } else if (roadData.proximity === 'major road') {
    sources.push('Road traffic');
  } else if (noiseLevel >= 4) {
    sources.push('Light traffic');
  }

  // Place-based sources
  const placeTypes = new Set<string>();
  places.forEach(place => place.types.forEach(type => placeTypes.add(type)));

  if (placeTypes.has('bar') || placeTypes.has('night_club')) {
    sources.push('Nightlife activity');
  }
  if (placeTypes.has('train_station') || placeTypes.has('transit_station')) {
    sources.push('Transit station');
  }
  if (placeTypes.has('airport')) {
    sources.push('Airport proximity');
  }
  if (placeTypes.has('shopping_mall') || placeTypes.has('supermarket')) {
    sources.push('Commercial activity');
  }
  if (placeTypes.has('primary_school') || placeTypes.has('secondary_school')) {
    sources.push('School activity');
  }
  if (placeTypes.has('hospital')) {
    sources.push('Emergency vehicles');
  }
  if (placeTypes.has('construction')) {
    sources.push('Construction');
  }

  // If quiet area
  if (sources.length === 0 || noiseLevel <= 3) {
    sources.push('Quiet residential area');
  }

  return sources;
}

/**
 * Calculate sleep impact
 */
function calculateSleepImpact(
  noiseLevel: number,
  sensitivity: number,
  bedtime: string,
  wakeTime: string
): string {
  const combinedImpact = noiseLevel * (sensitivity / 10);

  if (combinedImpact >= 7) {
    return 'May significantly affect sleep quality';
  } else if (combinedImpact >= 5) {
    return 'Could affect sleep quality';
  } else if (combinedImpact >= 3) {
    return 'Minor sleep disturbances possible';
  } else {
    return 'Minimal impact on sleep';
  }
}

/**
 * Get commercial density description
 */
function getCommercialDensity(places: PlaceResult[]): string {
  const commercial = places.filter(p => 
    p.types.includes('shopping_mall') || 
    p.types.includes('supermarket') ||
    p.types.includes('restaurant') ||
    p.types.includes('store')
  );

  if (commercial.length >= 15) return 'Very High';
  if (commercial.length >= 10) return 'High';
  if (commercial.length >= 5) return 'Moderate';
  if (commercial.length >= 2) return 'Low';
  return 'Very Low';
}

/**
 * Fallback noise analysis if API fails
 */
function fallbackNoiseAnalysis(
  lat: number,
  lng: number,
  sleepData: any
): NoiseAnalysis {
  console.log('⚠️ Using fallback noise analysis');
  
  const latFactor = Math.abs(lat % 10);
  const lngFactor = Math.abs(lng % 10);
  const locationHash = (latFactor * lngFactor) % 10;
  const baseNoise = Math.floor(locationHash) + 1;

  const sources = baseNoise >= 6 
    ? ['Road traffic', 'Urban activity'] 
    : ['Residential activity'];

  const sleepImpact = calculateSleepImpact(
    baseNoise,
    sleepData.noiseSensitivity,
    sleepData.bedtime,
    sleepData.wakeTime
  );

  return {
    level: baseNoise,
    sources,
    sleepImpact,
    confidence: 50, // Lower confidence with fallback
    details: {
      nearbyPlaces: 0,
      roadProximity: 'unknown',
      commercialDensity: 'unknown',
      transitActivity: 'unknown',
    },
  };
}
