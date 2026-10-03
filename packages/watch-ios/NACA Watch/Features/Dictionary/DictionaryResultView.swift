import SwiftUI
import AVFoundation

struct DictionaryResultView: View {
    let entryId: String
    @State private var entry: DictionaryEntryData?
    @State private var isLoading = true
    @State private var isPlaying = false

    private var audioPlayer: AVPlayer?

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                if isLoading {
                    ProgressView()
                } else if let entry {
                    // Word
                    Text(entry.language ?? "—")
                        .font(NACATypography.title2)
                        .foregroundColor(.nacaPrimary)

                    // Pronunciation
                    if let pron = entry.pronunciationKey {
                        Text(pron)
                            .font(NACATypography.caption)
                            .foregroundColor(.nacaTextLight)
                            .italic()
                    }

                    // Translation
                    Text(entry.english ?? "—")
                        .font(NACATypography.headline)

                    // Category
                    if let cat = entry.category {
                        Text(cat)
                            .font(NACATypography.caption2)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.nacaSecondary.opacity(0.2))
                            .cornerRadius(6)
                    }

                    // Literal translation
                    if let literal = entry.literalTranslation {
                        VStack(spacing: 2) {
                            Text("Literal Translation")
                                .font(NACATypography.caption2)
                                .foregroundColor(.nacaTextLight)
                            Text(literal)
                                .font(NACATypography.body)
                        }
                    }

                    // Morphological breakdown
                    if let morph = entry.morphologicalBreakdown {
                        VStack(spacing: 2) {
                            Text("Breakdown")
                                .font(NACATypography.caption2)
                                .foregroundColor(.nacaTextLight)
                            Text(morph)
                                .font(NACATypography.body)
                        }
                    }

                    // Play audio
                    if entry.audioURL != nil {
                        Button(action: playAudio) {
                            Label(
                                isPlaying ? "Playing..." : "Listen",
                                systemImage: "speaker.wave.2.fill"
                            )
                        }
                        .buttonStyle(.bordered)
                        .tint(.nacaPrimary)
                    }

                    // Speaker info
                    if let speaker = entry.speakerName {
                        Text("Speaker: \(speaker)")
                            .font(NACATypography.caption)
                            .foregroundColor(.nacaTextLight)
                    }
                } else {
                    Text("Entry not found")
                        .foregroundColor(.nacaTextLight)
                }
            }
            .padding()
        }
        .navigationTitle("Entry")
        .task { await loadEntry() }
    }

    private func loadEntry() async {
        isLoading = true
        do {
            let response: PackageResponse<DictionaryEntryData> = try await APIClient.shared.request(
                path: Endpoints.Dictionary.entry(entryId)
            )
            entry = response.data
        } catch {
            entry = nil
        }
        isLoading = false
    }

    private func playAudio() {
        guard let url = entry?.audioURL else { return }
        isPlaying = true
        let player = AVPlayer(url: url)
        player.play()
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            isPlaying = false
        }
    }
}
