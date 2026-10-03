import Foundation

@Observable
class StreakViewModel: ObservableObject {
    var streak: StreakData?
    var isLoading = false

    func load() async {
        guard let userId = AuthManager.shared.currentUser?.id else { return }
        isLoading = true

        do {
            let response: PackageResponse<StreakData> = try await APIClient.shared.request(
                path: Endpoints.Gamification.streak(userId)
            )
            streak = response.data
            CacheManager.updateFromStreak(response.data)

            // Haptic for streak milestones
            if response.data.currentStreak > 0 && response.data.currentStreak % 7 == 0 {
                HapticEngine.streakMilestone()
            }
        } catch {
            // Use cached value
            streak = StreakData(
                userId: userId,
                communityId: nil,
                currentStreak: CacheManager.cachedStreak,
                longestStreak: CacheManager.cachedStreak,
                lastActivityDate: nil
            )
        }

        isLoading = false
    }
}
