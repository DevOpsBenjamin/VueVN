import type { GameState } from '@/generate/types';

export type CustomFunction = (args: any, gameState: GameState) => Promise<any>;

export class CustomRegistry {
  private static registry = new Map<string, CustomFunction>();

  static register(id: string, func: CustomFunction): void {
    this.registry.set(id, func);
  }

  static get(id: string): CustomFunction | undefined {
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

export default CustomRegistry;