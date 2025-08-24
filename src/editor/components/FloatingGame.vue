<template>
  <div
    v-if="visible"
    class="fixed z-50"
    :style="{ top: y + 'px', left: x + 'px' }"
  >
    <div
      class="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
    >
      <div
        class="cursor-move bg-gray-800 text-gray-300 px-3 py-1 text-xs select-none flex items-center justify-between"
        @mousedown.prevent="startDrag"
      >
        <span>Preview</span>
        <button
          @click="closePreview()"
          class="ml-2 bg-gray-800 text-gray-400 hover:text-white rounded px-2 py-1 text-xs z-10"
        >
          X
        </button>
      </div>
      <div :style="squareStyle" class="relative">
        <Game />
        <!-- Resize handle bottom right -->
        <div
          class="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end"
          @mousedown.prevent="startResize"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 15L15 3" stroke="#aaa" stroke-width="2" />
            <path d="M9 15L15 9" stroke="#aaa" stroke-width="2" />
            <path d="M15 15L15 15" stroke="#aaa" stroke-width="2" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorState } from '@/editor/stores/editorState';
import { Game } from '@/generate/components';

const editorState = useEditorState();
const visible = computed(() => editorState?.previewVisible ?? true);
const size = ref(600);
const squareStyle = computed(() => ({
  width: 2*size.value + 'px',
  height: size.value + 'px',
  background: '#18181b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const x = ref(160);
const y = ref(40);
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragging = false;
let resizing = false;
let resizeStart = { x: 0, y: 0, size: 0 };

function startDrag(e: MouseEvent) {
  dragging = true;
  dragOffsetX = e.clientX - x.value;
  dragOffsetY = e.clientY - y.value;
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
}
function onDrag(e: MouseEvent) {
  if (dragging) {
    x.value = e.clientX - dragOffsetX;
    y.value = e.clientY - dragOffsetY;
  } else if (resizing) {
    const delta = Math.max(
      e.clientX - resizeStart.x,
      e.clientY - resizeStart.y
    );
    size.value = Math.max(200, resizeStart.size + delta);
  }
}
function stopDrag() {
  dragging = false;
  resizing = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
}
function startResize(e: MouseEvent) {
  resizing = true;
  resizeStart.x = e.clientX;
  resizeStart.y = e.clientY;
  resizeStart.size = size.value;
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
}
function closePreview() {
  editorState.previewVisible = false;
}
</script>
