import type { Action } from '@/generate/types';
import { city }  from '@/generate/locations';

const using_atm: Action = {
    id: "using_atm",
    name: "Use ATM",
    unlocked: (state) => state.location_id === city.id,
    execute: (state) => state.flags.using_atm = true,
};

export default using_atm;