import type { GameTime } from '@generate/types';

//SEE CUSTOM SAMPLE FOR BETTER TYPING
function timeCreator(): GameTime
{
  return {
    hour: 8,
    day: 1,
    month: 6,
    year: 2024
  }
}

export default timeCreator;