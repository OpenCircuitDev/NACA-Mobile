import SwiftUI

struct FlashcardDrillView: View {
    @StateObject private var viewModel = FlashcardViewModel()

    var body: some View {
        VStack(spacing: 8) {
            if viewModel.isLoading {
                ProgressView("Loading cards...")
            } else if viewModel.isComplete {
                FlashcardResultView(
                    score: viewModel.score,
                    total: viewModel.total,
                    onRestart: { viewModel.reset() }
                )
            } else if let item = viewModel.currentItem {
                // Progress
                Text("\(viewModel.currentIndex + 1)/\(viewModel.total)")
                    .font(NACATypography.caption2)
                    .foregroundColor(.nacaTextLight)

                // Flashcard
                FlashcardCardView(
                    front: item.word,
                    back: item.translation,
                    isFlipped: viewModel.isFlipped,
                    onTap: {
                        viewModel.isFlipped.toggle()
                        HapticEngine.cardFlip()
                    }
                )

                // Answer buttons (shown when flipped)
                if viewModel.isFlipped {
                    HStack(spacing: 20) {
                        Button(action: {
                            HapticEngine.wrongAnswer()
                            viewModel.answer(correct: false)
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 32))
                                .foregroundColor(.nacaError)
                        }
                        .buttonStyle(.plain)

                        Button(action: {
                            HapticEngine.correctAnswer()
                            viewModel.answer(correct: true)
                        }) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 32))
                                .foregroundColor(.nacaSuccess)
                        }
                        .buttonStyle(.plain)
                    }
                } else {
                    Text("Tap to flip")
                        .font(NACATypography.caption)
                        .foregroundColor(.nacaTextLight)
                }
            } else {
                VStack(spacing: 8) {
                    Text("No flashcards available")
                        .foregroundColor(.nacaTextLight)
                    Button("Retry") {
                        Task { await viewModel.load() }
                    }
                }
            }
        }
        .padding(.horizontal, 4)
        .navigationTitle("Practice")
        .task { await viewModel.load() }
    }
}
