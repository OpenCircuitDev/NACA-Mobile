import SwiftUI

struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Logo
                Image(systemName: "book.closed.fill")
                    .font(.system(size: 36))
                    .foregroundColor(.nacaSecondary)

                Text("NACA")
                    .font(NACATypography.title3)
                    .foregroundColor(.nacaPrimary)

                // Email field
                TextField("Email", text: $viewModel.email)
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()

                // Password field
                SecureField("Password", text: $viewModel.password)
                    .textContentType(.password)

                // Login button
                Button(action: {
                    Task { await viewModel.login() }
                }) {
                    if viewModel.isLoading {
                        ProgressView()
                    } else {
                        Text("Sign In")
                            .fontWeight(.semibold)
                    }
                }
                .disabled(viewModel.isLoading || viewModel.email.isEmpty || viewModel.password.isEmpty)
                .buttonStyle(.borderedProminent)
                .tint(.nacaPrimary)

                // Error message
                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(NACATypography.caption)
                        .foregroundColor(.nacaError)
                        .multilineTextAlignment(.center)
                }
            }
            .padding()
        }
    }
}
