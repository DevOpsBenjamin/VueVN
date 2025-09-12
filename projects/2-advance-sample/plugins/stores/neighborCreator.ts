import type { Neighbor } from '@generate/types';
import { RelationLevel } from '@generate/enums';

//SEE CUSTOM SAMPLE FOR BETTER TYPING
function neighborCreator(): Neighbor {
  return {
    name: "Sarah",
    flags: {},
    daily: {},
    relation: 5,
    relationship: RelationLevel.STRANGER
  }
}

export default neighborCreator;
