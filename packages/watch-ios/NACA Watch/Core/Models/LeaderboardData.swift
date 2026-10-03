import Foundation

struct LeaderboardData: Decodable {
    let communityId: String?
    let period: String
    let entries: [LeaderboardEntry]
}

struct LeaderboardEntry: Decodable, Identifiable {
    var id: String { userId }
    let rank: Int
    let userId: String
    let username: String?
    let displayName: String?
    let xp: Int

    var name: String {
        displayName ?? username ?? "Unknown"
    }
}
