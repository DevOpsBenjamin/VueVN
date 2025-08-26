import type { Player } from '@generate/types';

//SEE CUSTOM SAMPLE FOR BETTER TYPING
function playerCreator(): Player
{
  return {
    name: "MC",
    lust: 0,
    bankMoney: 1000,
    pocketMoney: 50,
    energy: 100,
    daily: {}
  }
}

export default playerCreator;