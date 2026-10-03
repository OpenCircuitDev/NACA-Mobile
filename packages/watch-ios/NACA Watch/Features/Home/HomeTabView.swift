import SwiftUI

struct HomeTabView: View {
    var body: some View {
        TabView {
            WordOfDayView()
                .tabItem {
                    Label("Word", systemImage: "textformat.abc")
                }

            StreakView()
                .tabItem {
                    Label("Streak", systemImage: "flame.fill")
                }

            XPView()
                .tabItem {
                    Label("XP", systemImage: "star.fill")
                }

            FlashcardDrillView()
                .tabItem {
                    Label("Practice", systemImage: "rectangle.on.rectangle.angled")
                }

            MoreMenuView()
                .tabItem {
                    Label("More", systemImage: "ellipsis")
                }
        }
    }
}

struct MoreMenuView: View {
    var body: some View {
        List {
            NavigationLink(destination: DictionarySearchView()) {
                Label("Dictionary", systemImage: "magnifyingglass")
            }

            NavigationLink(destination: AchievementsView()) {
                Label("Achievements", systemImage: "trophy.fill")
            }

            NavigationLink(destination: NotificationListView()) {
                Label("Notifications", systemImage: "bell.fill")
            }

            Button(role: .destructive) {
                AuthManager.shared.logout()
            } label: {
                Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
            }
        }
        .navigationTitle("More")
    }
}
