import SwiftUI

struct AchievementsView: View {
    @StateObject private var viewModel = AchievementsViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else {
                List {
                    // Summary
                    Section {
                        HStack {
                            Image(systemName: "trophy.fill")
                                .foregroundColor(.nacaSecondary)
                            Text("\(viewModel.totalUnlocked)/\(viewModel.totalAvailable) Unlocked")
                                .font(NACATypography.body)
                        }
                    }

                    // Achievement list
                    Section("Achievements") {
                        ForEach(viewModel.achievements) { achievement in
                            NavigationLink(destination: AchievementDetailView(achievement: achievement)) {
                                HStack(spacing: 8) {
                                    Image(systemName: achievement.isUnlocked ? "trophy.fill" : "lock.fill")
                                        .foregroundColor(achievement.isUnlocked ? .nacaSecondary : .gray)
                                        .font(.system(size: 16))

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(achievement.name)
                                            .font(NACATypography.caption)
                                            .foregroundColor(achievement.isUnlocked ? .nacaText : .nacaTextLight)

                                        if let xp = achievement.xpReward {
                                            Text("+\(xp) XP")
                                                .font(NACATypography.caption2)
                                                .foregroundColor(.nacaSecondary)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Achievements")
        .task { await viewModel.load() }
    }
}
