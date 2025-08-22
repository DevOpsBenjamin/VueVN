import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { HistoryEntry } from '../runtime/types';

const useHistoryState = defineStore('historyState', () => {
  const history = ref<HistoryEntry[]>([]);
  const future = ref<HistoryEntry[]>([]);

  function resetHistory(): void {
    console.debug('Resetting history state');
    history.value = [];
    future.value = [];
  }

  function addToHistory(entry: HistoryEntry): void {
    // Clear future when new action taken (no more go-forward)
    future.value = [];
    
    history.value.push(entry);
    
    // Limit history size for performance (50 entries max)
    if (history.value.length > 50) {
      history.value.shift(); // Remove oldest
    }
  }

  function canGoBack(): boolean {
    return history.value.length > 0;
  }

  function canGoForward(): boolean {
    return future.value.length > 0;
  }

  function moveToFuture(entry: HistoryEntry): void {
    future.value.unshift(entry); // Add to BEGINNING of future (first to be retrieved)
  }

  function moveToHistory(): HistoryEntry | null {
    return history.value.pop() || null;
  }

  function moveToHistoryFromFuture(): HistoryEntry | null {
    return future.value.shift() || null; // Take FIRST item, not last
  }

  function addBackToHistory(entry: HistoryEntry): void {
    // Add entry back to history without clearing future (used for goForward)
    history.value.push(entry);
  }

  return {
    history,
    future,
    resetHistory,
    addToHistory,
    canGoBack,
    canGoForward,
    moveToFuture,
    moveToHistory,
    moveToHistoryFromFuture,
    addBackToHistory,
  };
});

export type HistoryStateStore = ReturnType<typeof useHistoryState>;

export default useHistoryState;