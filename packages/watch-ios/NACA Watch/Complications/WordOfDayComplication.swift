import WidgetKit
import SwiftUI

// MARK: - Widget Definition

struct WordOfDayWidget: Widget {
    let kind = "WordOfDayComplication"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NACATimelineProvider()) { entry in
            WordOfDayComplicationView(entry: entry)
        }
        .configurationDisplayName("Word of the Day")
        .description("Today's word in your language learning journey")
        .supportedFamilies([.accessoryRectangular, .accessoryInline, .accessoryCorner])
    }
}

// MARK: - Complication View

struct WordOfDayComplicationView: View {
    let entry: NACAComplicationEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryRectangular:
            rectangularView
        case .accessoryInline:
            inlineView
        case .accessoryCorner:
            cornerView
        default:
            Text(entry.word ?? "--")
        }
    }

    // MARK: Rectangular

    private var rectangularView: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("WORD OF THE DAY")
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(.secondary)
            Text(entry.word ?? "--")
                .font(.system(size: 16, weight: .bold))
                .lineLimit(1)
            Text(entry.translation ?? "Open app to learn")
                .font(.system(size: 12))
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: Inline

    private var inlineView: some View {
        Text("\(entry.word ?? "Word") -- \(entry.translation ?? "")")
    }

    // MARK: Corner

    private var cornerView: some View {
        Text(entry.word ?? "--")
            .font(.system(size: 12, weight: .bold))
            .widgetLabel {
                Text(entry.translation ?? "")
            }
    }
}

// MARK: - Preview

#if DEBUG
#Preview("Rectangular", as: .accessoryRectangular) {
    WordOfDayWidget()
} timeline: {
    NACAComplicationEntry.placeholder
}

#Preview("Inline", as: .accessoryInline) {
    WordOfDayWidget()
} timeline: {
    NACAComplicationEntry.placeholder
}

#Preview("Corner", as: .accessoryCorner) {
    WordOfDayWidget()
} timeline: {
    NACAComplicationEntry.placeholder
}
#endif
