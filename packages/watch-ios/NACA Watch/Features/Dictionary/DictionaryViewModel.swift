import Foundation

@Observable
class DictionaryViewModel: ObservableObject {
    var searchQuery = ""
    var results: [DictionarySearchEntry] = []
    var isLoading = false

    func search() async {
        let query = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return }

        isLoading = true

        do {
            let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query
            let response: PackageResponse<DictionarySearchData> = try await APIClient.shared.request(
                path: "\(Endpoints.Dictionary.search)?q=\(encodedQuery)&limit=20"
            )
            results = response.data.entries
        } catch {
            results = []
        }

        isLoading = false
    }
}
