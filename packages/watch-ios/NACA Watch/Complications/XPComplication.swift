import WidgetKit
import SwiftUI

// MARK: - Widget Definition

struct XPWidget: Widget {
    let kind = "XPComplication"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NACATimelineProvider()) { entry in
            XPComplicationView(entry: entry)
        }
        .configurationDisplayName("XP Progress")
        .description("Your experience points and level progress")
        .supportedFamilies([.accessoryCircular, .accessoryCorner, .accessoryRectangular])
    }
}

// MARK: - Complication View

struct XPComplicationView: View {
    let entry: NACAComplicationEntry
    @Environment(\.widgetFamily) var family

    /// Progress as a 0.0-1.0 fraction for gauges.
    private var progress: Double {
        Double(entry.progressPercent) / 100.0
    }

    var body: some View {
        switch family {
        case .accessoryCircular:
            circularView
        case .accessoryCorner:
            cornerView
        case .accessoryRectangular:
            rectangularView
        default:
            Text("L\(entry.level)")
        }
    }

    // MARK: Circular

    private var circularView: some View {
        Gauge(value: progress) {
            Text("XP")
                .font(.system(size: 10))
        } currentValueLabel: {
            Text("L\(entry.level)")
                .font(.system(size: 14, weight: .bold))
        }
        .gaugeStyle(.accessoryCircular)
    }

    // MARK: Corner

    private var cornerView: some View {
        Text("L\(entry.level)")
            .font(.system(size: 20, weight: .bold))
            .widgetLabel {
                Gauge(value: progress) {
                    Text("XP")
                }
                .gaugeStyle(.accessoryLinear)
            }
    }

    // MARK: Rectangular

    private var rectangularView: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text("Level \(entry.level)")
                    .font(.system(size: 14, weight: .bold))
                Spacer()
                Text("\(entry.xp) XP")
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
            }
            Gauge(value: progress) { EmptyView() }
                .gaugeStyle(.accessoryLinear)
                .tint(.cyan)
            Text("\(entry.progressPercent)% to next level")
                .font(.system(size: 10))
                .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Preview

#if DEBUG
#Preview("Circular", as: .accessoryCircular) {
    XPWidget()
} timeline: {
    NACAComplicationEntry.placeholder
}

#Preview("Corner", as: .accessoryCorner) {
    XPWidget()
} timeline: {
    NACAComplicationEntry.placeholder
}

#Preview("Rectangular", as: .accessoryRectangular) {
    XPWidget()
} timeline: {
    NACAComplicationEntry.placeholder
}
#endif
