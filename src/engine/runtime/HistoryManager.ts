import type { HistoryEntry } from '@/generate/types';

interface SavedHistory {
    history:HistoryEntry[];
    future:HistoryEntry[];
}

export default class HistoryManager {
    size: number = 20;
    history:HistoryEntry[];
    future:HistoryEntry[];

    constructor () {
        this.history = [];
        this.future = [];
    }

    load(saved: SavedHistory): void {
        this.history = saved.history;
        this.future = saved.future;
    }

    resetHistory(): void {
        this.history = [];
        this.future = [];
    }
}