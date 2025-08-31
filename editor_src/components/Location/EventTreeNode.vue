<template>
  <template v-if="node.type === 'folder'">
    <!-- Folder Row -->
    <tr class="hover:bg-white/5 transition-colors">
      <td class="px-4 py-2">
        <div class="text-xs text-white/70 font-medium">{{ getFolderStatusBreakdown(node) }}</div>
      </td>
      <td class="px-4 py-2">
        <div class="flex items-center text-white font-medium text-sm">
          <div class="flex items-center font-mono text-white/40 mr-2" style="min-width: fit-content;">
            <span v-html="treePrefix"></span>
          </div>
          <button
            @click="$emit('toggle-folder', node.id)"
            class="flex items-center justify-center w-4 h-4 hover:bg-white/20 rounded transition-colors mr-2"
          >
            <span class="text-xs">{{ node.isExpanded ? '▼' : '▶' }}</span>
          </button>
          <span class="text-yellow-400 mr-2">📁</span>
          <span>{{ node.name }}/</span>
        </div>
      </td>
      <td colspan="4" class="px-4 py-2">
        <div class="text-xs text-white/30">folder</div>
      </td>
    </tr>
    
    <!-- Children (if expanded) -->
    <template v-if="node.isExpanded && node.children">
      <EventTreeNode
        v-for="(child, index) in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :is-last="index === node.children.length - 1"
        :parent-branches="updatedParentBranches"
        @open-editor="$emit('open-editor', $event)"
        @toggle-folder="$emit('toggle-folder', $event)"
      />
    </template>
  </template>
  
  <template v-else>
    <!-- Event Row -->
    <tr class="hover:bg-white/5 transition-colors align-top">
      <td class="px-4 py-3">
        <div class="text-sm">
          <span>{{ node.event.lockedResult ? '🔒' : (node.event.availableNow ? '✅' : '❌') }}</span>
        </div>
      </td>
      <td class="px-4 py-3">
        <div class="flex items-center text-white font-medium text-sm">
          <div class="flex items-center font-mono text-white/40 mr-2" style="min-width: fit-content;">
            <span v-html="treePrefix"></span>
          </div>
          <span>{{ node.name }}</span>
        </div>
      </td>
      <td class="px-4 py-3 text-left">
        <div class="text-xs text-white whitespace-pre-wrap break-words">
          <template v-if="node.event.lockedResult">
            <span class="mr-2">🔒</span>
            |
            <span class="ml-2 opacity-80">{{ node.event.lockedText }}</span>
          </template>
          <template v-else>
            <span class="mr-2">⬜</span>
            |
            <span class="ml-2 opacity-80">{{ node.event.lockedText }}</span>
          </template>
        </div>
      </td>
      <td class="px-4 py-3 text-left">
        <div class="text-xs text-white whitespace-pre-wrap break-words">
          <span class="mr-2">{{ node.event.unlockedResult ? '✅' : '❌' }}</span>
          |
          <span class="ml-2 opacity-80">{{ node.event.unlockedText }}</span>
        </div>
      </td>
      <td class="px-4 py-3 text-left">
        <div class="text-xs text-white whitespace-pre-wrap break-words">
          <span class="mr-2">{{ node.event.conditionResult ? '✅' : '❌' }}</span>
          |
          <span class="ml-2 opacity-80">{{ node.event.conditionText }}</span>
        </div>
      </td>
      <td class="px-4 py-3 text-left">
        <div class="flex items-center gap-2">
          <button
            @click="$emit('open-editor', node.event.filePath)"
            class="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded border border-orange-500/30 text-orange-400 text-xs transition-all duration-200"
          >
            <span>✏️</span>
            <span>Edit</span>
          </button>
          <button
            disabled
            class="inline-flex items-center space-x-1 px-2 py-1 bg-white/10 rounded border border-white/10 text-white/40 text-xs cursor-not-allowed"
            title="Delete (coming soon)"
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      </td>
    </tr>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'event';
  isExpanded?: boolean;
  children?: TreeNode[];
  event?: any;
  fullPath?: string;
}

interface Props {
  node: TreeNode;
  depth: number;
  isLast?: boolean;
  parentBranches?: boolean[];
}

defineEmits<{
  'open-editor': [filePath: string];
  'toggle-folder': [folderId: string];
}>();

const props = withDefaults(defineProps<Props>(), {
  isLast: false,
  parentBranches: () => []
});

// Generate tree prefix with proper branching characters
const treePrefix = computed(() => {
  if (props.depth === 0) return '';
  
  let prefix = '';
  
  // Add vertical lines for parent branches
  for (let i = 0; i < props.depth - 1; i++) {
    if (props.parentBranches[i]) {
      prefix += '│&nbsp;&nbsp;&nbsp;';
    } else {
      prefix += '&nbsp;&nbsp;&nbsp;&nbsp;';
    }
  }
  
  // Add the current level connector
  if (props.isLast) {
    prefix += '└──';
  } else {
    prefix += '├──';
  }
  
  return prefix;
});

// Update parent branches for children
const updatedParentBranches = computed(() => {
  const branches = [...props.parentBranches];
  if (props.depth > 0) {
    branches[props.depth - 1] = !props.isLast;
  }
  return branches;
});

function getFolderEventCount(folder: TreeNode): number {
  let count = 0;
  if (folder.children) {
    for (const child of folder.children) {
      if (child.type === 'event') {
        count++;
      } else {
        count += getFolderEventCount(child);
      }
    }
  }
  return count;
}

function getFolderStatusBreakdown(folder: TreeNode): string {
  let locked = 0;
  let available = 0;
  let unavailable = 0;
  
  function countEvents(node: TreeNode) {
    if (node.type === 'event') {
      if (node.event.lockedResult) {
        locked++;
      } else if (node.event.availableNow) {
        available++;
      } else {
        unavailable++;
      }
    } else if (node.children) {
      for (const child of node.children) {
        countEvents(child);
      }
    }
  }
  
  if (folder.children) {
    for (const child of folder.children) {
      countEvents(child);
    }
  }
  
  return `${locked}🔒 ${available}✅ ${unavailable}❌`;
}
</script>
