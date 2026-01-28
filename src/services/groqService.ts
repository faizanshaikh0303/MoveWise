// Groq AI Integration Service - FIXED VERSION
// Better JSON parsing to handle markdown code blocks

export interface AnalysisData {
  currentAddress: { description: string; lat: number; lng: number };
  newAddress: { description: string; lat: number; lng: number };
  distance: number;
  currentCrimeScore: number;
  newCrimeScore: number;
  crimeExposure: {
    current: 'low' | 'medium' | 'high';
    new: 'low' | 'medium' | 'high';
    riskHours: number[];
  };
  currentNoiseLevel: number;
  newNoiseLevel: number;
  noiseImpact: string;
  currentCommute?: { time: number; method: string };
  newCommute?: { time: number; method: string };
  hobbies: string[];
  activityTimes: string[];
  sleepSchedule: { bedtime: string; wakeTime: string };
  workSchedule: { workDays: string[]; workHours: { start: string; end: string } };
  noiseSensitivity: number;
}

export interface GroqInsight {
  summary: string;
  pros: string[];
  cons: string[];
  recommendations: string[];
  overallScore: number;
  personalMessage: string;
}

export async function generatePersonalizedInsights(
  data: AnalysisData,
  groqApiKey: string
): Promise<GroqInsight> {
  try {
    const prompt = buildAnalysisPrompt(data);

    console.log('🤖 Calling Groq API...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a lifestyle analyst helping people understand how moving to a new location will impact their daily life. 
You provide personalized, empathetic insights based on crime data, noise levels, commute times, and lifestyle preferences.
Always be honest but balanced - highlight both positives and concerns.

CRITICAL: You must respond with ONLY valid JSON. No markdown, no code blocks, no backticks, no preamble, no explanation.
Just the raw JSON object starting with { and ending with }.

Use this exact structure:
{
  "summary": "2-3 sentence overview",
  "pros": ["positive aspect 1", "positive aspect 2", "positive aspect 3"],
  "cons": ["concern 1", "concern 2", "concern 3"],
  "recommendations": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "overallScore": 7,
  "personalMessage": "A warm, personalized message that acknowledges their specific situation"
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error response:', errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Groq response');
    }

    console.log('📥 Raw Groq response:', content);

    // Clean up the response - remove markdown code blocks if present
    content = content.trim();
    content = content.replace(/^```json\s*/i, '');
    content = content.replace(/^```\s*/i, '');
    content = content.replace(/\s*```$/i, '');
    content = content.trim();

    console.log('🧹 Cleaned response:', content);

    // Parse the JSON response
    const insight = JSON.parse(content) as GroqInsight;
    
    console.log('✅ Successfully parsed Groq insights');
    return insight;

  } catch (error) {
    console.error('❌ Error generating Groq insights:', error);
    console.log('⚡ Using fallback insights');
    // Return fallback insights if API fails
    return generateFallbackInsights(data);
  }
}

function buildAnalysisPrompt(data: AnalysisData): string {
  const crimeChange = data.currentCrimeScore === 0 ? 0 : 
    ((data.newCrimeScore - data.currentCrimeScore) / data.currentCrimeScore) * 100;
  const noiseChange = data.newNoiseLevel - data.currentNoiseLevel;
  
  let commuteInfo = '';
  if (data.newCommute && data.currentCommute) {
    const commuteChange = data.newCommute.time - data.currentCommute.time;
    commuteInfo = `
Commute Analysis:
- Current commute: ${data.currentCommute.time} minutes (${data.currentCommute.method})
- New commute: ${data.newCommute.time} minutes (${data.newCommute.method})
- Change: ${commuteChange > 0 ? '+' : ''}${commuteChange} minutes ${commuteChange > 0 ? 'longer' : 'shorter'}
`;
  } else {
    commuteInfo = 'Commute: User works from home - no commute impact';
  }

  return `
Analyze this person's potential move and provide personalized insights:

MOVE DETAILS:
- Current: ${data.currentAddress.description}
- New: ${data.newAddress.description}
- Distance: ${data.distance.toFixed(1)} miles

SAFETY & CRIME:
- Current area crime score: ${data.currentCrimeScore}/10 (${data.crimeExposure.current} exposure during their active hours)
- New area crime score: ${data.newCrimeScore}/10 (${data.crimeExposure.new} exposure during their active hours)
- Change: ${crimeChange === 0 ? 'No change - both areas are equally safe' : `${crimeChange > 0 ? '+' : ''}${crimeChange.toFixed(1)}%`}

NOISE LEVELS:
- Current noise level: ${data.currentNoiseLevel}/10
- New noise level: ${data.newNoiseLevel}/10
- User's noise sensitivity: ${data.noiseSensitivity}/10
- Impact: ${data.noiseImpact}

${commuteInfo}

LIFESTYLE PREFERENCES:
- Hobbies: ${data.hobbies.join(', ')}
- Active times: ${data.activityTimes.join(', ')}
- Sleep schedule: ${data.sleepSchedule.bedtime} to ${data.sleepSchedule.wakeTime}
- Work days: ${data.workSchedule.workDays.join(', ')}
- Work hours: ${data.workSchedule.workHours.start} to ${data.workSchedule.workHours.end}

KEY CONSIDERATIONS:
1. The move is ${data.distance.toFixed(0)} miles - a ${data.distance > 200 ? 'major' : 'moderate'} relocation
2. Noise will ${noiseChange > 0 ? 'increase' : noiseChange < 0 ? 'decrease' : 'stay similar'} - user has ${data.noiseSensitivity >= 7 ? 'high' : data.noiseSensitivity >= 4 ? 'moderate' : 'low'} noise sensitivity
3. Both areas are ${data.currentCrimeScore >= 8 ? 'very safe' : data.currentCrimeScore >= 6 ? 'safe' : 'moderately safe'}
4. User enjoys: ${data.hobbies.join(', ')} during ${data.activityTimes.join(', ')} hours

Provide a comprehensive, personalized analysis that considers how these factors affect their daily life and sleep quality.
Be specific, empathetic, and practical in your recommendations.

Remember: Respond with ONLY the JSON object, no markdown formatting.
`;
}

function generateFallbackInsights(data: AnalysisData): GroqInsight {
  const crimeImprovement = data.newCrimeScore > data.currentCrimeScore;
  const noiseImprovement = data.newNoiseLevel < data.currentNoiseLevel;
  const bigMove = data.distance > 200;
  
  const pros: string[] = [];
  const cons: string[] = [];

  // Crime analysis
  if (data.currentCrimeScore >= 9 && data.newCrimeScore >= 9) {
    pros.push(`Both locations are very safe (${data.newCrimeScore}/10 crime score)`);
  } else if (crimeImprovement) {
    pros.push(`Safer neighborhood with ${data.newCrimeScore}/10 crime score`);
  } else if (data.newCrimeScore < data.currentCrimeScore) {
    cons.push(`Crime score decreased from ${data.currentCrimeScore}/10 to ${data.newCrimeScore}/10`);
  }

  // Noise analysis
  if (noiseImprovement) {
    pros.push(`Quieter area (${data.newNoiseLevel}/10 vs ${data.currentNoiseLevel}/10) - better for sleep`);
  } else if (data.newNoiseLevel > data.currentNoiseLevel) {
    if (data.noiseSensitivity >= 7) {
      cons.push(`Noisier area (${data.newNoiseLevel}/10) may significantly impact your sleep (sensitivity: ${data.noiseSensitivity}/10)`);
    } else {
      cons.push(`Slightly noisier area (${data.newNoiseLevel}/10 vs ${data.currentNoiseLevel}/10)`);
    }
  }

  // Distance
  if (bigMove) {
    cons.push(`Major relocation of ${data.distance.toFixed(0)} miles - significant lifestyle change`);
  } else {
    pros.push(`Manageable distance of ${data.distance.toFixed(0)} miles`);
  }

  // Commute
  if (!data.currentCommute && !data.newCommute) {
    pros.push('Work from home - no commute to worry about');
  }

  // Lifestyle
  pros.push('New opportunities to explore your hobbies and interests');

  // Ensure we have at least 3 items each
  if (pros.length < 3) {
    pros.push('Change of scenery and new experiences');
    pros.push('Opportunity for a fresh start');
  }
  if (cons.length < 2) {
    cons.push('Need to establish new routines and favorite spots');
    cons.push('Distance from current familiar area');
  }
  
  // Calculate overall score based on factors (aligned with new algorithm)
  let baseScore = 7; // Start neutral
  
  // Crime impact (most important)
  if (data.newCrimeScore >= 9) {
    baseScore += 1.5; // Very safe
  } else if (data.newCrimeScore >= 7) {
    baseScore += 0.5; // Safe
  } else if (data.newCrimeScore < 6) {
    baseScore -= 1.5; // Less safe
  }
  
  // Noise impact
  if (data.newNoiseLevel <= 3) {
    baseScore += 1; // Very quiet
  } else if (data.newNoiseLevel >= 8) {
    baseScore -= 1; // Very noisy
  }
  
  // Distance penalty
  if (bigMove) {
    baseScore -= 0.5; // Big move is harder
  }
  
  const overallScore = Math.max(1, Math.min(10, Math.round(baseScore * 10) / 10));

  return {
    summary: `Moving ${data.distance.toFixed(0)} miles from ${data.currentAddress.description.split(',')[0]} to ${data.newAddress.description.split(',')[0]}. ${crimeImprovement || data.newCrimeScore >= 8 ? 'Safety is excellent' : 'Safety considerations needed'}. ${noiseImprovement ? 'Quieter environment' : data.newNoiseLevel === data.currentNoiseLevel ? 'Similar noise levels' : 'More active area'}.`,
    pros,
    cons,
    recommendations: [
      'Visit the new neighborhood during your typical active hours to get a feel for the area',
      'Check out amenities like restaurants, coffee shops, and entertainment that match your interests',
      'Talk to current residents about noise levels, especially during evening and night hours',
      bigMove ? 'Plan logistics carefully given the significant distance - consider a trial visit' : 'Consider a weekend visit to explore the area thoroughly'
    ],
    overallScore,
    personalMessage: `Moving ${data.distance.toFixed(0)} miles is ${bigMove ? 'a major life change' : 'a significant decision'}. ${data.noiseSensitivity >= 7 && data.newNoiseLevel > data.currentNoiseLevel ? 'Given your high noise sensitivity, the increased noise level is an important consideration.' : ''} ${pros.length > cons.length ? 'This move offers several positive aspects' : 'Carefully weigh the trade-offs'}. I recommend ${bigMove ? 'spending substantial time' : 'visiting'} in the new area before making your final decision.`
  };
}

export function getCrimeDescription(score: number): string {
  if (score >= 8) return 'Very Safe';
  if (score >= 6) return 'Safe';
  if (score >= 4) return 'Moderate';
  if (score >= 2) return 'Concerning';
  return 'High Risk';
}

export function getNoiseDescription(level: number): string {
  if (level <= 2) return 'Very Quiet';
  if (level <= 4) return 'Quiet';
  if (level <= 6) return 'Moderate';
  if (level <= 8) return 'Noisy';
  return 'Very Noisy';
}
