import Foundation

enum APIError: Error, LocalizedError {
    case sessionExpired
    case httpError(status: Int, message: String)
    case authFailed(String)
    case decodingError(Error)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .sessionExpired: return "Session expired. Please log in again."
        case .httpError(let status, let message): return "HTTP \(status): \(message)"
        case .authFailed(let message): return message
        case .decodingError(let error): return "Failed to decode response: \(error.localizedDescription)"
        case .networkError(let error): return error.localizedDescription
        }
    }
}

actor APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let baseURL: URL
    private var isRefreshing = false
    private var pendingRefreshContinuations: [CheckedContinuation<Bool, Never>] = []

    init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)

        let urlString = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String
            ?? "https://naca.community"
        self.baseURL = URL(string: urlString)!
    }

    func request<T: Decodable>(
        method: String = "GET",
        path: String,
        body: (any Encodable)? = nil,
        skipAuth: Bool = false
    ) async throws -> T {
        let url: URL
        if path.contains("?") {
            // Path includes query params — don't use appendingPathComponent which encodes the ?
            url = URL(string: baseURL.absoluteString + path)!
        } else {
            url = baseURL.appendingPathComponent(path)
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method
        urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")

        if let body {
            urlRequest.httpBody = try JSONEncoder().encode(body)
            urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        if !skipAuth, let token = await AuthManager.shared.accessToken {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let communityId = await AuthManager.shared.activeCommunityId {
            urlRequest.setValue(communityId, forHTTPHeaderField: "X-NACA-Community")
        }

        var data: Data
        var response: URLResponse

        do {
            (data, response) = try await session.data(for: urlRequest)
        } catch {
            throw APIError.networkError(error)
        }

        // Auto-refresh on 401
        if let http = response as? HTTPURLResponse, http.statusCode == 401, !skipAuth {
            let refreshed = await refreshTokensOnce()
            if refreshed, let newToken = await AuthManager.shared.accessToken {
                urlRequest.setValue("Bearer \(newToken)", forHTTPHeaderField: "Authorization")
                do {
                    (data, response) = try await session.data(for: urlRequest)
                } catch {
                    throw APIError.networkError(error)
                }
            } else {
                throw APIError.sessionExpired
            }
        }

        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            let bodyString = String(data: data, encoding: .utf8) ?? ""
            throw APIError.httpError(status: status, message: bodyString)
        }

        do {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    /// Deduplicates concurrent refresh calls
    private func refreshTokensOnce() async -> Bool {
        if isRefreshing {
            return await withCheckedContinuation { continuation in
                pendingRefreshContinuations.append(continuation)
            }
        }

        isRefreshing = true
        let result = await AuthManager.shared.refreshTokens()
        isRefreshing = false

        // Resume all waiters
        for continuation in pendingRefreshContinuations {
            continuation.resume(returning: result)
        }
        pendingRefreshContinuations.removeAll()

        return result
    }
}
