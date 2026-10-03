import Foundation
import SwiftUI

@Observable
class AppState {
    static let shared = AppState()

    var isInitialized = false

    func initialize() async {
        // Restore session from keychain
        await AuthManager.shared.restoreSession()

        // Activate WatchConnectivity
        PhoneConnector.shared.activate()

        isInitialized = true
    }
}
