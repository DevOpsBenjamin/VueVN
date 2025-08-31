export interface EditorState {
  currentFile: string | null;
  activeModule: string;
  selectedLocation: string | null;
  activeLocationTab: string;
  //Popup
  previewVisible: boolean;
  showEnginePopup: boolean;
  showGamePopup: boolean;
}