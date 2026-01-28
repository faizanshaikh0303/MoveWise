import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { useUserProfile } from '../context/UserProfileContext';
import { analyzeMove } from '../services/analysisService';
import { GROQ_API_KEY } from '@env';

type Props = {
  navigation: any;
};

const ANALYSIS_STEPS = [
  { id: 1, label: 'Analyzing crime data...', duration: 2000, icon: '🔍' },
  { id: 2, label: 'Checking noise levels...', duration: 1500, icon: '🔊' },
  { id: 3, label: 'Calculating commute times...', duration: 1800, icon: '🚗' },
  { id: 4, label: 'Finding nearby amenities...', duration: 2200, icon: '📍' },
  { id: 5, label: 'Generating AI insights...', duration: 2500, icon: '🤖' },
  { id: 6, label: 'Finalizing report...', duration: 1000, icon: '📊' },
];

export default function AnalysisLoadingScreen({ navigation }: Props) {
  const { profileData } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  // Use a ref to avoid closure issues
  const analysisResultsRef = React.useRef<any>(null);

  useEffect(() => {
    // Start visual animation
    runVisualSteps();
    
    // Start actual analysis in parallel
    runActualAnalysis();
  }, []);

  const runActualAnalysis = async () => {
    try {
      console.log('🚀 Starting real analysis with data:', profileData);
      
      // Validate we have all required data
      if (!profileData.addresses || !profileData.work || !profileData.sleep || !profileData.lifestyle) {
        throw new Error('Missing required profile data');
      }

      // Build the user profile for analysis
      const userProfile = {
        addresses: {
          current: profileData.addresses.current,
          new: profileData.addresses.new,
          distance: profileData.addresses.distance,
        },
        work: {
          location: profileData.work.location,
          workDays: profileData.work.workDays,
          workHours: profileData.work.workHours,
          commuteMethod: profileData.work.commuteMethod,
        },
        sleep: {
          bedtime: profileData.sleep.bedtime,
          wakeTime: profileData.sleep.wakeTime,
          noiseSensitivity: profileData.sleep.noiseSensitivity,
          weekendDifferent: profileData.sleep.weekendDifferent,
          weekendSleep: profileData.sleep.weekendSleep,
        },
        lifestyle: {
          hobbies: profileData.lifestyle.hobbies,
          activityTimes: profileData.lifestyle.activityTimes,
        },
      };

      console.log('📊 Running analysis...');
      
      // Run the comprehensive analysis
      const results = await analyzeMove(userProfile, GROQ_API_KEY || '');
      
      console.log('✅ Analysis complete!', results);
      console.log('🎯 Setting analysisResults state...');
      
      // Set both state and ref
      setAnalysisResults(results);
      analysisResultsRef.current = results;
      setAnalysisComplete(true);
      
      console.log('✅ State updated - results saved!');
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
      
      // Show error but allow user to continue with partial data
      Alert.alert(
        'Analysis Note',
        'Some analysis features are using estimated data. Results are still valuable!',
        [
          {
            text: 'View Results',
            onPress: () => {
              // Navigate with whatever data we have
              navigation.replace('Results', { 
                analysis: analysisResults || generateFallbackResults() 
              });
            }
          }
        ]
      );
    }
  };

  const generateFallbackResults = () => {
    // Generate basic results if analysis fails
    return {
      currentCrimeData: { totalCrimes: 0, score: 7, peakHours: [20, 21, 22], exposure: 'low' },
      newCrimeData: { totalCrimes: 0, score: 7.5, peakHours: [19, 20, 21], exposure: 'low' },
      currentNoise: { level: 5, sources: ['Traffic'], sleepImpact: 'Moderate' },
      newNoise: { level: 4, sources: ['Residential'], sleepImpact: 'Minimal' },
      commute: { currentTime: 0, newTime: 0, change: 0, impact: 'No commute - work from home' },
      lifestyleScore: { overall: 7.5, amenitiesNearby: {}, walkability: 7 },
      aiInsights: {
        summary: 'Analysis based on your lifestyle preferences and location data.',
        pros: ['New location opportunity', 'Change of environment', 'Explore new area'],
        cons: ['Distance from current location', 'New area to learn'],
        recommendations: [
          'Visit the new area during your typical active hours',
          'Research local amenities',
          'Connect with current residents',
          'Plan a trial visit'
        ],
        overallScore: 7,
        personalMessage: 'This move represents a significant change. Consider visiting the area to get a feel for the neighborhood.'
      },
      overallRecommendation: 'consider-carefully',
      confidenceScore: 70,
    };
  };

  const runVisualSteps = () => {
    let stepIndex = 0;
    const totalDuration = ANALYSIS_STEPS.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    const runSteps = () => {
      if (stepIndex >= ANALYSIS_STEPS.length) {
        // Visual animation complete, check if analysis is done
        checkAndNavigate();
        return;
      }

      const step = ANALYSIS_STEPS[stepIndex];
      setCurrentStep(stepIndex);

      // Animate progress bar
      Animated.timing(progress, {
        toValue: ((elapsed + step.duration) / totalDuration) * 100,
        duration: step.duration,
        useNativeDriver: false,
      }).start();

      elapsed += step.duration;
      stepIndex++;

      setTimeout(runSteps, step.duration);
    };

    runSteps();
  };

  const checkAndNavigate = () => {
    // Wait for analysis to complete
    const maxWaitTime = 5000;
    const checkInterval = 500;
    let waited = 0;

    const checkComplete = setInterval(() => {
      waited += checkInterval;

      // Check the ref which doesn't have closure issues
      const hasRealResults = analysisResultsRef.current !== null;
      
      console.log(`⏱️ Waiting for results... ${waited}ms - Has results: ${hasRealResults}`);
      if (hasRealResults) {
        console.log('🎉 Real results found in ref!');
      }

      if (hasRealResults || waited >= maxWaitTime) {
        clearInterval(checkComplete);
        
        // Navigate to results - use ref value
        setTimeout(() => {
          const dataToPass = analysisResultsRef.current || generateFallbackResults();
          const isRealData = analysisResultsRef.current !== null;
          
          console.log('📤 Navigating with data:', isRealData ? 'Real Data ✅' : 'Fallback Data ⚠️');
          console.log('📊 Data preview:', {
            crime: dataToPass.newCrimeData?.score,
            noise: dataToPass.newNoise?.level,
            aiScore: dataToPass.aiInsights?.overallScore,
            recommendation: dataToPass.overallRecommendation
          });
          
          navigation.replace('Results', { 
            analysis: dataToPass 
          });
        }, 500);
      }
    }, checkInterval);
  };

  const progressInterpolate = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analyzing Your Move</Text>
          <Text style={styles.subtitle}>
            Comparing {profileData.addresses?.current.description.split(',')[0]} to{' '}
            {profileData.addresses?.new.description.split(',')[0]}
          </Text>
        </View>

        {/* Progress Circle */}
        <View style={styles.progressCircle}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>

        {/* Current Step */}
        <View style={styles.currentStepContainer}>
          {currentStep < ANALYSIS_STEPS.length && (
            <>
              <Text style={styles.stepIcon}>{ANALYSIS_STEPS[currentStep].icon}</Text>
              <Text style={styles.stepLabel}>{ANALYSIS_STEPS[currentStep].label}</Text>
            </>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: progressInterpolate },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((currentStep / ANALYSIS_STEPS.length) * 100)}%
          </Text>
        </View>

        {/* Steps List */}
        <View style={styles.stepsContainer}>
          {ANALYSIS_STEPS.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.stepItem,
                index < currentStep && styles.stepItemComplete,
                index === currentStep && styles.stepItemActive,
              ]}
            >
              <View
                style={[
                  styles.stepDot,
                  index < currentStep && styles.stepDotComplete,
                  index === currentStep && styles.stepDotActive,
                ]}
              >
                {index < currentStep ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepText,
                  index <= currentStep && styles.stepTextActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.factCard}>
          <Text style={styles.factIcon}>💡</Text>
          <Text style={styles.factText}>
            Analyzing {profileData.addresses?.distance} miles worth of lifestyle changes!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  progressCircle: {
    alignItems: 'center',
    marginBottom: 30,
  },
  currentStepContainer: {
    alignItems: 'center',
    minHeight: 80,
    marginBottom: 20,
  },
  stepIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  stepLabel: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 40,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  stepsContainer: {
    marginBottom: 30,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    opacity: 0.5,
  },
  stepItemComplete: {
    opacity: 1,
  },
  stepItemActive: {
    opacity: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepDotComplete: {
    backgroundColor: '#4CAF50',
  },
  stepDotActive: {
    backgroundColor: '#4A90E2',
  },
  stepNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: '#999',
  },
  stepTextActive: {
    color: '#333',
    fontWeight: '500',
  },
  factCard: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  factIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  factText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
