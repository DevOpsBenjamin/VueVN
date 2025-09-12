import type { VNAction } from '@generate/types';

const use_pc: VNAction = {
    id: "use_pc",
    name: "Open PC",
    unlocked: () => true,
    execute: (state) => state.flags.use_pc = true,
};

export default use_pc;
