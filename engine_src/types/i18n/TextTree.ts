// Deep nested text structure types
export type DeepRecord = Record<string, any>;

export interface TextTree {
  global: DeepRecord;
  locations: DeepRecord;
}

export interface TextProvider {
  getText(path: string): string;
  getCurrentLanguage(): string;
  setLanguage(language: string): void;
  getAvailableLanguages(): string[];
}