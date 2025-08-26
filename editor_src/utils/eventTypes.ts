import eventTypes from '@editor/types/event.d.ts?raw';

export function registerEventTypes() {
  if (!window.monaco) return;
  window.monaco.languages.typescript.typescriptDefaults.addExtraLib(
    eventTypes,
    'ts:event.d.ts'
  );
}
