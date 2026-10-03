import SwiftUI

struct FlashcardResultView: View {
    let score: Int
    let total: Int
    let onRestart: () -> Void

    private var percentage: Int {
        guard total > 0 else { return 0 }
        return Int(Double(score) / Double(total) * 100)
    }

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: percentage >= 70 ? "star.fill" : "star")
                .font(.system(size: 36))
                .foregroundColor(.nacaSecondary)

            Text("Complete!")
                .font(NACATypography.headline)

            Text("\(score)/\(total) correct")
                .font(NACATypography.title3)
                .foregroundColor(.nacaPrimary)

            Text("\(percentage)%")
                .font(NACATypography.caption)
                .foregroundColor(.nacaTextLight)

            Button("Practice Again", action: onRestart)
                .buttonStyle(.borderedProminent)
                .tint(.nacaPrimary)
        }
    }
}
