export interface EditorState {
  currentFile: string | null;
  activeModule: string;
  selectedLocation: string | null;
  //Popup
  previewVisible: boolean;
  showEnginePopup: boolean;
  showGamePopup: boolean;
}