// Analysis Service - Combines all data sources for comprehensive lifestyle impact analysis
import { queryCrimesNearLocation, analyzeCrimeByHour, calculateCrimeScore, calculateUserExposure } from './crimeService';
import { generatePersonalizedInsights, AnalysisData, GroqInsight } from './groqService';

export interface ComprehensiveAnalysis {
  // Crime Analysis
  currentCrimeData: {
    totalCrimes: number;
    score: number;
    peakHours: number[];
    exposure: 'low' | 'medium' | 'high';
  };
  newCrimeData: {
    totalCrimes: number;
    score: number;
    peakHours: number[];
    exposure: 'low' | 'medium' | 'high';
  };

  // Noise Analysis
  currentNoise: {
    level: number;
    sources: string[];
    sleepImpact: string;
  };
  newNoise: {
    level: number;
    sources: string[];
    sleepImpact: string;
  };

  // Commute Analysis
  commute: {
    currentTime: number;
    newTime: number;
    change: number;
    impact: string;
  };

  // Lifestyle Match
  lifestyleScore: {
    overall: number;
    amenitiesNearby: { [hobby: string]: boolean };
    walkability: number;
  };

  // AI Insights
  aiInsights: GroqInsight;

  // Overall
  overallRecommendation: 'highly-recommended' | 'recommended' | 'consider-carefully' | 'not-recommended';
  confidenceScore: number;
}

export interface UserProfile {
  addresses: {
    current: { description: string; lat: number; lng: number };
    new: { description: string; lat: number; lng: number };
    distance: number;
  };
  work: {
    location?: string;
    workDays: string[];
    workHours: { start: string; end: string };
    commuteMethod: string;
  };
  sleep: {
    bedtime: string;
    wakeTime: string;
    noiseSensitivity: number;
    weekendDifferent: boolean;
    weekendSleep?: { bedtime: string; wakeTime: string };
  };
  lifestyle: {
    hobbies: string[];
    activityTimes: string[];
  };
}

/**
 * Main analysis function - combines all data sources
 */
