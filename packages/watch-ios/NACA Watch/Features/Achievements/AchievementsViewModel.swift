import Foundation

@Observable
class AchievementsViewModel: ObservableObject {
    var achievements: [Achievement] = []
    var totalUnlocked = 0
    var totalAvailable = 0
    var isLoading = false

    func load() async {
        guard let userId = AuthManager.shared.currentUser?.id else { return }
        isLoading = true

        do {
            let response: PackageResponse<AchievementListData> = try await APIClient.shared.request(
                path: Endpoints.Gamification.achievements(userId)
            )
            achievements = response.data.achievements
            totalUnlocked = response.data.totalUnlocked
            totalAvailable = response.data.totalAvailable

            // Haptic if new achievements unlocked
            let newUnlocked = achievements.filter { $0.isUnlocked && $0.earnedDate != nil }
            if !newUnlocked.isEmpty {
                HapticEngine.achievementUnlocked()
            }
        } catch {
            achievements = []
        }

        isLoading = false
    }
}
