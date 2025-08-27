import { VNActionEnum } from "@generate/enums"
import type { CustomArgs, EngineAPI, EngineState, GameState, VNAction } from "@generate/types"
import type { Text } from "@generate/types"

export default class SimulateRunner implements EngineAPI
{
    gameState: GameState;
    engineState: EngineState;
    actions: VNAction[];
    event_id:string;

    constructor(gameState: GameState, engineState: EngineState, event_id:string) {
        this.gameState = gameState;
        this.engineState = engineState;
        this.actions = [];
        this.event_id = event_id;
    }

    // Helper function to resolve Text objects to current language
    private resolveText(text: string | Text): string {
        if (typeof text === 'string') {
            return text;
        }
        const typeText:Text = text;
        // Get current language from settings (default to 'en')
        const currentLang = this.engineState.settings.language || 'en';
        
        // Try current language first, fallback to English
        if (typeText.fr) {
            return typeText.fr!;
        }
        
        return typeText.en;
    }

    async showText(text: string | Text, from?: string): Promise<void> {
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
        
        // Clear choices after capturing - clean state for next action
        this.engineState.choices = null;
    }

    async runCustom(args: CustomArgs): Promise<void> {
        this.engineState.currentStep++;
        this.engineState.customArgs = args
        
        // Create action with state snapshot (WITH custom type)
        this.actions.push({
          type: VNActionEnum.RUN_CUSTOM,
          event_id: this.event_id,
          gameState: JSON.parse(JSON.stringify(this.gameState)),
          engineState: JSON.parse(JSON.stringify(this.engineState))
        });
        
        // Clear custom after capturing - clean state for next action
        this.engineState.customArgs = null
    }
    
    async jump(eventId: string): Promise<void> {
        this.engineState.currentStep++;

        // Create action with state snapshot (WITH jump type)
        this.actions.push({
          type: VNActionEnum.JUMP,
          event_id: eventId,
          gameState: JSON.parse(JSON.stringify(this.gameState)),
          engineState: JSON.parse(JSON.stringify(this.engineState))
        });
    }

    setBackground(imagePath: string): void {
        this.engineState.background = imagePath;
    }

    setForeground(imagePaths: string[]): void {
        this.engineState.foreground = [...imagePaths];
    }

    addForeground(imagePath: string): void {
        if (!this.engineState.foreground) {
            this.engineState.foreground = [];
        }
        this.engineState.foreground.push(imagePath);
    }

    replaceForeground(imagePath: string): void {
        if (!this.engineState.foreground || this.engineState.foreground.length === 0) {
            this.engineState.foreground = [imagePath];
        } else {
            this.engineState.foreground[this.engineState.foreground.length - 1] = imagePath;
        }
    }
}