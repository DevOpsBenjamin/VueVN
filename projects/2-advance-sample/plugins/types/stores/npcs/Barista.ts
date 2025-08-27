import { DateableNPC } from "./DateableNPC";

export interface Barista extends DateableNPC {
  workSchedule: {
    workDays: number[]; // 0-6 (Sunday-Saturday)
    startHour: number;
    endHour: number;
  };
}