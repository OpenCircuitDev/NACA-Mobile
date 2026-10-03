import SwiftUI

struct XPView: View {
    @StateObject private var viewModel = XPViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if viewModel.isLoading {
                    ProgressView()
                } else if let xp = viewModel.xp {
                    // Circular progress gauge
                    ZStack {
                        Circle()
                            .stroke(Color.nacaBorder, lineWidth: 8)
                            .frame(width: 90, height: 90)

                        Circle()
                            .trim(from: 0, to: xp.progressFraction)
                            .stroke(Color.nacaSecondary, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                            .frame(width: 90, height: 90)
                            .rotationEffect(.degrees(-90))
                            .animation(.easeInOut(duration: 0.8), value: xp.progressFraction)

                        VStack(spacing: 0) {
                            Text("Lv \(xp.level)")
                                .font(NACATypography.headline)
                                .foregroundColor(.nacaPrimary)
                            Text("\(xp.progressPercent)%")
                                .font(NACATypography.caption)
                                .foregroundColor(.nacaTextLight)
                        }
                    }

                    // Total XP
                    VStack(spacing: 4) {
                        Text("\(xp.totalXp) XP")
                            .font(NACATypography.title3)
                            .foregroundColor(.nacaPrimary)

                        Text("\(xp.xpInCurrentLevel) / \(xp.xpNeededForNextLevel) to next level")
                            .font(NACATypography.caption)
                            .foregroundColor(.nacaTextLight)
                    }

                    // Rank
                    if let rank = xp.rank {
                        HStack {
                            Image(systemName: "medal.fill")
                                .foregroundColor(.nacaSecondary)
                            Text("Rank #\(rank)")
                                .font(NACATypography.body)
                        }
                    }
                } else {
                    Text("No XP data")
                        .foregroundColor(.nacaTextLight)
                }
            }
            .padding()
        }
        .navigationTitle("Progress")
        .task { await viewModel.load() }
    }
}
