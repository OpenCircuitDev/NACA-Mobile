import Foundation

enum CacheManager {
    private static let defaults = UserDefaults.standard

    // Cached values for complications (available offline)
    static var cachedStreak: Int {
        get { defaults.integer(forKey: "naca_cached_streak") }
        set { defaults.set(newValue, forKey: "naca_cached_streak") }
    }

    static var cachedXP: Int {
        get { defaults.integer(forKey: "naca_cached_xp") }
        set { defaults.set(newValue, forKey: "naca_cached_xp") }
    }

    static var cachedLevel: Int {
        get { defaults.integer(forKey: "naca_cached_level") }
        set { defaults.set(newValue, forKey: "naca_cached_level") }
    }

    static var cachedWordOfDay: String? {
        get { defaults.string(forKey: "naca_cached_word") }
        set { defaults.set(newValue, forKey: "naca_cached_word") }
    }

    static var cachedTranslation: String? {
        get { defaults.string(forKey: "naca_cached_translation") }
        set { defaults.set(newValue, forKey: "naca_cached_translation") }
    }

    static var cachedProgressPercent: Int {
        get { defaults.integer(forKey: "naca_cached_progress_percent") }
        set { defaults.set(newValue, forKey: "naca_cached_progress_percent") }
    }

    static var lastCacheUpdate: Date? {
        get { defaults.object(forKey: "naca_cache_updated_at") as? Date }
        set { defaults.set(newValue, forKey: "naca_cache_updated_at") }
    }

    /// Update cache from fresh API data
    static func updateFromXP(_ xp: XPData) {
        cachedXP = xp.totalXp
        cachedLevel = xp.level
        cachedProgressPercent = xp.progressPercent
        lastCacheUpdate = Date()
    }

    static func updateFromStreak(_ streak: StreakData) {
        cachedStreak = streak.currentStreak
        lastCacheUpdate = Date()
    }

    static func updateFromWordOfDay(_ word: WordOfDayData) {
        cachedWordOfDay = word.entry?.language
        cachedTranslation = word.entry?.english
        lastCacheUpdate = Date()
    }

    /// Check if cache is stale (older than 1 hour)
    static var isCacheStale: Bool {
        guard let lastUpdate = lastCacheUpdate else { return true }
        return Date().timeIntervalSince(lastUpdate) > 3600
    }

    static func clearAll() {
        let keys = [
            "naca_cached_streak", "naca_cached_xp", "naca_cached_level",
            "naca_cached_word", "naca_cached_translation",
            "naca_cached_progress_percent", "naca_cache_updated_at"
        ]
        keys.forEach { defaults.removeObject(forKey: $0) }
    }
}
