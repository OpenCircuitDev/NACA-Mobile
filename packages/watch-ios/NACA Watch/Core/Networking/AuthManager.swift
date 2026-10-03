import Foundation
import WatchKit

@Observable
class AuthManager {
    static let shared = AuthManager()

    private(set) var currentUser: UserInfo?
    private(set) var isLoading = false

    var activeCommunityId: String? {
        get { UserDefaults.standard.string(forKey: "naca_active_community_id") }
        set { UserDefaults.standard.set(newValue, forKey: "naca_active_community_id") }
    }

    var accessToken: String? { KeychainHelper.get("naca_watch_access_token") }
    var refreshToken: String? { KeychainHelper.get("naca_watch_refresh_token") }
    var isAuthenticated: Bool { accessToken != nil && currentUser != nil }

    func login(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }

        struct LoginBody: Encodable {
            let email: String
            let password: String
            let deviceInfo: String?
        }

        let deviceInfo = "watchOS-\(WKInterfaceDevice.current().systemVersion)"

        let response: AuthResponse = try await APIClient.shared.request(
            method: "POST",
            path: Endpoints.Auth.login,
            body: LoginBody(email: email, password: password, deviceInfo: deviceInfo),
            skipAuth: true
        )

        guard response.success,
              let accessToken = response.accessToken,
              let refreshToken = response.refreshToken,
              let user = response.user else {
            throw APIError.authFailed(response.message ?? "Login failed")
        }

        KeychainHelper.set(accessToken, for: "naca_watch_access_token")
        KeychainHelper.set(refreshToken, for: "naca_watch_refresh_token")
        currentUser = user
    }

    func refreshTokens() async -> Bool {
        guard let token = refreshToken else { return false }

        struct RefreshBody: Encodable {
            let refreshToken: String
        }

        do {
            let response: AuthResponse = try await APIClient.shared.request(
                method: "POST",
                path: Endpoints.Auth.refresh,
                body: RefreshBody(refreshToken: token),
                skipAuth: true
            )

            guard response.success,
                  let newAccess = response.accessToken,
                  let newRefresh = response.refreshToken else {
                return false
            }

            KeychainHelper.set(newAccess, for: "naca_watch_access_token")
            KeychainHelper.set(newRefresh, for: "naca_watch_refresh_token")
            if let user = response.user {
                currentUser = user
            }
            return true
        } catch {
            logout()
            return false
        }
    }

    /// Attempt to restore session from stored tokens on app launch
    func restoreSession() async {
        guard accessToken != nil else { return }
        isLoading = true
        defer { isLoading = false }

        let refreshed = await refreshTokens()
        if !refreshed {
            logout()
        }
    }

    func logout() {
        KeychainHelper.delete("naca_watch_access_token")
        KeychainHelper.delete("naca_watch_refresh_token")
        currentUser = nil
        activeCommunityId = nil
    }
}
