import { SimulateRunner, HistoryManager, NavigationManager, VNInterruptError, EventEndError, Config, DialogHelper } from '@generate/engine';
import { VNActionEnum } from '@generate/enums';
import type { Action, EngineState, GameState, VNEvent, EngineAPI } from '@generate/types';

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
    
    await this.simulateEvent(event.execute, event.name);
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
    console.debug("end runEvent");
  }

  // Generic simulation method that works with both events and branches
  private async simulateEvent(executeFunction: (engine: EngineAPI, state: GameState) => Promise<void>, name: string): Promise<void> {
    const gameStateCopy = JSON.parse(JSON.stringify(this.gameState));
    const engineStateCopy = JSON.parse(JSON.stringify(this.engineState));    
    const simulator = new SimulateRunner(gameStateCopy, engineStateCopy, name);
    
    try {
      await executeFunction(simulator, gameStateCopy);
    } catch (err) {      
      if (err instanceof EventEndError) {
        if (Config.debugMode) {
          await DialogHelper.showConfirmDialog(
            '⚠️ Event End Error (Debug Mode)',
            `Error in event ID: ${err.message}.
In location:${this.gameState.location_id}
You can chose to ignore future Debug Warning for the current session.
`,
            [
              { text: 'OK', action: () => {}, primary: true },
              { text: 'Ignore Future Errors', action: () => { Config.debugMode = false; } }
            ]
          );
        }
        console.error('simulateEvent Code after blocking: ', err.message);
      } else {
        console.error('Engine error:', err);
      }
    }
    this.historyManager.setFuture(simulator.actions);
    this.historyManager.goForward();
  }

  // Restore game and engine state from an action's stored state
  private restoreStateFromAction(action: Action): void {
    console.debug("restoreStateFromAction");
    if (action.gameState && action.engineState) {
      Object.assign(this.gameState, JSON.parse(JSON.stringify(action.gameState)));
      Object.assign(this.engineState, JSON.parse(JSON.stringify(action.engineState)));
      console.debug("restored");
    }
  }
  
  // Execute a single action - ONLY handle user input, state is already restored
  private async executeAction(event: VNEvent, action: Action): Promise<void> {
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

  private async handleTextAction(event: VNEvent, action: Action): Promise<void> {
    try {      
      console.debug("handleTextAction");
      await this.navigationManager.continueManager.wait();
    }
    catch (error) { 
      if (!(error instanceof VNInterruptError)) {
        // Si l'erreur n'est PAS une NavigationCancelledError, alors c'est une erreur inattendue
        console.error("handleTextAction Error:", error);
      }
    }
  }

  // Handle choice actions and return chosen choice ID
  private async handleChoiceAction(event: VNEvent, action: Action): Promise<void> {
    try {           
      console.debug("handleChoiceAction");
      const choiceId = await this.navigationManager.choiceManager.wait();    
      // SIMULATE CHOICE
      if (choiceId && event.branches?.[choiceId]) {
        /*
          After choices we have not the state with choices at null
          Cause we got no forward as choice close event so we need before branch
          to nullify it or in simulateEvent we will start with a corrupted state
        */
        this.engineState.choices = null;
        await this.simulateEvent(event.branches[choiceId].execute, `${event.name}|branch:${choiceId}`);
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

  private async handleJumpAction(event: VNEvent, action: Action): Promise<void> {
    console.debug("handleJumpAction");
    // THIS NOT WAI USER INPUT ITS LIKE A CHOICE EVENT BUT CODE CONDITIONAL
    // Jump should exit the current event execution and trigger new event
    const branch_id = action.event_id;     
    if (event.branches?.[branch_id]) {
      await this.simulateEvent(event.branches[branch_id].execute, `${event.name}|jump:${branch_id}`);
    }
  }

}
