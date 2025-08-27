import type { GameState } from '@generate/types';

class MoneyManager {
  static withdraw(state: GameState, amount: number, fee: number = 0): boolean {
    const totalCost = amount + fee;
    if (state.player.bankMoney >= totalCost) {
      state.player.bankMoney -= totalCost;
      state.player.pocketMoney += amount;
      return true;
    }
    return false;
  }

  static deposit(state: GameState, amount: number): boolean {
    if (state.player.pocketMoney >= amount) {
      state.player.pocketMoney -= amount;
      state.player.bankMoney += amount;
      return true;
    }
    return false;
  }

  static spendPocket(state: GameState, amount: number): boolean {
    if (state.player.pocketMoney >= amount) {
      state.player.pocketMoney -= amount;
      return true;
    }
    return false;
  }

  static spendBank(state: GameState, amount: number): boolean {
    if (state.player.bankMoney >= amount) {
      state.player.bankMoney -= amount;
      return true;
    }
    return false;
  }

  static earnMoney(state: GameState, amount: number, toBank: boolean = false): void {
    if (toBank) {
      state.player.bankMoney += amount;
    } else {
      state.player.pocketMoney += amount;
    }
  }

  static getTotalMoney(state: GameState): number {
    return state.player.bankMoney + state.player.pocketMoney;
  }

  static canAfford(state: GameState, amount: number, useBank: boolean = false): boolean {
    if (useBank) {
      return this.getTotalMoney(state) >= amount;
    }
    return state.player.pocketMoney >= amount;
  }

  static transfer(state: GameState, fromBank: boolean, amount: number): boolean {
    if (fromBank) {
      return this.withdraw(state, amount, 0);
    } else {
      return this.deposit(state, amount);
    }
  }
}

export default MoneyManager;