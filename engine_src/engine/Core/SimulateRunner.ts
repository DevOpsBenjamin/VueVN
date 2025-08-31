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

    // Helper function to resolve Text objects to current language
    private resolveText(text: string | Text): string {
        if (typeof text === 'string') {
            return text;
        }
        const obj: any = text as any;
        const lang = (this.engineState.settings.language || 'en').toLowerCase();
        const val = obj?.[lang];
        if (typeof val === 'string' && val.trim().length > 0) {
            return val;
        }
        // No fallback: show explicit missing marker for the current language
        const key = typeof obj?.__key === 'string' ? obj.__key : 'unknown';
        return `(MISSING TRANSLATION FOR LANG [${lang}] KEY [${key}])`;
    }

    async showText(text: string | Text, from?: string): Promise<void> {
        if (this.event_ended) {
            throw new EventEndError(this.event_id)
        }

        // Handle Text objects by extracting the appropriate language text
        const resolvedText = this.resolveText(text);
        
        this.engineState.dialogue = { text: resolvedText, from: from };
        this.engineState.currentStep++;
        
        // Create action with complete state snapshot (WITH dialogue type)
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
        // Handle Text objects in choices by resolving them to current language
        const resolvedChoices = choices.map(choice => ({
          ...choice,
          text: this.resolveText(choice.text)
        }));
        
        this.engineState.choices = resolvedChoices;
        this.engineState.currentStep++;
        
        // Create action with state snapshot (WITH choices type)
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
