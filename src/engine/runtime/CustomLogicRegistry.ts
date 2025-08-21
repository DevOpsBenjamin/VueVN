import type { GameState } from './types';

export type CustomLogicFunction = (args: any, gameState: GameState) => Promise<any>;

export class CustomLogicRegistry {
  private static registry = new Map<string, CustomLogicFunction>();

  static register(id: string, logic: CustomLogicFunction): void {
    this.registry.set(id, logic);
  }

  static get(id: string): CustomLogicFunction | undefined {
    return this.registry.get(id);
  }

  static has(id: string): boolean {
    return this.registry.has(id);
  }

  static list(): string[] {
    return Array.from(this.registry.keys());
  }

  static clear(): void {
    this.registry.clear();
  }
}