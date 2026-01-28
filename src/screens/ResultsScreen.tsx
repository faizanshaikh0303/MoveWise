import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

type Props = {
  navigation: any;
  route: any;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ResultsScreen({ navigation, route }: Props) {
  const { analysis } = route.params || {};
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // DEBUG: Log the received analysis data
  console.log('🎨 ResultsScreen received analysis:', JSON.stringify(analysis, null, 2));

  if (!analysis) {
    console.log('❌ No analysis data received!');
    return (
      <View style={styles.container}>
        <View style={styles.floatingHeader}>
          <Text style={styles.floatingTitle}>No Analysis Data</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={styles.errorText}>Unable to load analysis results</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.primaryButtonText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getRecommendationColor = () => {
    switch (analysis.overallRecommendation) {
      case 'highly-recommended': return '#4CAF50';
      case 'recommended': return '#8BC34A';
      case 'consider-carefully': return '#FF9800';
      default: return '#F44336';
    }
  };

  const getRecommendationText = () => {
    switch (analysis.overallRecommendation) {
      case 'highly-recommended': return 'Highly Recommended';
      case 'recommended': return 'Recommended';
      case 'consider-carefully': return 'Consider Carefully';
      default: return 'Not Recommended';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#8BC34A';
    if (score >= 4) return '#FF9800';
    return '#F44336';
  };

  const getExposureColor = (exposure: string) => {
    switch (exposure) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating Header */}
      <View style={[styles.floatingHeader, { backgroundColor: getRecommendationColor() }]}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')} 
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.floatingTitle}>{getRecommendationText()}</Text>
        <Text style={styles.floatingSubtitle}>{analysis.confidenceScore}% Confidence</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Score Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroScoreContainer}>
            <View style={[styles.heroScoreBadge, { borderColor: getScoreColor(analysis.aiInsights.overallScore) }]}>
              <Text style={[styles.heroScoreNumber, { color: getScoreColor(analysis.aiInsights.overallScore) }]}>
                {analysis.aiInsights.overallScore.toFixed(1)}
              </Text>
              <Text style={styles.heroScoreLabel}>AI Score</Text>
            </View>
            <View style={styles.heroScoreDetails}>
              <View style={styles.scoreDetailRow}>
                <Text style={styles.scoreDetailLabel}>Safety</Text>
                <View style={styles.scoreDetailBar}>
                  <View style={[styles.scoreDetailFill, { width: `${(analysis.newCrimeData.score / 10) * 100}%`, backgroundColor: getScoreColor(analysis.newCrimeData.score) }]} />
                </View>
                <Text style={styles.scoreDetailValue}>{analysis.newCrimeData.score.toFixed(1)}</Text>
              </View>
              <View style={styles.scoreDetailRow}>
                <Text style={styles.scoreDetailLabel}>Lifestyle</Text>
                <View style={styles.scoreDetailBar}>
                  <View style={[styles.scoreDetailFill, { width: `${(analysis.lifestyleScore.overall / 10) * 100}%`, backgroundColor: getScoreColor(analysis.lifestyleScore.overall) }]} />
                </View>
                <Text style={styles.scoreDetailValue}>{analysis.lifestyleScore.overall.toFixed(1)}</Text>
              </View>
              <View style={styles.scoreDetailRow}>
                <Text style={styles.scoreDetailLabel}>Quiet</Text>
                <View style={styles.scoreDetailBar}>
                  <View style={[styles.scoreDetailFill, { width: `${((10 - analysis.newNoise.level) / 10) * 100}%`, backgroundColor: getScoreColor(10 - analysis.newNoise.level) }]} />
                </View>
                <Text style={styles.scoreDetailValue}>{(10 - analysis.newNoise.level).toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Summary - Always Visible */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryIcon}>🤖</Text>
            <Text style={styles.summaryTitle}>AI Analysis</Text>
          </View>
          {analysis.aiInsights.summary.split('. ').map((sentence: string, index: number) => {
            if (!sentence.trim()) return null;
            return (
              <View key={index} style={styles.summaryItem}>
                <Text style={styles.summaryBullet}>•</Text>
                <Text style={styles.summaryText}>
                  {sentence.trim()}{sentence.includes('.') ? '' : '.'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Personal Message - Always Visible */}
        <View style={styles.personalCard}>
          <Text style={styles.personalIcon}>💬</Text>
          <Text style={styles.personalText}>{analysis.aiInsights.personalMessage}</Text>
        </View>

        {/* Pros Grid */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.prosIcon}>✅</Text>
            <Text style={styles.prosTitle}>What's Great ({analysis.aiInsights.pros.length})</Text>
          </View>
          {analysis.aiInsights.pros.map((pro: string, index: number) => (
            <View key={index} style={styles.proItem}>
              <View style={styles.proIconCircle}>
                <Text style={styles.proNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.proText}>{pro}</Text>
            </View>
          ))}
        </View>

        {/* Cons Grid */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.consIcon}>⚠️</Text>
            <Text style={styles.consTitle}>Consider These ({analysis.aiInsights.cons.length})</Text>
          </View>
          {analysis.aiInsights.cons.map((con: string, index: number) => (
            <View key={index} style={styles.conItem}>
              <View style={styles.conIconCircle}>
                <Text style={styles.conNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.conText}>{con}</Text>
            </View>
          ))}
        </View>

        {/* Detailed Metrics - Collapsible */}
        <TouchableOpacity
          style={styles.expandableCard}
          onPress={() => toggleSection('details')}
          activeOpacity={0.9}
        >
          <View style={styles.expandableHeader}>
            <Text style={styles.expandableIcon}>📊</Text>
            <Text style={styles.expandableTitle}>Detailed Analysis</Text>
            <Text style={styles.expandIcon}>{expandedSection === 'details' ? '▼' : '▶'}</Text>
          </View>
          {expandedSection === 'details' && (
            <View style={styles.expandableContent}>
              {/* Safety Comparison */}
              <View style={styles.metricSection}>
                <Text style={styles.metricTitle}>🛡️ Safety & Crime</Text>
                <View style={styles.comparisonRow}>
                  <View style={styles.comparisonCard}>
                    <Text style={styles.comparisonLabel}>Current</Text>
                    <Text style={styles.comparisonValue}>{analysis.currentCrimeData.score}/10</Text>
                    <View style={[styles.exposureBadge, { backgroundColor: getExposureColor(analysis.currentCrimeData.exposure) }]}>
                      <Text style={styles.exposureBadgeText}>{analysis.currentCrimeData.exposure.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.comparisonArrow}>→</Text>
                  <View style={styles.comparisonCard}>
                    <Text style={styles.comparisonLabel}>New</Text>
                    <Text style={styles.comparisonValue}>{analysis.newCrimeData.score}/10</Text>
                    <View style={[styles.exposureBadge, { backgroundColor: getExposureColor(analysis.newCrimeData.exposure) }]}>
                      <Text style={styles.exposureBadgeText}>{analysis.newCrimeData.exposure.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.metricNote}>Crime exposure during your active hours</Text>
              </View>

              {/* Noise Comparison */}
              <View style={styles.metricSection}>
                <Text style={styles.metricTitle}>🔊 Noise Levels</Text>
                <View style={styles.comparisonRow}>
                  <View style={styles.comparisonCard}>
                    <Text style={styles.comparisonLabel}>Current</Text>
                    <Text style={styles.comparisonValue}>{analysis.currentNoise.level}/10</Text>
                    <Text style={styles.comparisonDetail}>{analysis.currentNoise.sleepImpact}</Text>
                  </View>
                  <Text style={styles.comparisonArrow}>→</Text>
                  <View style={styles.comparisonCard}>
                    <Text style={styles.comparisonLabel}>New</Text>
                    <Text style={styles.comparisonValue}>{analysis.newNoise.level}/10</Text>
                    <Text style={styles.comparisonDetail}>{analysis.newNoise.sleepImpact}</Text>
                  </View>
                </View>
                {analysis.newNoise.sources.length > 0 && (
                  <Text style={styles.metricNote}>Sources: {analysis.newNoise.sources.join(', ')}</Text>
                )}
              </View>

              {/* Lifestyle Amenities */}
              <View style={styles.metricSection}>
                <Text style={styles.metricTitle}>🎯 Nearby Amenities</Text>
                <View style={styles.amenitiesGrid}>
                  {Object.entries(analysis.lifestyleScore.amenitiesNearby).map(([hobby, available]: [string, any]) => (
                    <View key={hobby} style={[styles.amenityChip, available ? styles.amenityAvailable : styles.amenityUnavailable]}>
                      <Text style={styles.amenityEmoji}>{available ? '✓' : '✗'}</Text>
                      <Text style={styles.amenityText}>{hobby}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.walkabilityRow}>
                  <Text style={styles.walkabilityLabel}>Walkability Score:</Text>
                  <Text style={[styles.walkabilityScore, { color: getScoreColor(analysis.lifestyleScore.walkability) }]}>
                    {analysis.lifestyleScore.walkability}/10
                  </Text>
                </View>
              </View>

              {/* Commute Info */}
              {analysis.commute.change !== 0 && (
                <View style={styles.metricSection}>
                  <Text style={styles.metricTitle}>🚗 Commute</Text>
                  <View style={styles.commuteInfo}>
                    <Text style={styles.commuteChange}>
                      {analysis.commute.change > 0 ? '+' : ''}{analysis.commute.change} min
                    </Text>
                    <Text style={styles.commuteImpact}>{analysis.commute.impact}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Recommendations - Always Visible */}
        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
            <Text style={styles.recommendationsIcon}>💡</Text>
            <Text style={styles.recommendationsTitle}>Your Action Plan</Text>
          </View>
          {analysis.aiInsights.recommendations.map((rec: string, index: number) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={styles.recommendationBadge}>
                <Text style={styles.recommendationBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.actionButtonText}>🏠 New Comparison</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryActionButton]}
            onPress={() => navigation.navigate('MyComparisons')}
          >
            <Text style={styles.secondaryActionButtonText}>📋 My Comparisons</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  floatingHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  floatingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  floatingSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.95,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroScoreBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  heroScoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  heroScoreLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  heroScoreDetails: {
    flex: 1,
  },
  scoreDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreDetailLabel: {
    fontSize: 13,
    color: '#666',
    width: 60,
    fontWeight: '500',
  },
  scoreDetailBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  scoreDetailFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDetailValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    width: 30,
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  summaryBullet: {
    fontSize: 16,
    color: '#4A90E2',
    marginRight: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  personalCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  personalIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  personalText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#E65100',
    fontStyle: 'italic',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  prosIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  prosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  proItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  proIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  proNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  proText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  consIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  consTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  conItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  conIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  conNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  conText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  expandableCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandableIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  expandableTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  expandIcon: {
    fontSize: 18,
    color: '#999',
  },
  expandableContent: {
    marginTop: 20,
  },
  metricSection: {
    marginBottom: 24,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  comparisonDetail: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  comparisonArrow: {
    fontSize: 24,
    color: '#4A90E2',
    marginHorizontal: 12,
  },
  exposureBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  exposureBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  metricNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  amenityAvailable: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  amenityUnavailable: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  amenityEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  walkabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  walkabilityLabel: {
    fontSize: 14,
    color: '#666',
  },
  walkabilityScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commuteInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  commuteChange: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  commuteImpact: {
    fontSize: 14,
    color: '#666',
  },
  recommendationsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationsIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  recommendationBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  recommendationBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  actionSection: {
    marginTop: 8,
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryActionButton: {
    backgroundColor: '#4A90E2',
  },
  secondaryActionButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryActionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
