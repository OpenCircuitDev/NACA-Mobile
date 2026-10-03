import SwiftUI

struct NotificationListView: View {
    @StateObject private var viewModel = NotificationViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if viewModel.notifications.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "bell.slash")
                        .font(.system(size: 28))
                        .foregroundColor(.nacaTextLight)
                    Text("No notifications")
                        .font(NACATypography.body)
                        .foregroundColor(.nacaTextLight)
                }
            } else {
                List(viewModel.notifications) { notification in
                    HStack(spacing: 8) {
                        Image(systemName: notification.icon)
                            .foregroundColor(.nacaSecondary)
                            .font(.system(size: 14))

                        VStack(alignment: .leading, spacing: 2) {
                            Text(notification.title)
                                .font(NACATypography.caption)
                                .fontWeight(notification.isRead ? .regular : .semibold)

                            if let message = notification.message {
                                Text(message)
                                    .font(NACATypography.caption2)
                                    .foregroundColor(.nacaTextLight)
                                    .lineLimit(2)
                            }
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Notifications")
        .task { await viewModel.load() }
    }
}
