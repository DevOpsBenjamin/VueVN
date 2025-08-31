<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/60 backdrop-blur-sm"
      @click="close"
    ></div>
    
    <!-- Modal -->
    <div class="relative bg-gray-900 rounded-xl border border-white/20 shadow-2xl w-full max-w-md mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-white/10">
        <h3 class="text-lg font-semibold text-white flex items-center">
          <span class="mr-2">📅</span>
          Add New Event
        </h3>
        <button 
          @click="close"
          class="text-white/60 hover:text-white transition-colors"
        >
          <span class="text-xl">×</span>
        </button>
      </div>
      
      <!-- Form -->
      <div class="p-6 space-y-4">
        <!-- Event Name -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">
            Event Name
          </label>
          <input
            ref="nameInput"
            v-model="eventName"
            type="text"
            placeholder="e.g., morning_chat, dinner_date"
            class="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            @keydown.enter="handleSubmit"
            @keydown.esc="close"
          />
        </div>
        
        <!-- Event Path -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">
            Path (optional)
          </label>
          <input
            v-model="eventPath"
            type="text"
            placeholder="e.g., dating/evening, knock_door/relation"
            class="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            @keydown.enter="handleSubmit"
            @keydown.esc="close"
          />
          <p class="text-xs text-white/50 mt-1">
            Leave empty for root level, or specify folder structure
          </p>
        </div>
        
        <!-- Preview -->
        <div v-if="fullPath" class="bg-black/20 rounded-lg p-3 border border-white/10">
          <p class="text-xs text-white/60 mb-1">File will be created at:</p>
          <p class="text-sm text-green-400 font-mono">{{ fullPath }}</p>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-white/10">
        <button
          @click="close"
          class="px-4 py-2 text-white/70 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!eventName.trim()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Create Event
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';

interface Props {
  isOpen: boolean;
  selectedLocation: string;
  isGlobal: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'close': [];
  'create': [name: string, path: string, fullPath: string];
}>();

const eventName = ref('');
const eventPath = ref('');
const nameInput = ref<HTMLInputElement>();

const fullPath = computed(() => {
  if (!eventName.value.trim()) return '';
  
  const name = eventName.value.trim();
  const path = eventPath.value.trim();
  
  if (props.isGlobal) {
    return `global/events/${path ? `${path}/` : ''}${name}.ts`;
  } else {
    return `locations/${props.selectedLocation}/events/${path ? `${path}/` : ''}${name}.ts`;
  }
});


function close() {
  eventName.value = '';
  eventPath.value = '';
  emit('close');
}

function handleSubmit() {
  if (!eventName.value.trim()) return;
  
  const name = eventName.value.trim();
  const path = eventPath.value.trim();
  
  emit('create', name, path, fullPath.value);
  close();
}

// Auto-focus input when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      nameInput.value?.focus();
    });
  }
});
</script>