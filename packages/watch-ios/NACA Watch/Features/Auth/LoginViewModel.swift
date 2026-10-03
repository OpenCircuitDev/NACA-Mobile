import Foundation

@Observable
class LoginViewModel: ObservableObject {
    var email = ""
    var password = ""
    var isLoading = false
    var errorMessage: String?

    func login() async {
        isLoading = true
        errorMessage = nil

        do {
            try await AuthManager.shared.login(email: email, password: password)
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "An unexpected error occurred"
        }

        isLoading = false
    }
}
