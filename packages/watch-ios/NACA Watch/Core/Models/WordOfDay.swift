import Foundation

struct WordOfDayData: Decodable {
    let date: String
    let entry: DictionaryEntryData?
    let message: String? // "No dictionary entries available" when empty

    var hasEntry: Bool { entry != nil }
}
