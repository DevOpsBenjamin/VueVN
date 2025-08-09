import { defineStore } from "pinia";
import { ref } from "vue";
import { verifyEvent } from "@/editor/utils/verifyEvent";

interface EventItem {
  name: string;
  code: string;
}

export const useEventsStore = defineStore("events", () => {
  const events = ref<EventItem[]>([
    {
      name: "sample",
      code: "createEvent({ id: 'sample', name: 'Sample Event', trigger: 'start' });\n",
    },
  ]);
  const currentEvent = ref<EventItem | null>(events.value[0]);

  function selectEvent(name: string) {
    const evt = events.value.find((e) => e.name === name);
    if (evt) currentEvent.value = evt;
  }

  function updateCurrentEventCode(code: string) {
    if (currentEvent.value) currentEvent.value.code = code;
  }

  function saveCurrentEvent() {
    if (!currentEvent.value) return;
    if (verifyEvent(currentEvent.value.code)) {
      console.log("Event saved", currentEvent.value);
      alert("Event saved");
    } else {
      alert("Event verification failed");
    }
  }

  return {
    events,
    currentEvent,
    selectEvent,
    updateCurrentEventCode,
    saveCurrentEvent,
  };
});
