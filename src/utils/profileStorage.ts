// import AsyncStorage from '@react-native-async-storage/async-storage';

// const PROFILE_KEY = '@user_profile';

// export interface UserProfile {
//   workLocation?: string;
//   workDays: string[];
//   workHours: { start: string; end: string };
//   commuteMethod: string;
//   sleepSchedule: { bedtime: string; wakeTime: string };
//   noiseSensitivity: number;
//   weekendSleepDifferent: boolean;
//   weekendSleep?: { bedtime: string; wakeTime: string };
//   hobbies: string[];
// }

// export const saveProfile = async (profile: UserProfile) => {
//   try {
//     await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
//     console.log('✅ Profile saved');
//   } catch (error) {
//     console.error('Error saving profile:', error);
//   }
// };

// export const loadProfile = async (): Promise<UserProfile | null> => {
//   try {
//     const saved = await AsyncStorage.getItem(PROFILE_KEY);
//     if (saved) {
//       return JSON.parse(saved);
//     }
//     return null;
//   } catch (error) {
//     console.error('Error loading profile:', error);
//     return null;
//   }
// };

// export const clearProfile = async () => {
//   try {
//     await AsyncStorage.removeItem(PROFILE_KEY);
//     console.log('✅ Profile cleared');
//   } catch (error) {
//     console.error('Error clearing profile:', error);
//   }
// };