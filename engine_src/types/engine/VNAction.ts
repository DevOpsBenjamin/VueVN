import type { EngineState, GameState } from '@generate/types';
import { VNActionEnum } from '@generate/enums';

export interface VNAction {
  type: VNActionEnum;
  event_id: string;
  gameState: GameState;
  engineState: EngineState;
}