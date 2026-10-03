import Foundation

struct GameDatasetData: Decodable {
    let id: String
    let name: String
    let type: String?
    let description: String?
    let items: [GameDataItem]
}

struct GameDataItem: Decodable, Identifiable {
    let id: String
    let text: String?       // indigenous word
    let english: String?    // english translation
    let audio: String?      // audio URL
    let image: String?      // image URL
    let displayOrder: Int?

    /// The word to show (question side of flashcard)
    var word: String { text ?? "" }

    /// The translation to show (answer side of flashcard)
    var translation: String { english ?? "" }

    var audioURL: URL? {
        guard let audio else { return nil }
        return URL(string: audio)
    }
}
