import SwiftUI

struct AchievementDetailView: View {
    let achievement: Achievement

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Icon
                Image(systemName: achievement.isUnlocked ? "trophy.fill" : "lock.fill")
                    .font(.system(size: 36))
                    .foregroundColor(achievement.isUnlocked ? .nacaSecondary : .gray)

                // Name
                Text(achievement.name)
                    .font(NACATypography.headline)
                    .multilineTextAlignment(.center)

                // Description
                if let desc = achievement.description {
                    Text(desc)
                        .font(NACATypography.body)
                        .foregroundColor(.nacaTextLight)
                        .multilineTextAlignment(.center)
                }

                // XP reward
                if let xp = achievement.xpReward {
                    Label("+\(xp) XP", systemImage: "star.fill")
                        .font(NACATypography.caption)
                        .foregroundColor(.nacaSecondary)
                }

                // Status
                if achievement.isUnlocked {
                    Label("Unlocked", systemImage: "checkmark.circle.fill")
                        .foregroundColor(.nacaSuccess)
                        .font(NACATypography.caption)

                    if let date = achievement.earnedDate {
                        Text(date, style: .date)
                            .font(NACATypography.caption2)
                            .foregroundColor(.nacaTextLight)
                    }
                } else {
                    // Progress toward criteria
                    if let type = achievement.criteriaType, let threshold = achievement.criteriaThreshold {
                        Text("\(type): \(threshold) required")
                            .font(NACATypography.caption)
                            .foregroundColor(.nacaTextLight)
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Achievement")
    }
}
