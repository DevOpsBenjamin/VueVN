<template>
  <div class="file-tree-node">
    <!-- Directory -->
    <div 
      v-if="item.type === 'directory'"
      class="directory-item"
    >
      <div 
        class="flex items-center cursor-pointer px-2 py-1 hover:bg-gray-800"
        @click="toggleExpanded"
      >
        <span class="mr-1">{{ isExpanded ? '▼' : '▶' }}</span>
        <span class="mr-1">📁</span>
        <span class="truncate">{{ item.name }}</span>
      </div>
      
      <div v-if="isExpanded && item.children" class="ml-4">
        <FileTreeNode
          v-for="child in item.children"
          :key="child.path"
          :item="child"
          :selected-file="selectedFile"
          @select="$emit('select', $event)"
        />
      </div>
    </div>
    
    <!-- File -->
    <div
      v-else
      class="flex items-center cursor-pointer px-2 py-1 hover:bg-gray-800"
      :class="{
        'bg-gray-800': selectedFile === item.path,
      }"
      @click="$emit('select', item)"
    >
      <span class="mr-1">{{ getFileEmoji(item.name) }}</span>
      <span class="truncate">{{ item.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface FileItem {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: FileItem[];
}

interface Props {
  item: FileItem;
  selectedFile?: string;
}

defineProps<Props>();

defineEmits<{
  select: [item: FileItem];
}>();

const isExpanded = ref(true); // Start expanded by default

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function getFileEmoji(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch(ext) {
    case 'ts': return '🟦'; // TypeScript
    case 'vue': return '💚'; // Vue
    case 'json': return '📋'; // JSON
    case 'md': return '📝'; // Markdown
    case 'js': return '🟨'; // JavaScript
    case 'css': return '🎨'; // CSS
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg': return '🖼️'; // Images
    default: return '📄'; // Default file
  }
}
</script>

<style scoped>
.file-tree-node {
  font-size: 0.75rem; /* text-xs */
}

.directory-item > .ml-4 {
  border-left: 1px solid #374151; /* gray-700 */
}
</style>