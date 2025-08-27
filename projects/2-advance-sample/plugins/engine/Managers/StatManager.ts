import type { GameState } from '@generate/types';

class StatManager {
  static addEnergy(state: GameState, amount: number, max: number = 100): void {
    state.player.energy = Math.min(state.player.energy + amount, max);
  }

  static removeEnergy(state: GameState, amount: number): boolean {
    if (state.player.energy >= amount) {
      state.player.energy -= amount;
      return true;
    }
    return false;
  }

  static setEnergy(state: GameState, amount: number, max: number = 100): void {
    state.player.energy = Math.max(0, Math.min(amount, max));
  }

  static hasEnergy(state: GameState, required: number): boolean {
    return state.player.energy >= required;
  }

  static addLust(state: GameState, amount: number, max: number = 100): void {
    state.player.lust = Math.min(state.player.lust + amount, max);
  }

  static removeLust(state: GameState, amount: number): void {
    state.player.lust = Math.max(0, state.player.lust - amount);
  }

  static setLust(state: GameState, amount: number, max: number = 100): void {
    state.player.lust = Math.max(0, Math.min(amount, max));
  }

  static isLustHigh(state: GameState, threshold: number = 60): boolean {
    return state.player.lust >= threshold;
  }

  static isLustLow(state: GameState, threshold: number = 20): boolean {
    return state.player.lust <= threshold;
  }

  static restoreStats(state: GameState, energy: number = 100, lust: number = 0): void {
    this.setEnergy(state, energy);
    this.setLust(state, lust);
  }

  static isExhausted(state: GameState): boolean {
    return state.player.energy <= 10;
  }

  static canPerformActivity(state: GameState, energyCost: number): boolean {
    return this.hasEnergy(state, energyCost);
  }

  static performActivity(state: GameState, energyCost: number, lustGain: number = 0): boolean {
    if (this.canPerformActivity(state, energyCost)) {
      this.removeEnergy(state, energyCost);
      if (lustGain > 0) {
        this.addLust(state, lustGain);
      }
      return true;
    }
    return false;
  }
}

export default StatManager;