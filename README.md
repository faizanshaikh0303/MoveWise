# 🏠 MoveWise

**AI-Powered Moving Decision Assistant**

MoveWise helps you make smarter moving decisions by analyzing how a new location will impact your lifestyle, safety, and daily routine using real data and AI insights.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.72+-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## 🌟 Features

### 📊 Real Data Analysis
- **Crime Safety** - Real crime data from Firebase (5-mile radius analysis)
- **Noise Levels** - Google Places API (bars, transit, traffic proximity)
- **Lifestyle Match** - Actual amenities for your hobbies (restaurants, gyms, parks)
- **Walkability Score** - Based on nearby businesses and services

### 🤖 AI-Powered Insights
- **Personalized Recommendations** - Using Groq AI (Llama 3)
- **Pros & Cons Analysis** - Tailored to your lifestyle
- **Sleep Impact Assessment** - Based on noise and your schedule
- **Commute Analysis** - Work schedule integration

### 🎯 User-Centric
- **Beautiful UI** - Modern, intuitive design
- **Quick Setup** - Complete analysis in ~3 minutes
- **Privacy First** - Your data stays on your device
- **Free to Use** - No hidden costs

---

## 📱 Screenshots

```
[Home] → [Address Input] → [Questionnaire] → [AI Analysis] → [Results]
```

### Key Screens:
- 🏠 **Home** - Welcome with feature overview
- 📍 **Address Input** - Google Places autocomplete with California focus
- 💼 **Work Schedule** - Work location, days, hours with iOS wheel pickers
- 😴 **Sleep Schedule** - Bedtime, wake time, noise sensitivity
- 🎯 **Hobbies** - Lifestyle preferences and activities
- 🔄 **Analysis Loading** - Animated progress with real-time updates
- 📊 **Results** - Comprehensive comparison with AI insights

---

## 🚀 Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe code
- **React Navigation** - Stack navigation
- **Context API** - State management

### Backend & APIs
- **Firebase/Firestore** - Crime data storage
- **Google Places API** - Address autocomplete, noise analysis, amenities
- **Google Geocoding API** - Location details
- **Groq API** - AI-powered insights (Llama 3)

### Data Processing
- **GeoFire** - Geospatial queries
- **Custom Algorithms** - Noise, walkability, lifestyle scoring

---

## 📦 Installation

### Prerequisites
- Node.js 16+
- React Native CLI
- iOS: Xcode 14+ and CocoaPods
- Android: Android Studio and Java 11+

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/movewise.git
cd movewise
```

### 2. Install Dependencies
```bash
npm install
cd ios && pod install && cd ..
```

### 3. Environment Setup
Create `.env` file in project root:
```env
GOOGLE_MAPS_API_KEY=your_google_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Firebase Setup
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Download service account key → Save as `serviceAccountKey.json`
4. Update `src/services/firebase.ts` with your config
5. Import crime data: `cd scripts && node importCrimeData.js`

See `FIREBASE_SETUP_GUIDE.md` for detailed instructions.

