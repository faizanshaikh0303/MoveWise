export interface UserProfile {
  // Work
  workLocation?: string;
  workDays: string[];
  workHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  commuteMethod: 'driving' | 'transit' | 'biking' | 'walking' | 'varies';
  
  // Sleep
  sleepSchedule: {
    bedtime: string;  // "23:00"
    wakeTime: string; // "07:00"
  };
  noiseSensitivity: number; // 1-10
  weekendSleepDifferent: boolean;
  weekendSleep?: {
    bedtime: string;
    wakeTime: string;
  };
  
  // Activities
  hobbies: string[];
  activityFrequency: { [hobby: string]: 'daily' | 'weekly' | 'monthly' | 'occasionally' };
  
  // Safety
  safetyPriorities: string[];
  timesOutside: string[]; // "early-morning", "evening", etc.
  
  // Additional
  household: string[]; // "just-me", "partner", "children", etc.
  mustHaves: string;
}