import WidgetKit
import SwiftUI

// MARK: - Widget Definition

struct StreakWidget: Widget {
    let kind = "StreakComplication"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NACATimelineProvider()) { entry in
            StreakComplicationView(entry: entry)
        }
        .configurationDisplayName("Learning Streak")
        .description("Your current daily learning streak")
        .supportedFamilies([.accessoryCircular, .accessoryCorner, .accessoryInline])
    }
}

// MARK: - Complication View

struct StreakComplicationView: View {
    let entry: NACAComplicationEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryCircular:
            circularView
        case .accessoryCorner:
            cornerView
        case .accessoryInline:
            inlineView
        default:
            Text("\(entry.streak)")
        }
    }

    // MARK: Circular

    private var circularView: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 0) {
                Image(systemName: "flame.fill")
                    .font(.system(size: 14))
                    .foregroundStyle(.orange)
                Text("\(entry.streak)")
                    .font(.system(size: 18, weight: .bold))
            }
        }
    }

    // MARK: Corner

    private var cornerView: some View {
        Text("\(entry.streak)")
            .font(.system(size: 24, weight: .bold))
            .widgetLabel {
                Label("day streak", systemImage: "flame.fill")
            }
    }

    // MARK: Inline

    private var inlineView: some View {
        Label("\(entry.streak) day streak", systemImage: "flame.fill")
    }
}

// MARK: - Preview

#if DEBUG
#Preview("Circular", as: .accessoryCircular) {
    StreakWidget()
} timeline: {
    NACAComplicationEntry.placeholder
}

#Preview("Corner", as: .accessoryCorner) {
    StreakWidget()
} timeline: {
    NACAComplicationEntry.placeholder
}

#Preview("Inline", as: .accessoryInline) {
    StreakWidget()
} timeline: {
    NACAComplicationEntry.placeholder
}
#endif
