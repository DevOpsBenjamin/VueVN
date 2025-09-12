import { VNActionEnum } from "@generate/enums"
import { EventEndError } from "@generate/engine"
import type { Text, CustomArgs, EngineAPI, EngineState, GameState, Action,  } from "@generate/types"

export default class SimulateRunner implements EngineAPI
{
    gameState: GameState;
    engineState: EngineState;
    actions: Action[];
    event_id:string;
    event_ended: boolean;

    constructor(gameState: GameState, engineState: EngineState, event_id:string) {
        this.gameState = gameState;
        this.engineState = engineState;
        this.actions = [];
        this.event_id = event_id;
        this.event_ended = false;
        console.debug('Simulator cto for: ', this.event_id)
    }


    // Clean two-signature approach
    async showText(text: string, from?: string): Promise<void>;
    async showText(options: { text: Text, from?: string, variables?: Record<string, any> }): Promise<void>;
    
    // Single implementation - normalize to dialogue object
    async showText(textOrOptions: string | { text: Text, from?: string, variables?: Record<string, any> }, from?: string): Promise<void> {
        if (this.event_ended) {
            throw new EventEndError(this.event_id)
        }

        // Always normalize to dialogue object format
        if (typeof textOrOptions === 'string') {
            this.engineState.dialogue = { text: textOrOptions, from: from };
        } else {
            this.engineState.dialogue = textOrOptions;
        }
        
        this.engineState.currentStep++;
        
        // Create action with complete state snapshot
        this.actions.push({
          type: VNActionEnum.SHOW_TEXT,
          event_id: this.event_id,
          gameState: JSON.parse(JSON.stringify(this.gameState)),
          engineState: JSON.parse(JSON.stringify(this.engineState))
        });
        
        // Clear dialogue after capturing - next action starts clean
        this.engineState.dialogue = null;
    }

    async showChoices(choices: Array<any>): Promise<void> {
        if (this.event_ended) {
            throw new EventEndError(this.event_id)
        }
        // Store original Text objects (not resolved) for dynamic language switching
        const choicesWithOriginalText = choices.map(choice => ({
          ...choice,
          text: choice.text // Keep original Text objects
        }));
        
        this.engineState.choices = choicesWithOriginalText;
        this.engineState.currentStep++;
        
        // Create action with state snapshot (WITH original Text objects)
        this.actions.push({
          type: VNActionEnum.SHOW_CHOICES,
          event_id: this.event_id,
          gameState: JSON.parse(JSON.stringify(this.gameState)),
          engineState: JSON.parse(JSON.stringify(this.engineState))
        });
        
        this.event_ended = true;
    }

    async runCustom(args: CustomArgs): Promise<void> {
        if (this.event_ended) {
            throw new EventEndError(this.event_id)
        }
        this.engineState.currentStep++;
        this.engineState.customArgs = args
        
        // Create action with state snapshot (WITH custom type)
        this.actions.push({
          type: VNActionEnum.RUN_CUSTOM,
          event_id: this.event_id,
          gameState: JSON.parse(JSON.stringify(this.gameState)),
          engineState: JSON.parse(JSON.stringify(this.engineState))
        });
        
        this.event_ended = true;
    }
    
    // Intra-event branch jump: queues a JUMP action with the target branch_id
    async jump(branchId: string): Promise<void> {
        if (this.event_ended) {
            throw new EventEndError(this.event_id)
        }
        this.engineState.currentStep++;

        // Create action with state snapshot (WITH jump type)
        this.actions.push({
          type: VNActionEnum.JUMP,
          event_id: this.event_id,
          gameState: JSON.parse(JSON.stringify(this.gameState)),
          engineState: JSON.parse(JSON.stringify(this.engineState))
        });

        this.event_ended = true;
    }

    setBackground(imagePath: string): void {
        if (this.event_ended) {
            throw new EventEndError(this.event_id)
        }
        this.engineState.background = imagePath;
    }

    setForeground(imagePaths: string[]): void {
        if (this.event_ended) {
            throw new EventEndError(this.event_id)
        }
        this.engineState.foreground = [...imagePaths];
    }

    addForeground(imagePath: string): void {
        if (this.event_ended) {
            throw new EventEndError(this.event_id)
        }
        if (!this.engineState.foreground) {
            this.engineState.foreground = [];
        }
        this.engineState.foreground.push(imagePath);
    }

    replaceForeground(imagePath: string): void {
        if (this.event_ended) {
            throw new EventEndError(this.event_id)
        }
        if (!this.engineState.foreground || this.engineState.foreground.length === 0) {
            this.engineState.foreground = [imagePath];
        } else {
            this.engineState.foreground[this.engineState.foreground.length - 1] = imagePath;
        }
    }
}
