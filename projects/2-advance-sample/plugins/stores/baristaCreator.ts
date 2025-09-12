import type { Barista } from '@generate/types';
import { RelationLevel } from '@generate/enums';

function baristaCreator(): Barista {
  return {
    name: "Maya",
    flags: {},
    daily: {},
    relation: 0,
    relationship: RelationLevel.STRANGER,
    workSchedule: {
      workDays: [1, 2, 3, 4, 5, 6], // Monday-Saturday
      startHour: 7,
      endHour: 19
    }
  };
}

export default baristaCreator;
