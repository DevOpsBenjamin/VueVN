import type { VNEvent } from '@generate/types';

const cityCenter: VNEvent = {
  name: 'Arrive at City Center', 
  foreground: 'assets/images/background/city/day.png',
  conditions: (state) => state.player.daily.city_welcome !== false,
  unlocked: () => true,
  locked: () => false,
  
  async execute(engine, state) {
    state.player.daily.city_welcome = false;
    await engine.showText("You arrive at the busy city center.");
    
    if (state.gameTime.hour >= 6 && state.gameTime.hour < 20) {
      await engine.showText("People are walking around, shops are open, and the city is alive with activity.");
    } else {
      await engine.showText("The city is quieter at night, with most shops closed and fewer people around.");
    }
    
    await engine.showText("You see an ATM nearby, various shops and cafes, and people going about their business.");
    await engine.showText("You can explore the city at your own pace and choose what to do.");
    
  }
};

export default cityCenter;