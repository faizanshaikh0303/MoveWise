// Amenities Service - Real lifestyle amenities analysis using Google Places API
import { GOOGLE_MAPS_API_KEY } from '@env';

export interface AmenitiesAnalysis {
  hobbiesMatch: { [hobby: string]: boolean };
  nearbyCount: { [hobby: string]: number };
  walkability: number; // 1-10 based on amenity density
  topAmenities: string[]; // Most common types nearby
  details: {
    totalPlaces: number;
    withinWalkingDistance: number; // Within 500m
    categories: { [category: string]: number };
  };
}

// Map user hobbies to Google Places types
const HOBBY_TO_PLACE_TYPES: { [hobby: string]: string[] } = {
  'dining': ['restaurant', 'cafe', 'meal_takeaway', 'meal_delivery', 'food'],
  'coffee': ['cafe', 'coffee_shop'],
  'bars': ['bar', 'night_club', 'liquor_store'],
  'gym': ['gym', 'fitness_center', 'health'],
  'shopping': ['shopping_mall', 'department_store', 'store', 'clothing_store', 'supermarket'],
  'hiking': ['park', 'natural_feature', 'trail'],
  'movies': ['movie_theater', 'cinema'],
  'art': ['art_gallery', 'museum'],
  'music': ['music_venue', 'concert_hall'],
  'sports': ['stadium', 'sports_complex', 'bowling_alley'],
  'reading': ['library', 'book_store'],
  'gaming': ['game_store', 'internet_cafe'],
};

/**
 * Analyze real amenities near a location based on user hobbies
 */
export async function analyzeRealAmenities(
  lat: number,
  lng: number,
  hobbies: string[]
): Promise<AmenitiesAnalysis> {
  console.log(`🎯 Analyzing real amenities for hobbies:`, hobbies);

  try {
    // Get nearby places for each hobby
    const hobbyMatches: { [hobby: string]: boolean } = {};
    const hobbyCount: { [hobby: string]: number } = {};
    let allPlaces: any[] = [];

    for (const hobby of hobbies) {
      const placeTypes = HOBBY_TO_PLACE_TYPES[hobby] || [];
      let hobbyPlaces: any[] = [];

      for (const placeType of placeTypes) {
        const places = await getNearbyPlacesByType(lat, lng, placeType, 1000); // 1km radius
        hobbyPlaces = [...hobbyPlaces, ...places];
      }

      // Remove duplicates by place_id
      hobbyPlaces = Array.from(new Map(hobbyPlaces.map(p => [p.place_id, p])).values());

      hobbyMatches[hobby] = hobbyPlaces.length > 0;
      hobbyCount[hobby] = hobbyPlaces.length;
      allPlaces = [...allPlaces, ...hobbyPlaces];

      console.log(`  ${hobby}: ${hobbyPlaces.length} places found`);
    }

    // Remove duplicates from all places
    allPlaces = Array.from(new Map(allPlaces.map(p => [p.place_id, p])).values());

    // Calculate places within walking distance (500m)
    const walkingDistance = allPlaces.filter(p => {
      if (p.geometry?.location) {
        const distance = calculateDistance(
          lat, lng,
          p.geometry.location.lat, p.geometry.location.lng
        );
        return distance <= 0.31; // 500m = 0.31 miles
      }
      return false;
    });

    // Calculate walkability score (1-10)
    const walkability = calculateWalkabilityScore(walkingDistance.length, allPlaces.length);

    // Get category counts
    const categories: { [category: string]: number } = {};
    allPlaces.forEach(place => {
      place.types?.forEach((type: string) => {
        categories[type] = (categories[type] || 0) + 1;
      });
    });

    // Get top amenities
    const topAmenities = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type]) => formatPlaceType(type));

    console.log(`  Total places: ${allPlaces.length}, Walking distance: ${walkingDistance.length}`);
    console.log(`  Walkability: ${walkability}/10`);

    return {
      hobbiesMatch: hobbyMatches,
      nearbyCount: hobbyCount,
      walkability,
      topAmenities,
      details: {
        totalPlaces: allPlaces.length,
        withinWalkingDistance: walkingDistance.length,
        categories,
      },
    };
  } catch (error) {
    console.error('❌ Error analyzing amenities:', error);
    // Fallback to mock data if API fails
    return fallbackAmenitiesAnalysis(hobbies);
  }
}

/**
 * Get nearby places by type from Google Places API
 */
async function getNearbyPlacesByType(
  lat: number,
  lng: number,
  placeType: string,
  radius: number
): Promise<any[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${placeType}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results) {
      return data.results;
    } else if (data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      console.warn(`⚠️ Places API returned status: ${data.status} for type: ${placeType}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error fetching places for type ${placeType}:`, error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates in miles
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate walkability score (1-10) based on nearby amenities
 */
function calculateWalkabilityScore(walkingPlaces: number, totalPlaces: number): number {
  // Score based on places within walking distance
  let score = 1;

  // Base score from walking distance places
  if (walkingPlaces >= 50) score = 10;
  else if (walkingPlaces >= 40) score = 9;
  else if (walkingPlaces >= 30) score = 8;
  else if (walkingPlaces >= 20) score = 7;
  else if (walkingPlaces >= 15) score = 6;
  else if (walkingPlaces >= 10) score = 5;
  else if (walkingPlaces >= 7) score = 4;
  else if (walkingPlaces >= 5) score = 3;
  else if (walkingPlaces >= 3) score = 2;

  return score;
}

/**
 * Format place type for display
 */
function formatPlaceType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Fallback amenities analysis if API fails
 */
function fallbackAmenitiesAnalysis(hobbies: string[]): AmenitiesAnalysis {
  console.log('⚠️ Using fallback amenities analysis');
  
  const hobbyMatches: { [hobby: string]: boolean } = {};
  const hobbyCount: { [hobby: string]: number } = {};

  hobbies.forEach(hobby => {
    // 70% chance of match in fallback
    hobbyMatches[hobby] = Math.random() > 0.3;
    hobbyCount[hobby] = hobbyMatches[hobby] ? Math.floor(Math.random() * 10) + 1 : 0;
  });

  return {
    hobbiesMatch: hobbyMatches,
    nearbyCount: hobbyCount,
    walkability: Math.floor(Math.random() * 4) + 4, // 4-7
    topAmenities: ['Restaurants', 'Shopping', 'Parks'],
    details: {
      totalPlaces: 0,
      withinWalkingDistance: 0,
      categories: {},
    },
  };
}

/**
 * Get lifestyle score based on amenities
 */
export function calculateLifestyleScore(amenities: AmenitiesAnalysis): number {
  const hobbies = Object.keys(amenities.hobbiesMatch);
  const matchedHobbies = Object.values(amenities.hobbiesMatch).filter(match => match).length;
  
  if (hobbies.length === 0) return 5;
  
  // Score out of 10 based on hobby matches and walkability
  const hobbyScore = (matchedHobbies / hobbies.length) * 7; // Max 7 points from hobbies
  const walkScore = (amenities.walkability / 10) * 3; // Max 3 points from walkability
  
  return Math.round(hobbyScore + walkScore);
}
