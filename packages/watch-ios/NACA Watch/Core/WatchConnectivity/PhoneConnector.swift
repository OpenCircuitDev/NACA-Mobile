import Foundation
import WatchConnectivity

enum PhoneError: Error {
    case notReachable
    case notSupported
}

class PhoneConnector: NSObject, ObservableObject, WCSessionDelegate {
    static let shared = PhoneConnector()

    @Published var isPhoneReachable = false

    private override init() {
        super.init()
    }

    func activate() {
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    // MARK: - Receive pushed data from iPhone

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        DispatchQueue.main.async {
            if let streak = applicationContext["streak"] as? Int {
                CacheManager.cachedStreak = streak
            }
            if let xp = applicationContext["xp"] as? Int {
                CacheManager.cachedXP = xp
            }
            if let level = applicationContext["level"] as? Int {
                CacheManager.cachedLevel = level
            }
            if let word = applicationContext["word"] as? String {
                CacheManager.cachedWordOfDay = word
            }
            if let translation = applicationContext["translation"] as? String {
                CacheManager.cachedTranslation = translation
            }
        }
    }

    // MARK: - Request data from iPhone (fallback when no network)

    func requestFromPhone(type: String, params: [String: Any] = [:]) async throws -> [String: Any] {
        guard WCSession.default.isReachable else {
            throw PhoneError.notReachable
        }

        return try await withCheckedThrowingContinuation { continuation in
            var message = params
            message["requestType"] = type

            WCSession.default.sendMessage(message, replyHandler: { reply in
                continuation.resume(returning: reply)
            }, errorHandler: { error in
                continuation.resume(throwing: error)
            })
        }
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isPhoneReachable = session.isReachable
        }
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isPhoneReachable = session.isReachable
        }
    }
}
