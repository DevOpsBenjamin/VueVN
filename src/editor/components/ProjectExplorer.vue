<template>
  <div class="flex-1 overflow-y-auto">
    <ul>
      <li v-for="evt in events" :key="evt.name">
        <button
          class="w-full text-left px-2 py-1 hover:bg-gray-800"
          @click="select(evt.name)"
        >
          {{ evt.name }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useEventsStore } from "@/editor/stores/events";

const eventsStore = useEventsStore();
const { events } = storeToRefs(eventsStore);

function select(name: string) {
  eventsStore.selectEvent(name);
}
</script>
