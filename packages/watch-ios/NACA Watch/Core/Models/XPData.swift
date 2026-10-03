import Foundation

struct XPData: Decodable {
    let userId: String
    let communityId: String?
    let totalXp: Int
    let level: Int
    let currentLevelXp: Int
    let nextLevelXp: Int
    let progressPercent: Int
    let rank: Int?

    /// Progress as a fraction (0.0 to 1.0) for gauges
    var progressFraction: Double {
        Double(progressPercent) / 100.0
    }

    /// XP earned within current level
    var xpInCurrentLevel: Int {
        totalXp - currentLevelXp
    }

    /// XP needed to reach next level
    var xpNeededForNextLevel: Int {
        nextLevelXp - currentLevelXp
    }
}
