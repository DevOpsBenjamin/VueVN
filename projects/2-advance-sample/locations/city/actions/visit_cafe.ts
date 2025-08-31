import type { VNAction } from '@generate/types';

const visitCafe: VNAction = {
  id: 'visit_cafe',
  name: "Visit Coffee Shop",
  unlocked: () => true,
  execute: (state) => { 
    state.flags.goto_cafe = true;
  }
};

export default visitCafe;
