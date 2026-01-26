import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏠 MoveWise</Text>
        <Text style={styles.subtitle}>
          Discover how your next move will impact your life
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('AddressInput')}
        >
          <Text style={styles.buttonText}>Start New Comparison</Text>
        </TouchableOpacity>
        
        {/* My Comparisons button */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#FF9800', marginTop: 10 }]}
          onPress={() => navigation.navigate('MyComparisons')}
        >
          <Text style={styles.buttonText}>My Comparisons</Text>
        </TouchableOpacity>

        {/* Test Firebase */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#4CAF50', marginTop: 10 }]}
          onPress={() => navigation.navigate('TestFirebase')}
        >
          <Text style={styles.buttonText}>Test Firebase (Dev)</Text>
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
          California only • Compare any two addresses
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by Real Crime Data & AI
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});