export async function analyzeMove(
  userProfile: UserProfile,
  groqApiKey: string
): Promise<ComprehensiveAnalysis> {
  console.log('🔍 Starting comprehensive analysis...');

  // 1. Analyze Crime Data
  console.log('📊 Analyzing crime data...');
  console.log('Current address coordinates:', userProfile.addresses.current);
  console.log('New address coordinates:', userProfile.addresses.new);
  
  // Ensure coordinates are numbers (handle potential string values)
  const currentLat = Number(userProfile.addresses.current.lat);
  const currentLng = Number(userProfile.addresses.current.lng);
  const newLat = Number(userProfile.addresses.new.lat);
  const newLng = Number(userProfile.addresses.new.lng);
  
  console.log('Converted - Current:', currentLat, currentLng);
  console.log('Converted - New:', newLat, newLng);
  
  const currentCrimes = await queryCrimesNearLocation(
    currentLat,
    currentLng,
    5 // 5 mile radius for more comprehensive data
  );
  
  const newCrimes = await queryCrimesNearLocation(
    newLat,
    newLng,
    5
  );

  // Get user's active hours based on their schedule
  const userActiveHours = getUserActiveHours(userProfile);
  
  const currentCrimeHours = analyzeCrimeByHour(currentCrimes);
  const newCrimeHours = analyzeCrimeByHour(newCrimes);
  
  const currentExposure = calculateUserExposure(currentCrimeHours, userActiveHours);
  const newExposure = calculateUserExposure(newCrimeHours, userActiveHours);

  const currentCrimeData = {
    totalCrimes: currentCrimes.length,
    score: calculateCrimeScore(currentCrimes),
    peakHours: Object.entries(currentCrimeHours)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour]) => parseInt(hour)),
    exposure: currentExposure.exposure,
  };

  const newCrimeData = {
    totalCrimes: newCrimes.length,
    score: calculateCrimeScore(newCrimes),
    peakHours: Object.entries(newCrimeHours)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour]) => parseInt(hour)),
    exposure: newExposure.exposure,
  };

  // 2. Analyze Noise Levels
  console.log('🔊 Analyzing noise levels...');
  const currentNoise = await analyzeNoiseLevels(
    currentLat,
    currentLng,
    userProfile.sleep
  );

  const newNoise = await analyzeNoiseLevels(
    newLat,
    newLng,
    userProfile.sleep
  );

  // 3. Analyze Commute
  console.log('🚗 Analyzing commute times...');
  const commuteAnalysis = await analyzeCommute(
    userProfile.addresses.current,
    userProfile.addresses.new,
    userProfile.work
  );

  // 4. Analyze Lifestyle Match
  console.log('🎯 Analyzing lifestyle compatibility...');
  const lifestyleScore = await analyzeLifestyleMatch(
    userProfile.addresses.new,
    userProfile.lifestyle
  );

  // 5. Generate AI Insights with Groq
  console.log('🤖 Generating AI insights...');
  const analysisData: AnalysisData = {
    currentAddress: userProfile.addresses.current,
    newAddress: userProfile.addresses.new,
    distance: userProfile.addresses.distance,
    currentCrimeScore: currentCrimeData.score,
    newCrimeScore: newCrimeData.score,
    crimeExposure: {
      current: currentCrimeData.exposure,
      new: newCrimeData.exposure,
      riskHours: currentExposure.riskHours,
    },
    currentNoiseLevel: currentNoise.level,
    newNoiseLevel: newNoise.level,
    noiseImpact: newNoise.sleepImpact,
    currentCommute: commuteAnalysis.currentTime ? {
      time: commuteAnalysis.currentTime,
      method: userProfile.work.commuteMethod,
    } : undefined,
    newCommute: {
      time: commuteAnalysis.newTime,
      method: userProfile.work.commuteMethod,
    },
    hobbies: userProfile.lifestyle.hobbies,
    activityTimes: userProfile.lifestyle.activityTimes,
    sleepSchedule: {
      bedtime: userProfile.sleep.bedtime,
      wakeTime: userProfile.sleep.wakeTime,
    },
    workSchedule: {
      workDays: userProfile.work.workDays,
      workHours: userProfile.work.workHours,
    },
    noiseSensitivity: userProfile.sleep.noiseSensitivity,
  };

  const aiInsights = await generatePersonalizedInsights(analysisData, groqApiKey);

  // 6. Calculate Overall Recommendation
  const overallRecommendation = calculateOverallRecommendation({
    crimeScoreChange: newCrimeData.score - currentCrimeData.score,
    noiseChange: newNoise.level - currentNoise.level,
    commuteChange: commuteAnalysis.change,
    lifestyleScore: lifestyleScore.overall,
    aiScore: aiInsights.overallScore,
  });

  console.log('✅ Analysis complete!');

  return {
    currentCrimeData,
    newCrimeData,
    currentNoise,
    newNoise,
    commute: commuteAnalysis,
    lifestyleScore,
    aiInsights,
    overallRecommendation: overallRecommendation.recommendation,
    confidenceScore: overallRecommendation.confidence,
  };
}

/**
 * Get user's active hours from their schedule
 */
function getUserActiveHours(profile: UserProfile): number[] {
  const hours: number[] = [];
  
  // Work hours
  const [workStartHour] = profile.work.workHours.start.split(':').map(Number);
  const [workEndHour] = profile.work.workHours.end.split(':').map(Number);
  for (let h = workStartHour; h <= workEndHour; h++) {
    if (!hours.includes(h)) hours.push(h);
  }
  
  // Activity times mapping
  const timeRanges: { [key: string]: number[] } = {
    'early-morning': [5, 6, 7],
    'morning': [8, 9, 10, 11],
    'afternoon': [12, 13, 14, 15, 16],
    'evening': [17, 18, 19, 20],
    'night': [21, 22, 23],
    'late-night': [0, 1, 2],
  };
  
  profile.lifestyle.activityTimes.forEach(timeId => {
    const range = timeRanges[timeId] || [];
    range.forEach(h => {
      if (!hours.includes(h)) hours.push(h);
    });
  });
  
  return hours.sort((a, b) => a - b);
}

