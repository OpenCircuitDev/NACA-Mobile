import Foundation

@Observable
class FlashcardViewModel: ObservableObject {
    var items: [GameDataItem] = []
    var currentIndex = 0
    var score = 0
    var isFlipped = false
    var isLoading = false
    var isComplete = false

    var total: Int { items.count }

    var currentItem: GameDataItem? {
        guard currentIndex < items.count else { return nil }
        return items[currentIndex]
    }

    func load() async {
        isLoading = true

        do {
            // Load available game datasets and pick the first flashcard-type one
            let listResponse: PackageResponse<[GameDatasetData]> = try await APIClient.shared.request(
                path: Endpoints.GameData.list
            )

            guard let dataset = listResponse.data.first else {
                isLoading = false
                return
            }

            let response: PackageResponse<GameDatasetData> = try await APIClient.shared.request(
                path: Endpoints.GameData.dataset(dataset.id)
            )

            items = response.data.items.shuffled()
        } catch {
            // No items available
            items = []
        }

        isLoading = false
    }

    func answer(correct: Bool) {
        if correct { score += 1 }
        isFlipped = false

        if currentIndex + 1 >= items.count {
            isComplete = true

            // Record progress
            Task {
                await recordProgress()
            }
        } else {
            currentIndex += 1
        }
    }

    func reset() {
        currentIndex = 0
        score = 0
        isFlipped = false
        isComplete = false
        items.shuffle()
    }

    private func recordProgress() async {
        guard let userId = AuthManager.shared.currentUser?.id else { return }

        struct ProgressBody: Encodable {
            let eventType: String
            let sourceType: String
            let sourceId: String
            let score: Int
            let xpEarned: Int
        }

        let xpEarned = Int(Double(score) / Double(total) * 20)

        let _: PackageResponse<EmptyData>? = try? await APIClient.shared.request(
            method: "POST",
            path: Endpoints.Progress.record(userId),
            body: ProgressBody(
                eventType: "game_complete",
                sourceType: "flashcard",
                sourceId: "watch_drill",
                score: score,
                xpEarned: xpEarned
            )
        )
    }
}

struct EmptyData: Decodable {}
