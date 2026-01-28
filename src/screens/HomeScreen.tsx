import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

type Props = {
  navigation: any;
};
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
]);

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🏠</Text>
          <Text style={styles.heroTitle}>MoveWise</Text>
          <Text style={styles.heroSubtitle}>
            Make Smarter Moving Decisions
          </Text>
          <Text style={styles.heroDescription}>
            AI-powered analysis to help you understand how a move will impact your lifestyle, safety, and daily routine.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <Text style={styles.featureTitle}>Safety Analysis</Text>
            <Text style={styles.featureText}>
              Real crime data from your new neighborhood
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔊</Text>
            <Text style={styles.featureTitle}>Noise Levels</Text>
            <Text style={styles.featureText}>
              Understand how noise will affect your sleep
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureTitle}>Lifestyle Match</Text>
            <Text style={styles.featureText}>
              Find amenities that match your hobbies
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureTitle}>AI Insights</Text>
            <Text style={styles.featureText}>
              Personalized recommendations powered by AI
            </Text>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Enter Your Addresses</Text>
              <Text style={styles.stepText}>Tell us where you live now and where you're thinking of moving</Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Share Your Lifestyle</Text>
              <Text style={styles.stepText}>Quick questions about work, sleep, and hobbies</Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Personalized Insights</Text>
              <Text style={styles.stepText}>AI-powered analysis tailored to your needs</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('AddressInput')}
        >
          <Text style={styles.ctaButtonText}>Get Started</Text>
          <Text style={styles.ctaButtonIcon}>→</Text>
        </TouchableOpacity>

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <Text style={styles.infoText}>⏱️ Takes about 3 minutes</Text>
          <Text style={styles.infoText}>🔒 Your data stays private</Text>
          <Text style={styles.infoText}>✨ 100% free to use</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  heroEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
    flex: 1,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  howItWorksSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  ctaButtonIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoFooter: {
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
  },
});