/**
 * Analyze noise levels with realistic variation based on location
 */
async function analyzeNoiseLevels(
  lat: number,
  lng: number,
  sleepData: UserProfile['sleep']
): Promise<{ level: number; sources: string[]; sleepImpact: string }> {
  // Mock implementation with more realistic variation
  // In production, would use Google Places API, traffic data, etc.
  
  // Use lat/lng to create consistent but varied noise levels
  const latFactor = Math.abs(lat % 10);
  const lngFactor = Math.abs(lng % 10);
  const locationHash = (latFactor * lngFactor) % 10;
  
  // Generate noise level 1-10 based on location
  let baseNoise = Math.floor(locationHash) + 1;
  
  // Add some randomness but keep it realistic
  const variance = (Math.random() - 0.5) * 2; // -1 to +1
  baseNoise = Math.max(1, Math.min(10, Math.floor(baseNoise + variance)));
  
  const sources: string[] = [];
  
  // Add realistic noise sources based on level
  if (baseNoise >= 8) {
    sources.push('Heavy traffic', 'Commercial activity', 'Highway proximity');
  } else if (baseNoise >= 6) {
    sources.push('Road traffic', 'Urban activity');
  } else if (baseNoise >= 4) {
    sources.push('Residential activity');
    if (Math.random() > 0.5) sources.push('Light traffic');
  } else {
    sources.push('Quiet residential area');
  }
  
  // Random chance of construction or nightlife
  if (Math.random() > 0.7 && baseNoise >= 4) {
    sources.push('Construction');
  }
  if (Math.random() > 0.6 && baseNoise >= 6) {
    sources.push('Nightlife');
  }
  
  const [bedHour] = sleepData.bedtime.split(':').map(Number);
  const [wakeHour] = sleepData.wakeTime.split(':').map(Number);
  
  // Calculate sleep impact based on noise level AND user sensitivity
  let sleepImpact = 'Minimal impact on sleep';
  const combinedImpact = baseNoise * (sleepData.noiseSensitivity / 10);
  
  if (combinedImpact >= 7) {
    sleepImpact = 'May significantly affect sleep quality';
  } else if (combinedImpact >= 5) {
    sleepImpact = 'Could affect sleep quality';
  } else if (combinedImpact >= 3) {
    sleepImpact = 'Minor sleep disturbances possible';
  }
  
  return {
    level: baseNoise,
    sources,
    sleepImpact,
  };
}

/**
 * Analyze commute times (mock implementation)
 */
async function analyzeCommute(
  currentAddress: { lat: number; lng: number },
  newAddress: { lat: number; lng: number },
  workData: UserProfile['work']
): Promise<{ currentTime: number; newTime: number; change: number; impact: string }> {
  // Mock implementation - would use Google Maps Distance Matrix API in production
  
  // Simple calculation based on distance
  const currentTime = workData.location ? Math.floor(Math.random() * 30) + 15 : 0;
  const newTime = workData.location ? Math.floor(Math.random() * 30) + 15 : 0;
  const change = newTime - currentTime;
  
  let impact = 'Similar commute time';
  if (change > 15) {
    impact = 'Significantly longer commute - consider time cost';
  } else if (change > 5) {
    impact = 'Somewhat longer commute';
  } else if (change < -10) {
    impact = 'Much shorter commute - great time savings!';
  } else if (change < -5) {
    impact = 'Shorter commute - saves time daily';
  }
  
  return {
    currentTime,
    newTime,
    change,
    impact,
  };
}

