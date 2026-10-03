import SwiftUI

struct FlashcardCardView: View {
    let front: String
    let back: String
    let isFlipped: Bool
    let onTap: () -> Void

    var body: some View {
        ZStack {
            // Front
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.nacaPrimary)
                .overlay(
                    Text(front)
                        .font(NACATypography.title3)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .padding(8)
                )
                .opacity(isFlipped ? 0 : 1)
                .rotation3DEffect(.degrees(isFlipped ? 180 : 0), axis: (x: 0, y: 1, z: 0))

            // Back
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.nacaSecondary)
                .overlay(
                    Text(back)
                        .font(NACATypography.title3)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .padding(8)
                )
                .opacity(isFlipped ? 1 : 0)
                .rotation3DEffect(.degrees(isFlipped ? 0 : -180), axis: (x: 0, y: 1, z: 0))
        }
        .frame(height: 100)
        .animation(.spring(response: 0.4), value: isFlipped)
        .onTapGesture(perform: onTap)
    }
}
