import SwiftUI
import AVFoundation

struct WordOfDayView: View {
    @StateObject private var viewModel = WordOfDayViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                } else if let entry = viewModel.entry {
                    // Date
                    Text(viewModel.dateString)
                        .font(NACATypography.caption)
                        .foregroundColor(.nacaTextLight)

                    // Indigenous word
                    Text(entry.language ?? "—")
                        .font(NACATypography.title2)
                        .foregroundColor(.nacaPrimary)
                        .multilineTextAlignment(.center)

                    // Pronunciation
                    if let pronunciation = entry.pronunciationKey {
                        Text(pronunciation)
                            .font(NACATypography.caption)
                            .foregroundColor(.nacaTextLight)
                            .italic()
                    }

                    // English translation
                    Text(entry.english ?? "—")
                        .font(NACATypography.headline)
                        .foregroundColor(.nacaText)

                    // Category badge
                    if let category = entry.category {
                        Text(category)
                            .font(NACATypography.caption2)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.nacaSecondary.opacity(0.2))
                            .foregroundColor(.nacaSecondary)
                            .cornerRadius(8)
                    }

                    // Literal translation
                    if let literal = entry.literalTranslation {
                        VStack(spacing: 2) {
                            Text("Literal")
                                .font(NACATypography.caption2)
                                .foregroundColor(.nacaTextLight)
                            Text(literal)
                                .font(NACATypography.caption)
                        }
                    }

                    // Play audio button
                    if entry.audioURL != nil {
                        Button(action: { viewModel.playAudio() }) {
                            Label(
                                viewModel.isPlayingAudio ? "Playing..." : "Listen",
                                systemImage: viewModel.isPlayingAudio ? "speaker.wave.3.fill" : "speaker.wave.2.fill"
                            )
                        }
                        .buttonStyle(.bordered)
                        .tint(.nacaPrimary)
                    }
                } else if let message = viewModel.message {
                    Text(message)
                        .font(NACATypography.body)
                        .foregroundColor(.nacaTextLight)
                        .multilineTextAlignment(.center)
                } else {
                    Text("No word available")
                        .foregroundColor(.nacaTextLight)
                }
            }
            .padding()
        }
        .navigationTitle("Word of Day")
        .task { await viewModel.load() }
    }
}
