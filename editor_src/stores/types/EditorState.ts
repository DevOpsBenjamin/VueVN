export interface EditorState {
  currentFile: string | null;
  activeModule: string;
  selectedLocation: string | null;
  activeLocationTab: string;
  //Popup
  previewVisible: boolean;
  showEnginePopup: boolean;
  showGamePopup: boolean;
  // File editor popup
  showFilePopup: boolean;
  fileToEdit: string | null; // path relative to project root
  fileInitialContent: string | null; // initial content for new files
}
