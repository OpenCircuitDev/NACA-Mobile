import Foundation

/// Response wrapper for /api/connected/mobile/notifications
struct NotificationResponse: Decodable {
    let success: Bool
    let data: NotificationData
}

struct NotificationData: Decodable {
    let notifications: [NotificationItem]
    let unreadCount: Int
    let total: Int
}

struct NotificationItem: Decodable, Identifiable {
    let id: String
    let type: String
    let title: String
    let message: String?
    let read: Bool?
    let createdAt: String?

    var isRead: Bool { read ?? false }

    var date: Date? {
        guard let createdAt else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: createdAt)
    }

    var icon: String {
        switch type {
        case "achievement": return "trophy.fill"
        case "xp_award": return "star.fill"
        case "streak": return "flame.fill"
        case "forum_reply": return "bubble.left.fill"
        case "event_reminder": return "calendar"
        case "system": return "bell.fill"
        default: return "bell.fill"
        }
    }
}
