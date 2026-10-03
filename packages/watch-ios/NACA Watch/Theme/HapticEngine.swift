import WatchKit

enum HapticEngine {
    static func correctAnswer() {
        WKInterfaceDevice.current().play(.success)
    }

    static func wrongAnswer() {
        WKInterfaceDevice.current().play(.failure)
    }

    static func cardFlip() {
        WKInterfaceDevice.current().play(.click)
    }

    static func achievementUnlocked() {
        WKInterfaceDevice.current().play(.notification)
    }

    static func streakMilestone() {
        WKInterfaceDevice.current().play(.directionUp)
    }

    static func tap() {
        WKInterfaceDevice.current().play(.click)
    }
}
