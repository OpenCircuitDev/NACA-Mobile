import SwiftUI

struct DictionarySearchView: View {
    @StateObject private var viewModel = DictionaryViewModel()

    var body: some View {
        VStack(spacing: 8) {
            // Search field with voice dictation
            TextField("Search words...", text: $viewModel.searchQuery)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .onSubmit {
                    Task { await viewModel.search() }
                }

            if viewModel.isLoading {
                ProgressView()
            } else if viewModel.results.isEmpty && !viewModel.searchQuery.isEmpty {
                Text("No results found")
                    .font(NACATypography.caption)
                    .foregroundColor(.nacaTextLight)
            } else {
                List(viewModel.results) { entry in
                    NavigationLink(destination: DictionaryResultView(entryId: entry.id)) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(entry.language ?? "—")
                                .font(NACATypography.headline)
                                .foregroundColor(.nacaPrimary)

                            Text(entry.english ?? "—")
                                .font(NACATypography.caption)
                                .foregroundColor(.nacaTextLight)
                                .lineLimit(1)
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Dictionary")
    }
}
