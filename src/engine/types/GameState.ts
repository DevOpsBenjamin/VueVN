export default interface GameState {
  player: { name: string };
  location: string;
  flags: Record<string, any>;
  [key: string]: any;
}