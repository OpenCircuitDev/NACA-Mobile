import Foundation

@Observable
class NotificationViewModel: ObservableObject {
    var notifications: [NotificationItem] = []
    var unreadCount = 0
    var isLoading = false

    func load() async {
        isLoading = true

        do {
            let response: NotificationResponse = try await APIClient.shared.request(
                path: Endpoints.Mobile.notifications
            )
            notifications = response.data.notifications
            unreadCount = response.data.unreadCount
        } catch {
            notifications = []
        }

        isLoading = false
    }
}
