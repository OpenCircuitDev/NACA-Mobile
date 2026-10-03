import Foundation

/// Wraps responses from /api/connected/learning/* routes
struct PackageResponse<T: Decodable>: Decodable {
    let data: T
    let subscriptionRequired: Bool
    let package: String?
    let message: String?
    let feature: String?
}

/// Wraps responses from /api/mobile/auth/* routes
struct AuthResponse: Decodable {
    let success: Bool
    let accessToken: String?
    let refreshToken: String?
    let user: UserInfo?
    let message: String?
}

/// Simple success wrapper for /api/connected/mobile/* routes
struct SuccessResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let message: String?
}
