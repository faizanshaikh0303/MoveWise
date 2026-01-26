import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface SavedComparison {
  id?: string;
  currentAddress: {
    description: string;
    lat: number;
    lng: number;
  };
  newAddress: {
    description: string;
    lat: number;
    lng: number;
  };
  distance: number;
  timestamp: string;
}

// Save a new comparison
export const saveComparison = async (comparison: Omit<SavedComparison, 'id' | 'timestamp'>) => {
  try {
    const docRef = await addDoc(collection(db, 'comparisons'), {
      ...comparison,
      timestamp: new Date().toISOString(),
      createdAt: Timestamp.now(),
    });
    
    console.log('Comparison saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving comparison:', error);
    throw error;
  }
};

// Get all saved comparisons (most recent first)
export const getSavedComparisons = async (): Promise<SavedComparison[]> => {
  try {
    const q = query(
      collection(db, 'comparisons'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    const comparisons: SavedComparison[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SavedComparison));
    
    return comparisons;
  } catch (error) {
    console.error('Error getting comparisons:', error);
    throw error;
  }
};