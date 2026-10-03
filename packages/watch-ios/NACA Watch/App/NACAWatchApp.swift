import SwiftUI

@main
struct NACAWatchApp: App {
    @State private var appState = AppState.shared
    @State private var authManager = AuthManager.shared

    var body: some Scene {
        WindowGroup {
            Group {
                if !appState.isInitialized || authManager.isLoading {
                    // Splash / loading
                    VStack(spacing: 12) {
                        Image(systemName: "book.closed.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.nacaSecondary)
                        Text("NACA")
                            .font(NACATypography.title2)
                            .foregroundColor(.nacaPrimary)
                        ProgressView()
                    }
                } else if authManager.isAuthenticated {
                    HomeTabView()
                } else {
                    LoginView()
                }
            }
            .task {
                await appState.initialize()
            }
        }
    }
}
