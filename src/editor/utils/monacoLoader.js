// src/utils/monacoLoader.js
let monacoPromise;

export function loadMonaco() {
  if (window.monaco) {
    return Promise.resolve();
  }
  if (monacoPromise) {
    return monacoPromise;
  }

  monacoPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js";
    script.onload = () => {
      window.require.config({
        paths: {
          vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs",
        },
      });
      window.require(["vs/editor/editor.main"], () => {
        resolve();
      });
    };
    document.body.appendChild(script);
  });

  return monacoPromise;
}
