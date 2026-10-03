import SwiftUI

enum NACATypography {
    // Watch-optimized sizes (smaller than mobile)
    static let caption2 = Font.system(size: 11)
    static let caption = Font.system(size: 13)
    static let body = Font.system(size: 15)
    static let headline = Font.system(size: 17, weight: .semibold)
    static let title3 = Font.system(size: 20, weight: .semibold)
    static let title2 = Font.system(size: 24, weight: .bold)
    static let title = Font.system(size: 28, weight: .bold)
    static let largeTitle = Font.system(size: 34, weight: .bold)
}
