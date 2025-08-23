import { SimulateRunner, HistoryManager, NavigationManager } from '@/generate/runtime';
import { VNActionEnum } from '@/generate/enums';
import type { VNAction, EngineState, GameState, VNEvent, EngineAPI } from '@/generate/types';

export default class ActionExecutor {
  private engineState: EngineState;
  private gameState: GameState;
  private historyManager: HistoryManager;
  private navigationManager: NavigationManager;
  private customLogicCache: Record<string, any> = {};
  
  constructor(
    engineState: EngineState, 
    gameState: GameState, 
    historyManager: HistoryManager,
    navigationManager: NavigationManager
  ) {
    this.engineState = engineState;
    this.gameState = gameState;
    this.historyManager = historyManager;
    this.navigationManager = navigationManager;
  }

  async executeEvent(event: VNEvent): Promise<void> {
    await this.simulateEvent(event.execute);
    
    while (this.historyManager.getFutureLength() > 0) {
      const action = this.historyManager.getFirstFutureAction();
      if (!action) {
        break;
      }
      // FIRST WE MAKE THE PLAYING ACTION TO PAST
      this.historyManager.moveFirstFutureToHistory();
      this.restoreStateFromAction(action);
      
      await this.executeAction(event, action);
    }
    this.historyManager.resetHistory()
  }

  // Generic simulation method that works with both events and branches
  private async simulateEvent(executeFunction: (engine: EngineAPI, state: GameState) => Promise<void>): Promise<void> {
    const gameStateCopy = JSON.parse(JSON.stringify(this.gameState));
    const engineStateCopy = JSON.parse(JSON.stringify(this.engineState));    
    const simulator = new SimulateRunner(gameStateCopy, engineStateCopy, "simulation");
    
    try {
      await executeFunction(simulator, gameStateCopy);
      this.historyManager.setFuture(simulator.actions);
    } catch (error) {
      console.error('Simulation error:', error);
    }
  }

  // Restore game and engine state from an action's stored state
  private restoreStateFromAction(action: VNAction): void {
    if (action.gameState && action.engineState) {
      Object.assign(this.gameState, JSON.parse(JSON.stringify(action.gameState)));
      Object.assign(this.engineState, JSON.parse(JSON.stringify(action.engineState)));
    }
  }
  
  // Execute a single action - ONLY handle user input, state is already restored
  private async executeAction(event: VNEvent, action: VNAction): Promise<void> {
    switch (action.type) {
      case VNActionEnum.SHOW_TEXT:
        await this.navigationManager.waitForContinue();
        break;

      case VNActionEnum.SHOW_CHOICES:
        await this.handleChoiceAction(event, action);
        break;

      /*
      case VNActionEnum.JUMP:
        // Jump should exit the current event execution
        this.engineState.currentEvent = action.engineState.jumpEvent;
        this.engineState.currentStep = 0;
        throw new Error('JumpInterrupt'); // This will be caught by engine
        break;

      case VNActionEnum.RUN_CUSTOM:
        // TODO: Custom logic - temporarily disabled for minimal implementation
        console.log('Custom logic skipped for now');
        break;
      */

      default:
        break;
    }
  }

  // Handle choice actions and return chosen choice ID
  private async handleChoiceAction(event: VNEvent, action: VNAction): Promise<void> {
    // Wait for user choice    
    const choiceId = await this.navigationManager.waitForChoice();
    
    // SIMULATE CHOICE
    if (choiceId && event.branches?.[choiceId]) {
      await this.simulateEvent(event.branches[choiceId].execute);
    }
  }
}