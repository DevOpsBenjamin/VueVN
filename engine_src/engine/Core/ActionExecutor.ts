import { SimulateRunner, HistoryManager, NavigationManager, VNInterruptError } from '@generate/engine';
import { VNActionEnum } from '@generate/enums';
import type { VNAction, EngineState, GameState, VNEvent, EngineAPI } from '@generate/types';

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
    console.log("executeEvent :");
    console.log(event);
    
    // Initialize foreground array with event's base image
    this.engineState.foreground = [event.foreground];
    
    await this.simulateEvent(event.execute);
    await this.runEvent(event);
  }
  
  async runEvent(event: VNEvent): Promise<void>{
    console.log("start runEvent");
    console.log(this.historyManager.getFutureLength());
    let action = this.historyManager.getPresent()
    
    while (action != null) {
      console.debug("loop: ",action.type);
      this.restoreStateFromAction(action);      
      await this.executeAction(event, action);
      action = this.historyManager.getPresent()
    }
    this.historyManager.resetHistory()
    console.log("end runEvent");
  }

  // Generic simulation method that works with both events and branches
  private async simulateEvent(executeFunction: (engine: EngineAPI, state: GameState) => Promise<void>): Promise<void> {
    const gameStateCopy = JSON.parse(JSON.stringify(this.gameState));
    const engineStateCopy = JSON.parse(JSON.stringify(this.engineState));    
    const simulator = new SimulateRunner(gameStateCopy, engineStateCopy, "simulation");
    
    try {
      await executeFunction(simulator, gameStateCopy);
      this.historyManager.setFuture(simulator.actions);
      this.historyManager.goForward();
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
        await this.handleTextAction(event, action);
        break;

      case VNActionEnum.SHOW_CHOICES:
        await this.handleChoiceAction(event, action);
        break;

      case VNActionEnum.JUMP:
        await this.handleJumpAction(event, action);
        break;

      /*
      case VNActionEnum.RUN_CUSTOM:
        // TODO: Custom logic - temporarily disabled for minimal implementation
        console.log('Custom logic skipped for now');
        break;
      */

      default:
        console.warn("WEIRD NO ACTION");
        break;
    }
  }

  private async handleTextAction(event: VNEvent, action: VNAction): Promise<void> {
    try {
      await this.navigationManager.continueManager.wait();
    }
    catch (error) { 
      if (!(error instanceof VNInterruptError)) {
        // Si l'erreur n'est PAS une NavigationCancelledError, alors c'est une erreur inattendue
        console.error("handleTextAction Error:", error);
      }
    }
    this.engineState.dialogue = null;
  }

  // Handle choice actions and return chosen choice ID
  private async handleChoiceAction(event: VNEvent, action: VNAction): Promise<void> {
    try {           
      const choiceId = await this.navigationManager.choiceManager.wait();    
      // SIMULATE CHOICE
      if (choiceId && event.branches?.[choiceId]) {
        //Choice done we set null for next simulation step
        this.engineState.choices = null;
        await this.simulateEvent(event.branches[choiceId].execute);
      } else {
        console.error('A choice have been made not in exepected list: ', choiceId);
      }
    }
    catch (error) { 
      if (!(error instanceof VNInterruptError)) {
        // Si l'erreur n'est PAS une NavigationCancelledError, alors c'est une erreur inattendue
        console.error("handleChoiceAction Error:", error);
      }
    }    
  }

  private async handleJumpAction(event: VNEvent, action: VNAction): Promise<void> {
    // THIS NOT WAI USER INPUT ITS LIKE A CHOICE EVENT BUT CODE CONDITIONAL
    // Jump should exit the current event execution and trigger new event
    const branch_id = action.event_id;     
    if (event.branches?.[branch_id]) {
      await this.simulateEvent(event.branches[branch_id].execute);
    }
  }
}