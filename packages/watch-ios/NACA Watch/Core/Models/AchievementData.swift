import Foundation

struct AchievementListData: Decodable {
    let userId: String
    let communityId: String?
    let totalUnlocked: Int
    let totalAvailable: Int
    let achievements: [Achievement]
}

struct Achievement: Decodable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let iconUrl: String?
    let badgeColor: String?
    let criteriaType: String?
    let criteriaThreshold: Int?
    let xpReward: Int?
    let isHidden: Bool
    let unlocked: Bool
    let earnedAt: String?

    var isUnlocked: Bool { unlocked }

    var earnedDate: Date? {
        guard let earnedAt else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: earnedAt)
    }
}
