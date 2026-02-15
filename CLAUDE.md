# NACA-Mobile

## Project Overview
React Native (Expo) mobile app for the NACA Community platform (naca.community). Provides iOS and Android access to Indigenous language/culture preservation tools for community members, educators, contributors, and students.

## Tech Stack
- **Framework:** React Native 0.76 + Expo SDK ~52 (managed workflow)
- **Routing:** Expo Router ~4 (file-based, `app/` directory)
- **State:** TanStack React Query v5 + React Context
- **Auth:** JWT tokens (access 15min + refresh 30 days) via `/api/mobile/auth/*`
- **Styling:** React Native StyleSheet (no NativeWind yet)
- **Storage:** expo-secure-store (tokens), @react-native-async-storage (cache/prefs)
- **Audio:** expo-av (playback + recording)
- **Notifications:** expo-notifications (Expo push tokens)

## Project Structure
```
app/                    # Expo Router screens (file-based routing)
  (auth)/               # Login/register (unauthenticated)
  (tabs)/               # Bottom tab bar (authenticated)
    index.tsx           # Home / Dashboard
    dictionary.tsx      # Dictionary search
    learn.tsx           # Learning hub
    community.tsx       # Community features
    profile.tsx         # User profile + settings
  dictionary/           # Entry detail, create entry
  lessons/              # Unit detail, lesson player, browse
  activities/           # Game browser + 6 native games
    flashcard/, matching/, scramble/, audio/, sentence/, timeline/
  stories/              # Culture library browser + viewer
  chat/                 # Channel list + conversation
  learning-paths/       # Browse + detail
  contributions/        # Contribution list + new
  notifications/        # Notification feed
  settings/             # Settings hub, accessibility, notifications
src/
  api/                  # API client modules (client.ts has auto-refresh)
  components/           # Reusable UI, audio, game, gamification components
  contexts/             # AuthContext, CommunityContext
  hooks/                # useGameState, useAudioPlayer, usePushNotifications, useOfflineCache
  constants/            # config.ts (API_URL)
  theme/                # colors, typography, spacing tokens
  types/                # TypeScript interfaces
```

## API Architecture
- All API calls go through `src/api/client.ts` which auto-injects JWT Bearer token and X-NACA-Community header
- 401 responses trigger automatic token refresh via `/api/mobile/auth/refresh`
- Backend endpoints: `/api/mobile/auth/*` (auth), `/api/mobile/push/*` (push tokens), `/api/connected/*` (all feature APIs)
- JWT tokens validated in NACA-Core via `connectedApiUtils.ts` → `validateConnectedAppAuth()` with `mobile_jwt` auth method

## Backend Changes (in NACA-Core)
Files added/modified for mobile support:
- `server/services/jwtService.ts` — JWT sign/verify
- `server/routes/mobileAuthRoutes.ts` — Login/register/refresh/logout
- `server/routes/mobilePushRoutes.ts` — Push token management
- `server/routes/connected/mobileRoutes.ts` — Mobile dashboard/communities
- `server/storage/mobileHelpers.ts` — DB helpers for refresh + push tokens
- `shared/schema.ts` — `mobileRefreshTokens` + `pushDeviceTokens` tables
- `server/connectedApiUtils.ts` — JWT auth method in Connected API gateway

## Design Tokens
- Primary: `#1a365d` (navy), Secondary: `#c4a35a` (gold)
- Text: `#374151`, Muted: `#6b7280`, Background: `#f5f5f5`
- Card: `#ffffff`, Border: `#e5e7eb`

## Commands
```bash
npx expo start          # Start dev server (Expo Go)
npx expo start --dev-client  # Start with dev client
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

## Key Conventions
- All API modules in `src/api/` return typed responses
- Game screens use `useLocalSearchParams<{ datasetId: string }>()` for route params
- Games report scores via `recordProgressEvent()` in `src/api/progress.ts`
- Auth gate is in `app/(tabs)/_layout.tsx` — redirects to login if not authenticated
- Community context provides `activeCommunity` for multi-community support
- Offline cache via `useOfflineCache` hook with AsyncStorage + 24h TTL
