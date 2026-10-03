import Foundation
import AVFoundation

@Observable
class WordOfDayViewModel: ObservableObject {
    var entry: DictionaryEntryData?
    var dateString = ""
    var message: String?
    var isLoading = false
    var isPlayingAudio = false

    private var audioPlayer: AVPlayer?

    func load() async {
        isLoading = true

        do {
            let response: PackageResponse<WordOfDayData> = try await APIClient.shared.request(
                path: Endpoints.Dictionary.wordOfDay
            )

            entry = response.data.entry
            dateString = response.data.date
            message = response.data.message

            // Update cache for complications
            CacheManager.updateFromWordOfDay(response.data)
        } catch {
            // Fall back to cached data
            if let cachedWord = CacheManager.cachedWordOfDay {
                message = "Cached: \(cachedWord)"
            } else {
                message = "Unable to load. Check connection."
            }
        }

        isLoading = false
    }

    func playAudio() {
        guard let url = entry?.audioURL else { return }

        isPlayingAudio = true
        audioPlayer = AVPlayer(url: url)
        audioPlayer?.play()

        // Reset after estimated duration
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in
            self?.isPlayingAudio = false
        }
    }
}
