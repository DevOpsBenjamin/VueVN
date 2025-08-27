import type { Barista } from '@generate/types';

function baristaCreator(): Barista {
  return {
    name: "Maya",
    flags: {},
    relation: 0,
    relationship: "stranger",
    workSchedule: {
      workDays: [1, 2, 3, 4, 5, 6], // Monday-Saturday
      startHour: 7,
      endHour: 19
    }
  };
}

export default baristaCreator;