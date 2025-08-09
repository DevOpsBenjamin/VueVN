import runtimeTypes from "@/engine/runtime/types.ts?raw";

export function registerEventTypes() {
  if (!window.monaco) return;
  window.monaco.languages.typescript.typescriptDefaults.addExtraLib(
    runtimeTypes,
    "ts:runtime/types.ts",
  );
}
