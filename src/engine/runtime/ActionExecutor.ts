import { CustomRegistry } from '@/generate/runtime';
import { VNActionEnum } from '@/generate/enums';
import type { VNAction, EngineState, GameState } from '@/generate/types';

export default class ActionExecutor {
  private engineState: EngineState;
  private gameState: GameState;
  private customLogicCache: Record<string, any> = {};
  
  constructor(engineState: EngineState, gameState: GameState) {
    this.engineState = engineState;
    this.gameState = gameState;
  }

  async executeAction(action: VNAction, waitForContinue: () => Promise<void>, waitForChoice: () => Promise<string>): Promise<void> {
    switch (action.type) {
      case VNActionEnum.SHOW_TEXT:
        await waitForContinue();
        break;
      case VNActionEnum.SHOW_CHOICES:
        //const choiceId = await waitForChoice();
        break;
      case VNActionEnum.JUMP:
        //this.jumpToEvent(action.eventId);
        break;
      case VNActionEnum.RUN_CUSTOM:
        //const result = await this.executeCustomLogic(action.logicId, action.args);
        //this.cacheCustomLogicResult(action.logicId, result);
        break;
      default:
        break;
    }
  }

  /*
  private jumpToEvent(eventId: string): void {
    this.engineState.currentEvent = eventId;
    this.engineState.currentStep = 0;
    console.debug(`Jumping to event: ${eventId}`);
  }

  private async executeCustomLogic(logicId: string, args: any): Promise<any> {
    const logicFunction = CustomRegistry.get(logicId);
    if (!logicFunction) {
      throw new Error(`Custom logic '${logicId}' not found`);
    }

    // For timing minigame, activate UI state
    if (logicId === 'timingMinigame') {
      this.engineState.minigame = {
        active: true,
        type: 'timing',
        props: args
      };
      
      // Wait for minigame result from UI
      const result = await this.waitForMinigameResult();
      
      // Deactivate minigame UI
      this.engineState.minigame = {
        active: false,
        type: null,
        props: null
      };
      
      // Update game state
      if (!this.gameState.player.money) {
        this.gameState.player.money = 0;
      }
      this.gameState.player.money += result.reward || 0;
      
      if (!this.gameState.flags.lastMinigameResult) {
        this.gameState.flags.lastMinigameResult = {};
      }
      this.gameState.flags.lastMinigameResult[logicId] = result;
      
      return result;
    }

    // Execute other custom logic
    return await logicFunction(args, this.gameState);
  }

  private async waitForMinigameResult(): Promise<any> {
    return new Promise<any>((resolve) => {
      // This would be resolved by the minigame component
      // For now, return a mock result
      setTimeout(() => resolve({ reward: 10, success: true }), 1000);
    });
  }

  private cacheCustomLogicResult(logicId: string, result: any): void {
    this.customLogicCache[logicId] = result;
    console.debug(`Cached custom logic result for ${logicId}:`, result);
  }

  applyActionToEngine(action: VNAction): void {
    console.debug(`APPLYING ACTION TO ENGINE: ${action.type}`);
    
    if (action.type === 'jump') {
      this.jumpToEvent(action.eventId);
      return;
    }

    if (action.gameStateCopy && action.engineStateCopy) {
      // Copy game state
      Object.assign(this.gameState, JSON.parse(JSON.stringify(action.gameStateCopy)));
      
      // Copy engine state (except currentStep which we manage ourselves)
      const { currentStep, ...engineStateToCopy } = action.engineStateCopy;
      Object.assign(this.engineState, engineStateToCopy);
    }
  }*/
}