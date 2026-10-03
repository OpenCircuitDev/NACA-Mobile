import Foundation

/// Full dictionary entry from /dictionary/entries/:id
struct DictionaryEntryData: Decodable, Identifiable {
    let id: String
    let language: String?
    let english: String?
    let pronunciationKey: String?
    let category: String?
    let subcategory: String?
    let grammaticalCategory: String?
    let literalTranslation: String?
    let morphologicalBreakdown: String?
    let characterBreakdown: String?
    let dialect: String?
    let notes: String?
    let primaryAudio: String?
    let primaryAudioStoragePath: String?
    let images: String?
    let imagesStoragePath: String?
    let appArt: String?
    let appArtStoragePath: String?
    let speaker1Name: String?
    let speaker1Audio: String?
    let speaker1AudioStoragePath: String?
    let speaker2Name: String?
    let speaker2Audio: String?
    let speaker2AudioStoragePath: String?
    let speaker3Name: String?
    let speaker3Audio: String?
    let speaker3AudioStoragePath: String?
    let verified: Bool?

    /// Best available audio URL
    var audioURL: URL? {
        let audioString = primaryAudio ?? speaker1Audio ?? speaker2Audio ?? speaker3Audio
        guard let audioString else { return nil }
        return URL(string: audioString)
    }

    /// Speaker name for the primary audio
    var speakerName: String? {
        if primaryAudio != nil { return nil } // primary doesn't have a named speaker
        if speaker1Audio != nil { return speaker1Name }
        if speaker2Audio != nil { return speaker2Name }
        if speaker3Audio != nil { return speaker3Name }
        return nil
    }
}

/// Compact entry from /dictionary/search
struct DictionarySearchEntry: Decodable, Identifiable {
    let id: String
    let language: String?
    let english: String?
    let pronunciationKey: String?
    let category: String?
    let subcategory: String?
    let primaryAudio: String?
    let primaryAudioStoragePath: String?
    let images: String?
    let imagesStoragePath: String?
    let speaker1Name: String?
    let speaker1Audio: String?
    let literalTranslation: String?
    let morphologicalBreakdown: String?
}

/// Search result wrapper
struct DictionarySearchData: Decodable {
    let entries: [DictionarySearchEntry]
    let total: Int
    let limit: Int
    let offset: Int
}
