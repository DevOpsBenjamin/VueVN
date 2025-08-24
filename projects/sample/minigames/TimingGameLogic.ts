import type { GameState } from '@/generate/types';
import { CustomRegistry } from '@/generate/runtime';

interface TimingGameResult {
  bonus: number;
  zone: string;
  reward: number;
  angle: number;
}

class TimingGame {
  private angle: number = 0;
  private speed: number = 2;
  private isRunning: boolean = true;
  private zones = {
    green: { start: 70, end: 110, bonus: 1.5 },
    orange: { start: 50, end: 70, bonus: 1.0 },
    red: { start: 0, end: 50, bonus: 0.5 }
  };
  
  constructor(private difficulty: number, private baseReward: number) {
    this.speed = 2 + (difficulty * 0.5);
  }
  
  async play(): Promise<TimingGameResult> {
    console.log('Starting timing game...');
    
    return new Promise((resolve) => {
      const gameLoop = setInterval(() => {
        if (!this.isRunning) return;
        
        this.angle = (this.angle + this.speed) % 360;
      }, 16); // 60fps
      
      // Listen for user click
      const clickHandler = () => {
        this.isRunning = false;
        clearInterval(gameLoop);
        
        const result = this.calculateResult();
        document.removeEventListener('click', clickHandler);
        console.log('Timing game result:', result);
        resolve(result);
      };
      
      document.addEventListener('click', clickHandler);
    });
  }
  
  private calculateResult(): TimingGameResult {
    let zone = 'red';
    let bonus = 0.5;
    
    for (const [zoneName, zoneData] of Object.entries(this.zones)) {
      if (this.angle >= zoneData.start && this.angle <= zoneData.end) {
        zone = zoneName;
        bonus = zoneData.bonus;
        break;
      }
    }
    
    const reward = Math.floor(this.baseReward * bonus);
    return { bonus, zone, reward, angle: this.angle };
  }
}

// Register the timing minigame with the custom logic registry
CustomRegistry.register('timingMinigame', async (args, gameState: GameState) => {
  const game = new TimingGame(args.difficulty || 1, args.reward || 100);
  const result = await game.play();
  
  // Update game state based on result
  /*
  if (!gameState.player.money) {
    gameState.player.money = 0;
  }
  gameState.player.money += result.reward;
  */
  
  //gameState.lastMinigameResult = result;
  
  console.log(`Timing game completed: ${result.zone} zone, ${result.reward} money earned`);
  
  return result;
});

export default TimingGame;