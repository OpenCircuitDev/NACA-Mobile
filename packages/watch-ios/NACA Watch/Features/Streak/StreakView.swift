import SwiftUI

struct StreakView: View {
    @StateObject private var viewModel = StreakViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if viewModel.isLoading {
                    ProgressView()
                } else if let streak = viewModel.streak {
                    // Fire icon with current streak
                    ZStack {
                        Circle()
                            .fill(Color.nacaSecondary.opacity(0.15))
                            .frame(width: 80, height: 80)

                        VStack(spacing: 2) {
                            Image(systemName: "flame.fill")
                                .font(.system(size: 24))
                                .foregroundColor(streak.currentStreak > 0 ? .orange : .gray)

                            Text("\(streak.currentStreak)")
                                .font(NACATypography.title2)
                                .foregroundColor(.nacaPrimary)
                        }
                    }

                    Text(streak.currentStreak == 1 ? "day streak" : "day streak")
                        .font(NACATypography.body)
                        .foregroundColor(.nacaTextLight)

                    // Active today indicator
                    if streak.isActiveToday {
                        Label("Active today", systemImage: "checkmark.circle.fill")
                            .font(NACATypography.caption)
                            .foregroundColor(.nacaSuccess)
                    }

                    Divider()

                    // Longest streak
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Longest")
                                .font(NACATypography.caption)
                                .foregroundColor(.nacaTextLight)
                            Text("\(streak.longestStreak) days")
                                .font(NACATypography.headline)
                        }
                        Spacer()
                    }
                } else {
                    Text("No streak data")
                        .foregroundColor(.nacaTextLight)
                }
            }
            .padding()
        }
        .navigationTitle("Streak")
        .task { await viewModel.load() }
    }
}
