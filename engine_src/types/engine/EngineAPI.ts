import type { ChoiceSimple, ChoiceFull, CustomArgs } from '@generate/types';
import type { Text } from '@generate/types';

export interface EngineAPI {
  /**
   * Display text to the user and wait for input to continue.
   * 
   * Simple usage: showText(string, from?) - Direct strings with optional character
   * Complex usage: showText(options) - Translations and variable interpolation
   * 
   * @example
   * ```typescript
   * // Simple strings (use template literals for variables)
   * await engine.showText("Hello world")
   * await engine.showText("Nice to meet you", "Alice")
   * await engine.showText(`You have ${state.energy} energy`, "System")
   * 
   * // Complex features (translations + variables)
   * await engine.showText({ text: t.greeting })
   * await engine.showText({ text: t.greeting, from: "Alice" })
   * await engine.showText({ text: "Energy: ${energy}", variables: { energy: 100 } })
   * await engine.showText({ text: t.status, from: "Alice", variables: { energy: 100 } })
   * ```
   */
  showText(text: string, from?: string): Promise<void>;
  showText(options: { text: Text, from?: string, variables?: Record<string, any> }): Promise<void>;
  
  /**
   * Display choices to the user and wait for selection.
   * 
   * Simple usage: Array of { text: string, branch: string } - Direct strings
   * Complex usage: Array of { text: Text, branch: string, variables?: {...} } - Translations and variables
   * 
   * @example
   * ```typescript
   * // Simple choices (strings only)
   * await engine.showChoices([
   *   { text: "Continue", branch: "next" },
   *   { text: `Buy Sword cost 50 (money ${state.player.money})`, branch: "back" }
   * ]);
   * 
   * // Complex choices (translations + variables)
   * await engine.showChoices([
   *   { text: t.choices.buy_sword, branch: "buy", variables: { price: 100 } },
   *   { text: t.choices.continue, branch: "next" }
   * ]);
   * ```
   */
  showChoices: (choices: Array<ChoiceSimple | ChoiceFull>) => Promise<void>;
  
  // TODO HANDLE INTERNALLY // NOT READY
  // runCustom: (args: CustomArgs) => Promise<void>;
  
  /**
   * Jump directly to a branch within the current event. Useful for conditional routing.
   * Stops current event execution and continues at the specified branch.
   * 
   * @example
   * ```typescript
   * // In main event execute():
   * if (state.barista.relationship === 'stranger') {
   *   await engine.jump('first-time');
   * } else {
   *   await engine.jump('returning-customer');
   * }
   * 
   * // Branches in same event:
   * branches: {
   *   'first-time': { async execute(engine, state) { ... } },
   *   'returning-customer': { async execute(engine, state) { ... } }
   * }
   * ```
   */
  jump: (branchId: string) => Promise<void>;
  
  /**
   * Set foreground layer images (replaces all current images).
   * Non-blocking operation that updates visual state immediately.
   * 
   * Usage examples:
   * - setForeground(["/characters/alice.png"])
   * - setForeground(["/characters/alice.png", "/objects/sword.png"])
   * - setForeground([]) - Clear all foreground
   */
  setForeground: (imagePaths: string[]) => void;
  
  /**
   * Add a single image to the foreground layer.
   * Non-blocking operation, appends to existing images.
   * 
   * Usage examples:
   * - addForeground("/characters/bob.png")
   * - addForeground("/effects/sparkle.png")
   */
  addForeground: (imagePath: string) => void;
  
  /**
   * Replace the last image in foreground layer with a new one.
   * If no images exist, adds the image. Non-blocking operation.
   * 
   * Usage examples:
   * - replaceForeground("/characters/alice_happy.png") - Change expression
   * - replaceForeground("/characters/alice_sad.png") - Update emotion
   */
  replaceForeground: (imagePath: string) => void;
}