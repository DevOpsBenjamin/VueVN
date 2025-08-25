import type { VNEvent } from '@/generate/types';

const useATM: VNEvent = {
  id: 'use_atm',
  name: 'Use ATM',
  foreground: 'assets/images/background/city/day.png',
  conditions: (state) => state.flags.using_atm === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, _) {
    await engine.showText("You approach the ATM machine.");
    await engine.showChoices([
      { text: '*beep beep* Please insert your card.', branch: 'atm_choice' }
    ]);
  },

  branches: {
    atm_leave: {
      async execute(engine, state) {
        state.flags.using_atm = false
        await engine.showText("You finished using ATM and go back to city");
      }
    },
    atm_choice: {
      async execute(engine, _) {        
        await engine.showChoices([
          { text: 'Check bank balance', branch: 'check_balance' },
          { text: 'Withdraw money to pocket', branch: 'withdraw' },
          { text: 'Check pocket money', branch: 'check_pocket' },
          { text: 'Quit ATM', branch: 'atm_leave' }
        ]);
      }
    },
    check_balance: {
      async execute(engine, state) {
        await engine.showText(`Your bank balance is: $${state.player.bankMoney}`, "ATM");
        await engine.showChoices([
          { text: 'Check something else', branch: 'atm_choice' },
          { text: 'Quit ATM', branch: 'atm_leave' }
        ]);
      }
    },
    
    withdraw: {
      async execute(engine, state) {
        if (state.player.bankMoney >= 51) {
           // Need at least $55 in bank for $50 withdrawal + $1 fee
          state.player.bankMoney -= 51; // Deduct from bank ($50 + $1 fee)
          state.player.pocketMoney += 50; // Add to pocket (only the withdrawn amount)
          await engine.showText("You withdraw $50 to your pocket. ATM fee: $1", "ATM");
          await engine.showText(`Bank balance: $${state.player.bankMoney}\nPocket money: $${state.player.pocketMoney}`, "ATM");
        } else {
          await engine.showText("Insufficient bank funds for withdrawal.", "ATM");
          await engine.showText(`Bank balance: $${state.player.bankMoney} (need at least $51)`, "ATM");
        }
        await engine.showChoices([
          { text: 'Check something else', branch: 'atm_choice' },
          { text: 'Quit ATM', branch: 'atm_leave' }
        ]);
      }
    },
    
    check_pocket: {
      async execute(engine, state) {
        await engine.showText(`You have: $${state.player.pocketMoney} in pockey`, "ATM");
        await engine.showChoices([
          { text: 'Check something else', branch: 'atm_choice' },
          { text: 'Quit ATM', branch: 'atm_leave' }
        ]);
      }
    }
  }
};

export default useATM;