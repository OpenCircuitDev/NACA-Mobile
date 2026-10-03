import SwiftUI

extension Color {
    // Primary palette
    static let nacaPrimary = Color(hex: "1a365d")         // navy
    static let nacaPrimaryLight = Color(hex: "2d4a7a")
    static let nacaPrimaryDark = Color(hex: "0f2440")

    // Secondary palette
    static let nacaSecondary = Color(hex: "c4a35a")       // gold
    static let nacaSecondaryLight = Color(hex: "d4b970")

    // Semantic colors
    static let nacaSuccess = Color(hex: "22c55e")
    static let nacaWarning = Color(hex: "f59e0b")
    static let nacaError = Color(hex: "ef4444")
    static let nacaInfo = Color(hex: "3b82f6")

    // Surface colors
    static let nacaSurface = Color(hex: "ffffff")
    static let nacaSurfaceDark = Color(hex: "1a1a2e")
    static let nacaBackground = Color(hex: "ffffff")
    static let nacaBackgroundDark = Color(hex: "f5f5f5")

    // Text colors
    static let nacaText = Color(hex: "1a1a2e")
    static let nacaTextLight = Color(hex: "6b7280")

    // Border colors
    static let nacaBorder = Color(hex: "e5e7eb")
    static let nacaBorderDark = Color(hex: "374151")

    // Helper initializer for hex strings
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: // RGB
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
