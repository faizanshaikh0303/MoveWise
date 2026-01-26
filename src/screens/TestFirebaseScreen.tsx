import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function TestFirebaseScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [recentTests, setRecentTests] = useState<any[]>([]);

  // Load recent test entries
  useEffect(() => {
    loadRecentTests();
  }, []);

  const loadRecentTests = async () => {
    try {
      const q = query(
        collection(db, 'test_data'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const tests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRecentTests(tests);
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const testFirebase = async () => {
    setLoading(true);
    try {
      // Create a test document
      const testData = {
        message: 'Firebase is working!',
        timestamp: new Date().toISOString(),
        testNumber: Math.floor(Math.random() * 1000)
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'test_data'), testData);
      
      console.log('Document written with ID: ', docRef.id);
      setLastSaved(testData.message);
      
      Alert.alert('Success!', `Firebase is working!\nDocument ID: ${docRef.id}`);
      
      // Reload recent tests
      await loadRecentTests();
      
    } catch (error) {
      console.error('Error adding document: ', error);
      Alert.alert('Error', `Firebase error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAllCrimes = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'crime_data_la'));
      
      // Group by area
      const areaCount: any = {};
      snapshot.docs.forEach(doc => {
        const area = doc.data().area;
        areaCount[area] = (areaCount[area] || 0) + 1;
      });
      
      const areas = Object.entries(areaCount)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([area, count]) => `${area}: ${count}`)
        .join('\n');
      
      Alert.alert(
        'All Crimes',
        `Total: ${snapshot.size} crimes\n\n` +
        `Top areas:\n${areas}`
      );
      
    } catch (error) {
      Alert.alert('Error', `${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Firebase Test</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Test your Firebase connection</Text>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={testFirebase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Test Firebase Connection</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, { backgroundColor: '#00BCD4', marginTop: 10 }]}
          onPress={testAllCrimes}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Show All Crimes by Area</Text>
          )}
        </TouchableOpacity>

        {lastSaved && (
          <View style={styles.successCard}>
            <Text style={styles.successText}>✅ Last saved: {lastSaved}</Text>
          </View>
        )}

        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Test Entries:</Text>
          {recentTests.length > 0 ? (
            recentTests.map((test, index) => (
              <View key={test.id} style={styles.testItem}>
                <Text style={styles.testNumber}>#{index + 1}</Text>
                <Text style={styles.testMessage}>{test.message}</Text>
                <Text style={styles.testTime}>
                  {new Date(test.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No test data yet. Tap the button above!</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What this tests:</Text>
          <Text style={styles.infoItem}>✓ Firebase connection</Text>
          <Text style={styles.infoItem}>✓ Firestore write operations</Text>
          <Text style={styles.infoItem}>✓ Firestore read operations</Text>
          <Text style={styles.infoItem}>✓ Real-time data sync</Text>
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
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  recentSection: {
    marginTop: 20,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  testItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginRight: 10,
  },
  testMessage: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  testTime: {
    fontSize: 12,
    color: '#666',
  },
  noData: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});