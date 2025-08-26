import type { Neighbor } from '@generate/types';

//SEE CUSTOM SAMPLE FOR BETTER TYPING
function neighborCreator(): Neighbor {
  return {
    name: "Sarah",
    flags: {},
    relation: 5,
    relationship: "stranger"
  }
}

export default neighborCreator;