### 5. Google Cloud Setup
Enable these APIs in [Google Cloud Console](https://console.cloud.google.com):
- Places API
- Maps JavaScript API
- Geocoding API

See `FIREBASE_INSTALLATION.md` for API setup details.

### 6. Run App
```bash
# iOS
npm run ios

# Android
npm run android
```

---

## 🗂️ Project Structure

```
movewise/
├── src/
│   ├── screens/              # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── AddressInputScreen.tsx
│   │   ├── WorkScheduleScreen.tsx
│   │   ├── SleepScheduleScreen.tsx
│   │   ├── HobbiesScreen.tsx
│   │   ├── AnalysisLoadingScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── MyComparisonsScreen.tsx
│   ├── services/             # Data services
│   │   ├── firebase.ts       # Firebase config
│   │   ├── crimeService.ts   # Crime data queries
│   │   ├── noiseService.ts   # Noise analysis
│   │   ├── amenitiesService.ts # Lifestyle matching
│   │   ├── analysisService.ts # Main analysis orchestration
│   │   └── groqService.ts    # AI insights
│   ├── context/              # React Context
│   │   └── UserProfileContext.tsx
│   ├── navigation/           # Navigation config
│   │   └── AppNavigator.tsx
│   └── types/                # TypeScript types
├── scripts/                  # Data import scripts
│   ├── importCrimeData.js
│   └── serviceAccountKey.json
├── .env                      # Environment variables
└── package.json
```

---

## 🎯 How It Works

### 1. User Input
```typescript
// User provides:
- Current address (California)
- New address (California)
- Work schedule (location, hours, days)
- Sleep schedule (bedtime, wake time, sensitivity)
- Hobbies (dining, gym, hiking, etc.)
```

### 2. Data Collection
```typescript
// App queries:
✅ Firebase: Crime data within 5-mile radius
✅ Google Places: Noise sources (bars, transit, traffic)
✅ Google Places: Amenities matching hobbies
✅ Calculations: Walkability, commute estimates
```

### 3. AI Analysis
```typescript
// Groq AI (Llama 3) generates:
- Personalized summary
- Pros and cons lists
- Actionable recommendations
- Overall recommendation (recommended/not recommended/neutral)
- Confidence score
```

### 4. Results Display
```typescript
// User sees:
📊 Scores: Crime (1-10), Noise (1-10), Lifestyle (1-10)
🤖 AI Insights: Summary, pros/cons, recommendations
📈 Comparisons: Current vs. New location
✅ Recommendation: Move or stay with confidence score
```

---

## 📊 Data Sources

### Crime Data
- **Source:** Los Angeles crime reports
- **Storage:** Firebase Firestore
- **Query:** 5-mile radius, geohash-based
- **Updates:** Can be refreshed via import script

### Noise Data
- **Source:** Google Places API
- **Factors:** Bars, nightclubs, transit, highways, airports
- **Algorithm:** Weighted scoring based on proximity and type
- **Scale:** 1-10 (1=quiet, 10=very loud)

### Amenities Data
- **Source:** Google Places API
- **Categories:** Restaurants, gyms, parks, shopping, entertainment
- **Radius:** 1km search, 500m for walkability
- **Matching:** Maps user hobbies to place types

### AI Insights
- **Provider:** Groq (Llama 3)
- **Input:** All collected data + user profile
- **Output:** Natural language insights and recommendations
- **Context:** Personalized to user's lifestyle and schedule

---

## 🔧 Configuration

### Supported Hobbies
```typescript
const HOBBIES = [
  'dining',    // Restaurants, cafes
  'coffee',    // Coffee shops
  'bars',      // Bars, nightclubs
  'gym',       // Fitness centers
  'shopping',  // Malls, stores
  'hiking',    // Parks, trails
  'movies',    // Theaters
  'art',       // Galleries, museums
  'music',     // Venues, concert halls
  'sports',    // Stadiums, sports facilities
  'reading',   // Libraries, bookstores
  'gaming',    // Game stores, arcades
];
```

### Scoring Algorithms

**Crime Score (1-10):**
```
0 crimes = 10 (perfect)
1-5 crimes = 9 (excellent)
6-10 crimes = 8 (very good)
11-20 crimes = 7 (good)
21-30 crimes = 6 (above average)
31-50 crimes = 5 (average)
51-75 crimes = 4 (below average)
76-100 crimes = 3 (concerning)
101-150 crimes = 2 (high risk)
150+ crimes = 1 (very high risk)
```

**Noise Score (1-10):**
```
Base: 1 point
+ Places nearby: +0.15 per place (max 3)
+ Highway: +3, Major road: +1.5, Residential: +0.3
+ Bars: +0.4 each
+ Transit: +0.3 each
+ Commercial: +0.15 each
+ Airport: +2 bonus
```

**Walkability Score (1-10):**
```
Based on places within 500m:
50+ places = 10
40-49 places = 9
30-39 places = 8
20-29 places = 7
15-19 places = 6
10-14 places = 5
7-9 places = 4
5-6 places = 3
3-4 places = 2
0-2 places = 1
```

---

## 🔒 Privacy & Security

- ✅ **No user accounts** - No login required
- ✅ **Local storage** - Data stays on device
- ✅ **No tracking** - No analytics or user tracking
- ✅ **API keys secure** - Stored in `.env` (not committed)
- ✅ **Firebase rules** - Read-only access to crime data

### Environment Variables
Never commit these files:
- `.env` - API keys
- `serviceAccountKey.json` - Firebase credentials

Add to `.gitignore`:
```
.env
serviceAccountKey.json
scripts/serviceAccountKey.json
```

---

## 💰 API Costs

### Free Tier (Monthly)
```
Google Places API:
- Places Autocomplete: 2,500 free
- Nearby Search: 5,000 free
- Geocoding: 40,000 free

Groq API:
- Llama 3 8B: Free tier available
- Rate limits apply

Firebase:
- Firestore: 50k reads/day free
- Storage: 1GB free
```

### Estimated Usage Per Comparison
```
- Address autocomplete: 2-4 calls
- Crime query: 1-2 calls
- Noise analysis: 4-6 calls
- Amenities: 5-15 calls (depends on hobbies)
- AI insights: 1 call

Total: ~15-30 API calls per comparison
```

### Cost Projection
```
Free tier supports:
- ~150-300 comparisons/month
- ~5-10 comparisons/day

Perfect for testing and initial users!
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Crime Data
```bash
cd scripts
node testCrimeQuery.js
```

### Check Data Quality
```bash
cd scripts
node fixMissingCoordinates.js
```

### Manual Testing Checklist
- [ ] Address autocomplete works (shows CA addresses)
- [ ] California-only validation works
- [ ] Work schedule saves correctly
- [ ] Sleep schedule wheel pickers work (iOS)
- [ ] Hobbies selection saves
- [ ] Analysis completes without errors
- [ ] Results display with all sections
- [ ] AI insights are relevant
- [ ] Crime scores match data
- [ ] Noise scores are reasonable
- [ ] Amenities match selected hobbies

---

## 📚 Documentation

### Setup Guides
- `FIREBASE_SETUP_GUIDE.md` - Complete Firebase setup
- `FIREBASE_INSTALLATION.md` - Package installation
- `DROPDOWN_FIX_GUIDE.md` - Address autocomplete troubleshooting
- `SCROLLABLE_SCREENS_SETUP.md` - Screen setup with pickers

### Implementation Guides
- `REAL_NOISE_DATA_SETUP.md` - Noise analysis with Google Places
- `REAL_AMENITIES_SETUP.md` - Amenities matching system
- `CRIME_DATA_ISSUES.md` - Crime data troubleshooting

### Technical Docs
- `BUGS_FIXED_SUMMARY.md` - Known issues and fixes
- `CALIFORNIA_FIX.md` - Address restriction implementation
- `CHECK_CRIME_DATA.md` - Data quality checks

---

## 🐛 Troubleshooting

### Common Issues

**1. "VirtualizedLists should never be nested"**
- Solution: Already suppressed in code with `LogBox.ignoreLogs()`
- See: `SUPPRESS_WARNINGS_GUIDE.md`

**2. Google Places dropdown not appearing**
- Check API key in `.env`
- Verify APIs are enabled in Google Cloud Console
- See: `DROPDOWN_FIX_GUIDE.md`

**3. Crime data missing coordinates**
- Run: `node scripts/fixMissingCoordinates.js`
- Check Firestore for field name (`lon` vs `lng`)
- See: `CRIME_DATA_ISSUES.md`

**4. Noise always showing 10/10**
- Check API quota in Google Cloud Console
- Verify network is enabled
- Fallback to formula-based if API fails

**5. App crashes on iOS**
- Run: `cd ios && pod install`
- Clean build: `cd ios && xcodebuild clean`
- Check iOS deployment target (iOS 13+)

---

## 🚀 Deployment

### iOS

1. **Configure:**
```bash
cd ios
open MoveWise.xcworkspace
```

2. **Update Bundle ID** in Xcode

3. **Add API keys** to Info.plist:
```xml
<key>GOOGLE_MAPS_API_KEY</key>
<string>$(GOOGLE_MAPS_API_KEY)</string>
```

4. **Build for release:**
```bash
npm run ios --configuration Release
```

### Android

1. **Configure:**
Edit `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('your-key.keystore')
        storePassword 'your-password'
        keyAlias 'your-alias'
        keyPassword 'your-password'
    }
}
```

2. **Build APK:**
```bash
cd android
./gradlew assembleRelease
```

3. **Output:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

### Development Guidelines
- Use TypeScript for type safety
- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test on both iOS and Android

---

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] Real commute times (Google Distance Matrix API)
- [ ] Save comparisons to Firebase
- [ ] Comparison history
- [ ] Share results via link
- [ ] PDF export of analysis

### Version 1.2 (Future)
- [ ] More cities (expand beyond California)
- [ ] School ratings integration
- [ ] Public transit analysis
- [ ] Neighborhood demographics
- [ ] Cost of living comparison
- [ ] Property prices integration

### Version 2.0 (Future)
- [ ] User accounts
- [ ] Favorite locations
- [ ] Collaborative comparisons
- [ ] Social features
- [ ] Push notifications
- [ ] Widget support

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Faizan**
- Graduate Student in Computer Science at Kennesaw State University
- Software Engineer with expertise in distributed systems

---

## 🙏 Acknowledgments

- **Anthropic** - Claude AI for development assistance
- **Groq** - Fast AI inference with Llama 3
- **Google** - Places API and Maps platform
- **Firebase** - Backend infrastructure
- **React Native** - Cross-platform framework
- **LA Open Data** - Crime statistics

**Made with ❤️ using AI-assisted development**

*MoveWise - Make Smarter Moving Decisions*
