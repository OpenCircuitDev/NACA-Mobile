import Foundation

@Observable
class XPViewModel: ObservableObject {
    var xp: XPData?
    var isLoading = false

    func load() async {
        guard let userId = AuthManager.shared.currentUser?.id else { return }
        isLoading = true

        do {
            let response: PackageResponse<XPData> = try await APIClient.shared.request(
                path: Endpoints.Gamification.xp(userId)
            )
            xp = response.data
            CacheManager.updateFromXP(response.data)
        } catch {
            xp = XPData(
                userId: userId,
                communityId: nil,
                totalXp: CacheManager.cachedXP,
                level: CacheManager.cachedLevel,
                currentLevelXp: 0,
                nextLevelXp: 100,
                progressPercent: CacheManager.cachedProgressPercent,
                rank: nil
            )
        }

        isLoading = false
    }
}
