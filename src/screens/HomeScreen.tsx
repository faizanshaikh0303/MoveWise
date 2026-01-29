import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';

type Props = {
  navigation: any;
};

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Gradient Effect */}
        <View style={styles.heroSection}>
          <View style={styles.gradientTop} />
          <Text style={styles.heroEmoji}>🏠</Text>
          <Text style={styles.heroTitle}>MoveWise</Text>
          <Text style={styles.heroTagline}>Your AI Moving Assistant</Text>
          <View style={styles.heroCard}>
            <Text style={styles.heroDescription}>
              Make smarter moving decisions with AI-powered analysis of safety, noise, lifestyle, and more.
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🛡️</Text>
            <Text style={styles.statNumber}>Real-Time</Text>
            <Text style={styles.statLabel}>Crime Data</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🤖</Text>
            <Text style={styles.statNumber}>AI-Powered</Text>
            <Text style={styles.statLabel}>Insights</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statNumber}>3 Minutes</Text>
            <Text style={styles.statLabel}>To Complete</Text>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What We Analyze</Text>
          
          <View style={styles.featuresGrid}>
            <View style={[styles.featureCard, styles.featureCard1]}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🛡️</Text>
              </View>
              <Text style={styles.featureTitle}>Safety First</Text>
              <Text style={styles.featureDescription}>
                Real crime data from 5-mile radius
              </Text>
            </View>

            <View style={[styles.featureCard, styles.featureCard2]}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🔊</Text>
              </View>
              <Text style={styles.featureTitle}>Noise Levels</Text>
              <Text style={styles.featureDescription}>
                Sleep quality analysis
              </Text>
            </View>

            <View style={[styles.featureCard, styles.featureCard3]}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🎯</Text>
              </View>
              <Text style={styles.featureTitle}>Lifestyle Match</Text>
              <Text style={styles.featureDescription}>
                Find your perfect amenities
              </Text>
            </View>

            <View style={[styles.featureCard, styles.featureCard4]}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🚗</Text>
              </View>
              <Text style={styles.featureTitle}>Commute Time</Text>
              <Text style={styles.featureDescription}>
                Daily routine impact
              </Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.stepRow}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Enter Addresses</Text>
                <Text style={styles.stepText}>Current and new location</Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepRow}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share Your Lifestyle</Text>
                <Text style={styles.stepText}>Work, sleep, and hobbies</Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepRow}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get AI Insights</Text>
                <Text style={styles.stepText}>Personalized recommendations</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('AddressInput')}
            activeOpacity={0.8}
          >
            <View style={styles.ctaButtonContent}>
              <Text style={styles.ctaButtonText}>Start Analysis</Text>
              <View style={styles.ctaButtonIcon}>
                <Text style={styles.ctaArrow}>→</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.trustBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🔒</Text>
              <Text style={styles.badgeText}>Private & Secure</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>✨</Text>
              <Text style={styles.badgeText}>100% Free</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    backgroundColor: '#4A90E2',
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
  },
  heroEmoji: {
    fontSize: 70,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroTagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
    fontWeight: '500',
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroDescription: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -30,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: (width - 56) / 2,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureCard1: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  featureCard2: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  featureCard3: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  featureCard4: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 26,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  stepsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumberCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
  },
  stepConnector: {
    width: 2,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginLeft: 21,
    marginVertical: 8,
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  ctaButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  ctaButtonIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaArrow: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
