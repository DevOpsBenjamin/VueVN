export interface Location {
  id: string;
  name: string;
  background: string;
  [key: string]: any;
}

const bedroom: Location = {
  id: "bedroom",
  name: "Bedroom",
  background: "assets/images/background/bedroom/morning.png",
};

export default bedroom;
