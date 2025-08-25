// Sample project specific Player extension
export interface Player {
  name: string;
  personality?: string;
  lust: number;
  bankMoney: number;
  pocketMoney: number;
  energy: number;
  daily: Record<string, boolean>;
}