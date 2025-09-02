import type { Text, EngineState, DialogueSimple, DialogueFull, ChoiceSimple, ChoiceFull } from '@generate/types';
import { engineState as useEngineState } from '@generate/stores';

export default class LanguageManager {
  private static instance: LanguageManager | null = null;
  private engineState: EngineState;

  private constructor() {
    // Private constructor for singleton pattern - get pinia store directly
    const engineStore = useEngineState();
    this.engineState = engineStore.$state;
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): LanguageManager {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager();
    }
    return LanguageManager.instance;
  }

  /**
   * Resolves a Text object to the exact requested language only - no fallbacks
   * Uses internal pinia store for current language setting
   */
  resolveText(text: string | Text): string {
    if (typeof text === 'string') {
      return text;
    }

    const textObj = text as any;
    if (!textObj || typeof textObj !== 'object') {
      return '[INVALID TEXT OBJECT]';
    }

    const currentLang = (this.engineState.settings.language || 'en').toLowerCase();
    const translation = textObj[currentLang];
    
    // Only return translation if it exists and is not empty for the EXACT requested language
    if (typeof translation === 'string' && translation.trim().length > 0) {
      return translation;
    }

    // No fallbacks - show detailed debug message immediately
    const key = typeof textObj.__key === 'string' ? textObj.__key : 'unknown';
    console.error(`Missing translation for key '${key}' in language '${currentLang}'`);
    
    // Detailed error message that will be visible in user reports
    return `(MISSING TRANSLATION FOR LANG [${currentLang}] KEY [${key}])`;
  }

  /**
   * Helper for Vue components - resolves Text objects and formats for HTML display
   * Handles both string/Text resolution and variable interpolation
   */
  resolveAndFormat(text: string | Text, variables?: Record<string, any>): string {
    // First resolve to string
    let resolvedText = this.resolveText(text);
    
    // Handle variable interpolation if variables provided
    if (variables) {
      // Replace ${variableName} with actual values
      resolvedText = resolvedText.replace(/\$\{(\w+)\}/g, (match, variableName) => {
        const value = variables[variableName];
        return value !== undefined ? String(value) : match; // Keep ${var} if variable not found
      });
    }
    
    // Always convert \n to <br> for HTML display
    return resolvedText.replace(/\n/g, '<br>');
  }

  /**
   * Gets the currently selected language code
   */
  getCurrentLanguage(): string {
    return this.engineState.settings.language?.toLowerCase() || 'en';
  }

  /**
   * Sets a new language
   */
  setLanguage(languageCode: string): void {
    this.engineState.settings.language = languageCode.toLowerCase();
  }

  /**
   * Checks if a translation exists for the given text object in the current language
   */
  hasTranslation(text: string | Text, languageCode?: string): boolean {
    if (typeof text === 'string') {
      return true;
    }

    const textObj = text as any;
    if (!textObj || typeof textObj !== 'object') {
      return false;
    }

    const lang = (languageCode || this.getCurrentLanguage()).toLowerCase();
    const translation = textObj[lang];
    return typeof translation === 'string' && translation.trim().length > 0;
  }

  /**
   * Gets available languages for a given text object
   */
  getAvailableLanguages(text: string | Text): string[] {
    if (typeof text === 'string') {
      return ['*']; // String literals work with any language
    }

    const textObj = text as any;
    if (!textObj || typeof textObj !== 'object') {
      return [];
    }

    return Object.keys(textObj)
      .filter(key => 
        key !== '__key' && 
        typeof textObj[key] === 'string' && 
        textObj[key].trim().length > 0
      );
  }

  /**
   * Helper specifically for dialogue objects - handles both DialogueSimple and DialogueFull
   * Returns both resolved text and from property
   */
  resolveDialogue(dialogue: DialogueSimple | DialogueFull): { text: string; from?: string } {
    let resolvedText: string;
    
    // Check if it's DialogueFull (has variables) or DialogueSimple
    if ('variables' in dialogue && dialogue.variables) {
      // DialogueFull - use resolveAndFormat for variable interpolation
      resolvedText = this.resolveAndFormat(dialogue.text, dialogue.variables);
    } else {
      // DialogueSimple or DialogueFull without variables - just resolve and format
      resolvedText = this.resolveAndFormat(dialogue.text);
    }
    
    return {
      text: resolvedText,
      from: dialogue.from
    };
  }

  /**
   * Helper specifically for choice objects - handles both ChoiceSimple and ChoiceFull
   * Returns choice with resolved text
   */
  resolveChoice(choice: ChoiceSimple | ChoiceFull): { text: string; branch: string } {
    let resolvedText: string;
    
    // Check if it's ChoiceFull (has variables) or ChoiceSimple
    if ('variables' in choice && choice.variables) {
      // ChoiceFull - use resolveAndFormat for variable interpolation
      resolvedText = this.resolveAndFormat(choice.text, choice.variables);
    } else {
      // ChoiceSimple or ChoiceFull without variables - just resolve and format
      resolvedText = this.resolveAndFormat(choice.text);
    }
    
    return {
      text: resolvedText,
      branch: choice.branch
    };
  }
}