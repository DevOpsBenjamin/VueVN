import type { GameState, EngineAPI } from '@generate/types';

export interface MinigameResult {
  success: boolean;
  score?: number;
  data?: Record<string, any>;
  completionTime?: number;
}

export interface MinigameConfig {
  type: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  customParams?: Record<string, any>;
}

export class MinigameManager {
  private activeMinigame: string | null = null;
  private minigameResolve: ((result: MinigameResult) => void) | null = null;

  async runMinigame(config: MinigameConfig, engine: EngineAPI, state: GameState): Promise<MinigameResult> {
    return new Promise((resolve) => {
      this.activeMinigame = config.type;
      this.minigameResolve = resolve;

      // Listen for completion event from Vue components
      const handleCompletion = (event: CustomEvent) => {
        this.completeMinigame(event.detail);
        window.removeEventListener('minigame-complete', handleCompletion as EventListener);
      };
      
      window.addEventListener('minigame-complete', handleCompletion as EventListener);

      // Trigger minigame UI to show
      this.showMinigameUI(config, state);
    });
  }

  private showMinigameUI(config: MinigameConfig, state: GameState): void {
    // This would communicate with the Vue UI system
    // Set a flag that the Vue components can watch
    state.ui = state.ui || {};
    state.ui.activeMinigame = {
      type: config.type,
      difficulty: config.difficulty || 'medium',
      timeLimit: config.timeLimit,
      params: config.customParams || {},
      startTime: Date.now()
    };
  }

  // Called by Vue components when minigame completes
  completeMinigame(result: MinigameResult): void {
    if (this.minigameResolve && this.activeMinigame) {
      this.activeMinigame = null;
      
      // Clear UI state
      // This would be handled by the state management
      
      this.minigameResolve(result);
      this.minigameResolve = null;
    }
  }

  // Predefined minigame types with their logic
  getMinigameDefaults(type: string): Partial<MinigameConfig> {
    const defaults: Record<string, Partial<MinigameConfig>> = {
      'cooking': {
        timeLimit: 30000, // 30 seconds
        customParams: {
          ingredients: ['flour', 'eggs', 'milk'],
          recipe: 'pancakes',
          successThreshold: 70
        }
      },
      'lockpicking': {
        timeLimit: 60000, // 1 minute
        customParams: {
          pins: 5,
          difficulty: 'medium',
          attempts: 3
        }
      },
      'rhythm': {
        timeLimit: 45000,
        customParams: {
          song: 'default',
          bpm: 120,
          notes: 20
        }
      },
      'memory': {
        timeLimit: 20000,
        customParams: {
          gridSize: 4,
          sequence: 6
        }
      },
      'dialogue_choice': {
        timeLimit: 15000,
        customParams: {
          responseTime: true,
          stressLevel: 'medium'
        }
      }
    };

    return defaults[type] || {};
  }
}