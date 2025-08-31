import type { CustomActionHandler, GameState, EngineAPI } from '@generate/types';
import { MinigameManager, type MinigameConfig } from './MinigameManager';

export class CustomActionRegistry {
  private handlers = new Map<string, CustomActionHandler>();
  private minigameManager = new MinigameManager();

  constructor() {
    this.registerBuiltinActions();
  }

  register(id: string, handler: CustomActionHandler): void {
    this.handlers.set(id, handler);
  }

  unregister(id: string): void {
    this.handlers.delete(id);
  }

  has(id: string): boolean {
    return this.handlers.has(id);
  }

  async execute(id: string, args: Record<string, any>, engine: EngineAPI, state: GameState): Promise<any> {
    const handler = this.handlers.get(id);
    if (!handler) {
      throw new Error(`Custom action '${id}' not found. Available actions: ${Array.from(this.handlers.keys()).join(', ')}`);
    }

    try {
      return await handler(args, engine, state);
    } catch (error) {
      console.error(`Error executing custom action '${id}':`, error);
      throw error;
    }
  }

  private registerBuiltinActions(): void {
    // System Actions
    this.register('wait', async (args) => {
      const ms = args.duration || args.ms || 1000;
      await new Promise(resolve => setTimeout(resolve, ms));
    });

    this.register('log', async (args) => {
      console.log('VN Log:', args.message || args.text || 'Custom log');
    });

    // Background Management
    this.register('setBackground', async (args, engine, state) => {
      // TODO: Implement background system
      console.log('Setting background:', args.image);
    });

    this.register('fadeBackground', async (args, engine, state) => {
      // TODO: Implement background fade
      console.log('Fading background:', args);
    });

    // Sound & Music
    this.register('playSound', async (args, engine, state) => {
      // TODO: Implement sound system
      console.log('Playing sound:', args.sound);
    });

    this.register('playMusic', async (args, engine, state) => {
      // TODO: Implement music system  
      console.log('Playing music:', args.music);
    });

    this.register('stopMusic', async (args, engine, state) => {
      console.log('Stopping music');
    });

    // State Management Helpers
    this.register('setFlag', async (args, engine, state) => {
      if (!args.flag) throw new Error('Flag name required');
      state.flags[args.flag] = args.value ?? true;
    });

    this.register('incrementStat', async (args, engine, state) => {
      if (!args.stat) throw new Error('Stat name required');
      const amount = args.amount || 1;
      if (typeof state[args.stat] === 'number') {
        state[args.stat] += amount;
      } else {
        console.warn(`Stat '${args.stat}' is not a number`);
      }
    });

    // Time & Date
    this.register('advanceTime', async (args, engine, state) => {
      const hours = args.hours || 0;
      const minutes = args.minutes || 0;
      state.gameTime.hour += hours;
      state.gameTime.minute += minutes;
      
      // Handle overflow
      if (state.gameTime.minute >= 60) {
        state.gameTime.hour += Math.floor(state.gameTime.minute / 60);
        state.gameTime.minute = state.gameTime.minute % 60;
      }
      if (state.gameTime.hour >= 24) {
        state.gameTime.day += Math.floor(state.gameTime.hour / 24);
        state.gameTime.hour = state.gameTime.hour % 24;
      }
    });

    // UI Effects
    this.register('shake', async (args) => {
      // TODO: Implement screen shake
      console.log('Shaking screen:', args.intensity || 'medium');
    });

    this.register('flash', async (args) => {
      // TODO: Implement screen flash
      console.log('Flashing screen:', args.color || 'white');
    });

    // Minigames & Custom Components
    this.register('runMinigame', async (args, engine, state) => {
      if (!args.type) {
        throw new Error('Minigame type is required');
      }

      // Build minigame config from args
      const config: MinigameConfig = {
        type: args.type,
        difficulty: args.difficulty,
        timeLimit: args.timeLimit,
        customParams: args.params || {}
      };

      // Merge with defaults for this minigame type
      const defaults = this.minigameManager.getMinigameDefaults(args.type);
      Object.assign(config, defaults, config);

      // Run the minigame and return result
      return await this.minigameManager.runMinigame(config, engine, state);
    });
  }

  // Get list of available actions for debugging
  getAvailableActions(): string[] {
    return Array.from(this.handlers.keys()).sort();
  }
}