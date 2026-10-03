import { Stack } from 'expo-router';

/**
 * Elder Education Stack — Phase 1.
 *
 * Surfaces:
 *   - index    — dashboard (counts + nav cards)
 *   - review   — Elder review queue with commentary UI
 *   - author   — author a new teaching/contribution
 *   - record   — capture an elder_speech variant on a dictionary entry
 *   - library  — read-only history of your teachings, recordings, reviews
 *
 * Access gating happens at the SCREEN level (each screen checks
 * `activeCommunity.role` from CommunityContext). Non-Elder users see a friendly
 * "no access" view rather than the screen contents.
 */
export default function ElderStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a365d' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontSize: 20, fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Elder Education' }} />
      <Stack.Screen name="review" options={{ title: 'Review Queue' }} />
      <Stack.Screen name="author" options={{ title: 'Author Teaching' }} />
      <Stack.Screen name="record" options={{ title: 'Record Pronunciation' }} />
      <Stack.Screen name="library" options={{ title: 'My Library' }} />
    </Stack>
  );
}
