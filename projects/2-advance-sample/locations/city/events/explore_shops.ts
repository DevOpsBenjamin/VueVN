import type { VNEvent } from '@generate/types';

const explore_shops: VNEvent = {
  name: 'Explore Shops',
  foreground: 'assets/images/background/city/day.png',
  conditions: (state) => state.flags.explore_shops === true,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    if (state.gameTime.hour >= 9 && state.gameTime.hour <= 18) {
      await engine.showText("You walk around the shopping district.");
      await engine.showText("There's a bookstore, a cafe, and a small grocery store.");
            
      await engine.showChoices([
        { text: 'Visit the cafe', branch: 'cafe' },
        { text: 'Check the grocery store', branch: 'grocery' },
        { text: 'Just window shop', branch: 'window_shop' }
      ]);
    } else {
      state.flags.explore_shops = false;
      await engine.showText("Most shops are closed at this hour.");
      await engine.showText("You can see their displays through the windows, but everything is locked up.");
      await engine.showText("You should come back during business hours (9h-18h).");
      // Stay in city - don't change location
    }
  },

  branches: {
    cafe: {
      async execute(engine, state) {
        //NO MATTER WHAT YOU DO YOU WILL END THIS EVENT
        state.flags.explore_shops = false;
        await engine.showText("You step into the warm cafe.");
        await engine.showText("The aroma of fresh coffee and baked goods fills the air.");
        
        if (state.player.daily.hadCoffee) {
          await engine.showText("You've already had your coffee for the day.");
          await engine.showText("The barista smiles and says: 'Maybe try our tea next time!'");
        } 
        else if (state.player.pocketMoney >= 5) {
          await engine.showChoices([
            { text: 'Buy a coffee ($5)', branch: 'buy_coffee' },
            { text: 'Just look around', branch: 'look_around_cafe' }
          ]);
        } 
        else {
          await engine.showText("You'd love a coffee, but you don't have enough pocket money.");
          await engine.showText(`You have $${state.player.pocketMoney} in your pocket (need $5).`);
          await engine.showText("Maybe you should visit the ATM first.");
          await engine.showText("You just enjoy the warm atmosphere for a moment.");
        }
      }
    },
    
    buy_coffee: {
      async execute(engine, state) {
        state.player.pocketMoney -= 5;
        state.player.energy = Math.min(state.player.energy + 15, 100);
        state.player.daily.hadCoffee = true;
        
        await engine.showText("You buy a delicious coffee and feel more energized!");
        await engine.showText(`Pocket money: $${state.player.pocketMoney}`, "System");
        await engine.showText("You've had your daily coffee - that's enough caffeine for today!", "System");
      }
    },
    
    look_around_cafe: {
      async execute(engine, _) {
        await engine.showText("You enjoy the cozy atmosphere without buying anything.\nThe cafe has a nice vibe with soft music and friendly staff.");
      }
    },
    
    grocery: {
      async execute(engine, state) {
        state.flags.explore_shops = false;
        await engine.showText("You walk through the small grocery store.");
        await engine.showText("It has the essentials - fruits, vegetables, canned goods, and household items.");
        await engine.showText("Everything looks fresh and well-organized.");
      }
    },
  }
};

export default explore_shops;