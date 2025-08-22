import type { EngineState, GameState, VNActionEnum } from '@/generate/types';

export default interface VNAction {
  type: VNActionEnum;
  event_id: string,
  gameState: GameState,
  engineState: EngineState
}