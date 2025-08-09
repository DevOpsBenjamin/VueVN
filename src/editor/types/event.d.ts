export interface VNEvent {
  id: string;
  name: string;
  trigger: string;
}

declare function createEvent(event: VNEvent): VNEvent;
