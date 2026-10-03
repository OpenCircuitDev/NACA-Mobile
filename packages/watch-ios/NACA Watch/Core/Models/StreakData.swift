import Foundation

struct StreakData: Decodable {
    let userId: String
    let communityId: String?
    let currentStreak: Int
    let longestStreak: Int
    let lastActivityDate: String?

    /// Whether the streak is active today
    var isActiveToday: Bool {
        guard let dateString = lastActivityDate else { return false }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: dateString) else { return false }
        return Calendar.current.isDateInToday(date)
    }
}