/**
 * Analyze lifestyle compatibility (mock implementation)
 */
async function analyzeLifestyleMatch(
  newAddress: { lat: number; lng: number },
  lifestyle: UserProfile['lifestyle']
): Promise<{ overall: number; amenitiesNearby: { [hobby: string]: boolean }; walkability: number }> {
  // Mock implementation - would use Google Places API in production
  
  const amenitiesNearby: { [hobby: string]: boolean } = {};
  let foundCount = 0;
  
  lifestyle.hobbies.forEach(hobby => {
    const found = Math.random() > 0.3; // 70% chance of finding amenity
    amenitiesNearby[hobby] = found;
    if (found) foundCount++;
  });
  
  const overall = Math.min(10, (foundCount / lifestyle.hobbies.length) * 10 + 2);
  const walkability = Math.floor(Math.random() * 4) + 5; // 5-8
  
  return {
    overall: Math.round(overall * 10) / 10,
    amenitiesNearby,
    walkability,
  };
}

/**
 * Calculate overall recommendation - aligned with AI scoring
 */
function calculateOverallRecommendation(factors: {
  crimeScoreChange: number;
  noiseChange: number;
  commuteChange: number;
  lifestyleScore: number;
  aiScore: number;
}): { recommendation: ComprehensiveAnalysis['overallRecommendation']; confidence: number } {
  
  // Start with AI score as the base (it considers everything)
  let score = factors.aiScore;
  
  // Adjust based on key factors
  
  // Crime: Very important factor
  if (factors.crimeScoreChange < -2) {
    score -= 1.5; // Much less safe
  } else if (factors.crimeScoreChange < -1) {
    score -= 0.5; // Somewhat less safe
  } else if (factors.crimeScoreChange > 1) {
    score += 0.5; // Safer
  }
  
  // Noise: Important for quality of life
  if (factors.noiseChange > 3) {
    score -= 1.5; // Much noisier
  } else if (factors.noiseChange > 1) {
    score -= 0.5; // Somewhat noisier
  } else if (factors.noiseChange < -2) {
    score += 0.5; // Much quieter
  }
  
  // Commute: Matters but not as critical
  if (factors.commuteChange > 30) {
    score -= 1; // Significantly longer
  } else if (factors.commuteChange > 15) {
    score -= 0.5; // Moderately longer
  } else if (factors.commuteChange < -15) {
    score += 0.5; // Much shorter
  }
  
  // Lifestyle: Important for happiness
  if (factors.lifestyleScore < 4) {
    score -= 1; // Poor match
  } else if (factors.lifestyleScore < 6) {
    score -= 0.5; // Fair match
  } else if (factors.lifestyleScore >= 8) {
    score += 0.5; // Excellent match
  }
  
  // Cap the score between 1-10
  score = Math.max(1, Math.min(10, score));
  
  // Determine recommendation based on final score
  let recommendation: ComprehensiveAnalysis['overallRecommendation'];
  if (score >= 8) {
    recommendation = 'highly-recommended';
  } else if (score >= 6.5) {
    recommendation = 'recommended';
  } else if (score >= 5) {
    recommendation = 'consider-carefully';
  } else {
    recommendation = 'not-recommended';
  }
  
  // Confidence increases with better data
  // High crime scores = more confident
  // Extreme changes = more obvious decision
  const crimeConfidence = Math.min(factors.aiScore >= 9 ? 10 : 9, 10) * 10;
  const changesMagnitude = Math.abs(factors.crimeScoreChange) + Math.abs(factors.noiseChange / 2);
  const dataConfidence = 60 + changesMagnitude * 5;
  
  const confidence = Math.min(95, Math.max(65, (crimeConfidence + dataConfidence + score * 5) / 3));
  
  return { 
    recommendation, 
    confidence: Math.round(confidence) 
  };
}
