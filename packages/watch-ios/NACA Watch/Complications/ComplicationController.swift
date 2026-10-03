import WidgetKit
import SwiftUI

// MARK: - Shared Entry

/// Shared timeline entry used by all NACA complications.
struct NACAComplicationEntry: TimelineEntry {
    let date: Date
    let word: String?
    let translation: String?
    let streak: Int
    let xp: Int
    let level: Int
    let progressPercent: Int

    static var placeholder: NACAComplicationEntry {
        NACAComplicationEntry(
            date: Date(),
            word: "Wa sa",
            translation: "What is it?",
            streak: 7,
            xp: 1250,
            level: 5,
            progressPercent: 65
        )
    }

    /// Build an entry from CacheManager's persisted values (available offline).
    static func fromCache() -> NACAComplicationEntry {
        NACAComplicationEntry(
            date: Date(),
            word: CacheManager.cachedWordOfDay,
            translation: CacheManager.cachedTranslation,
            streak: CacheManager.cachedStreak,
            xp: CacheManager.cachedXP,
            level: CacheManager.cachedLevel,
            progressPercent: CacheManager.cachedProgressPercent
        )
    }
}

// MARK: - Timeline Provider

/// Fetches fresh data from the NACA API and falls back to cached values.
struct NACATimelineProvider: TimelineProvider {
    typealias Entry = NACAComplicationEntry

    func placeholder(in context: Context) -> NACAComplicationEntry {
        .placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (NACAComplicationEntry) -> Void) {
        completion(.fromCache())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NACAComplicationEntry>) -> Void) {
        Task {
            // Fetch all three data sources concurrently.
            // Each uses try? so a single failure falls back to cached data.

            async let wordFetch: PackageResponse<WordOfDayData>? = {
                try? await APIClient.shared.request(path: Endpoints.Dictionary.wordOfDay)
            }()

            let userId = await AuthManager.shared.currentUser?.id ?? ""

            async let xpFetch: PackageResponse<XPData>? = {
                guard !userId.isEmpty else { return nil }
                return try? await APIClient.shared.request(
                    path: Endpoints.Gamification.xp(userId)
                )
            }()

            async let streakFetch: PackageResponse<StreakData>? = {
                guard !userId.isEmpty else { return nil }
                return try? await APIClient.shared.request(
                    path: Endpoints.Gamification.streak(userId)
                )
            }()

            let (wordResult, xpResult, streakResult) = await (wordFetch, xpFetch, streakFetch)

            // Merge fresh API data with cached fallbacks.
            let entry = NACAComplicationEntry(
                date: Date(),
                word: wordResult?.data.entry?.language ?? CacheManager.cachedWordOfDay,
                translation: wordResult?.data.entry?.english ?? CacheManager.cachedTranslation,
                streak: streakResult?.data.currentStreak ?? CacheManager.cachedStreak,
                xp: xpResult?.data.totalXp ?? CacheManager.cachedXP,
                level: xpResult?.data.level ?? CacheManager.cachedLevel,
                progressPercent: xpResult?.data.progressPercent ?? CacheManager.cachedProgressPercent
            )

            // Persist to cache for offline complications.
            if let wordData = wordResult?.data {
                CacheManager.updateFromWordOfDay(wordData)
            }
            if let xpData = xpResult?.data {
                CacheManager.updateFromXP(xpData)
            }
            if let streakData = streakResult?.data {
                CacheManager.updateFromStreak(streakData)
            }

            // Refresh at midnight (new word of the day) or in 1 hour, whichever is sooner.
            let midnight = Calendar.current.startOfDay(for: Date().addingTimeInterval(86400))
            let oneHour = Date().addingTimeInterval(3600)
            let nextRefresh = min(midnight, oneHour)

            completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
        }
    }
}

// MARK: - Widget Bundle

/// Registers all NACA watchOS complications.
/// This lives in the widget extension target (separate from NACAWatchApp).
@main
struct NACAWidgetBundle: WidgetBundle {
    var body: some Widget {
        WordOfDayWidget()
        StreakWidget()
        XPWidget()
    }
}
