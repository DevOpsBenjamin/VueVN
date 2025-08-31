import type { VNAction } from '@generate/types';

const using_atm: VNAction = {
    id: "using_atm",
    name: "Use ATM",
    unlocked: () => true,
    execute: (state) => state.flags.using_atm = true,
};

export default using_atm;
