// Project Text: mandatory English with optional per-language entries.
// Allows arbitrary language codes; engine resolves by current language with fallback to 'en'.
export interface Text {
  [lang: string]: string | null;
}
