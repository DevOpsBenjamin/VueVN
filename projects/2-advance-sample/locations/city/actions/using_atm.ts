import type { Action } from '@generate/types';

const using_atm: Action = {
    id: "using_atm",
    name: "Use ATM",
    unlocked: () => true,
    execute: (state) => state.flags.using_atm = true,
};

export default using_atm;