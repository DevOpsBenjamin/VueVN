export default interface VNAction {
  type: 'showText' | 'setBackground' | 'setForeground' | 'showChoices' | 'jump' | 'runCustomLogic';
  [key: string]: any;
}