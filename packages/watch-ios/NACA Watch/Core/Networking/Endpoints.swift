// AUTO-GENERATED from packages/shared/src/constants/endpoints.ts
// Do not edit manually. Run: npm run watch:codegen

import Foundation

enum Endpoints {
    enum Auth {
        static let login = "/api/mobile/auth/login"
        static let register = "/api/mobile/auth/register"
        static let refresh = "/api/mobile/auth/refresh"
        static let logout = "/api/mobile/auth/logout"
    }

    enum Dictionary {
        static let search = "/api/connected/learning/dictionary/search"
        static func entry(_ id: String) -> String { "/api/connected/learning/dictionary/entries/\(id)" }
        static func entryAudio(_ id: String) -> String { "/api/connected/learning/dictionary/entries/\(id)/audio" }
        static let wordOfDay = "/api/connected/learning/dictionary/word-of-the-day"
        static let categories = "/api/connected/learning/dictionary/categories"
        static let stats = "/api/connected/learning/dictionary/stats"
    }

    enum Gamification {
        static func xp(_ userId: String) -> String { "/api/connected/learning/gamification/users/\(userId)/xp" }
        static func streak(_ userId: String) -> String { "/api/connected/learning/gamification/users/\(userId)/streak" }
        static func achievements(_ userId: String) -> String { "/api/connected/learning/gamification/users/\(userId)/achievements" }
        static func level(_ userId: String) -> String { "/api/connected/learning/gamification/users/\(userId)/level" }
        static let leaderboard = "/api/connected/learning/gamification/leaderboard"
        static let allAchievements = "/api/connected/learning/gamification/achievements"
    }

    enum GameData {
        static let list = "/api/connected/learning/game-data"
        static func dataset(_ id: String) -> String { "/api/connected/learning/game-data/\(id)" }
    }

    enum Lessons {
        static let list = "/api/connected/learning/lessons"
        static func detail(_ id: String) -> String { "/api/connected/learning/lessons/\(id)" }
        static let courses = "/api/connected/lessons/courses"
        static func course(_ id: String) -> String { "/api/connected/lessons/courses/\(id)" }
        static let units = "/api/connected/lessons/units"
        static func unit(_ id: String) -> String { "/api/connected/lessons/units/\(id)" }
    }

    enum Pathways {
        static let list = "/api/connected/learning/pathways/pathways"
        static func detail(_ id: String) -> String { "/api/connected/learning/pathways/pathways/\(id)" }
        static func structure(_ id: String) -> String { "/api/connected/learning/pathways/pathways/\(id)/structure" }
        static func enroll(_ userId: String) -> String { "/api/connected/learning/pathways/users/\(userId)/enroll" }
        static func progress(_ userId: String, _ pathwayId: String) -> String {
            "/api/connected/learning/pathways/users/\(userId)/pathways/\(pathwayId)/progress"
        }
        static func enrollments(_ userId: String) -> String { "/api/connected/learning/pathways/users/\(userId)/enrollments" }
    }

    enum Progress {
        static func summary(_ userId: String) -> String { "/api/connected/learning/progress/\(userId)" }
        static func record(_ userId: String) -> String { "/api/connected/learning/progress/\(userId)" }
        static func history(_ userId: String) -> String { "/api/connected/learning/progress/\(userId)/history" }
        static func lesson(_ userId: String, _ lessonId: String) -> String {
            "/api/connected/learning/progress/\(userId)/lessons/\(lessonId)"
        }
    }

    enum Mobile {
        static let communities = "/api/connected/mobile/communities"
        static func dashboard(_ communityId: String) -> String { "/api/connected/mobile/dashboard/\(communityId)" }
        static let notifications = "/api/connected/mobile/notifications"
    }

    enum Chat {
        static let channels = "/api/connected/communications/chat/channels"
        static let messages = "/api/connected/communications/chat/messages"
    }

    enum Media {
        static let list = "/api/connected/immersion/media"
        static func item(_ id: String) -> String { "/api/connected/immersion/media/\(id)" }
    }

    enum Contributions {
        static let submitEntry = "/api/connected/learning/dictionary/entries"
        static let feedback = "/api/connected/interactive/feedback"
    }

    enum Cultural {
        static let knowledge = "/api/connected/cultural-knowledge"
        static func knowledgeItem(_ id: String) -> String { "/api/connected/cultural-knowledge/\(id)" }
    }

    enum Speakers {
        static let list = "/api/connected/speakers"
        static func detail(_ id: String) -> String { "/api/connected/speakers/\(id)" }
    }

    enum Push {
        static let register = "/api/mobile/push/register"
        static let unregister = "/api/mobile/push/unregister"
    }
}
