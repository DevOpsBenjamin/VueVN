<template>
  <template v-if="node.type === 'folder'">
    <tr class="hover:bg-white/5 transition-colors">
      <td class="px-4 py-2">
        <div class="flex items-center text-white font-medium text-sm">
          <div class="flex items-center font-mono text-white/40 mr-2" style="min-width: fit-content;">
            <span v-html="treePrefix"></span>
          </div>
          <button @click="$emit('toggle-folder', node.id)" class="flex items-center justify-center w-4 h-4 hover:bg-white/20 rounded transition-colors mr-2">
            <span class="text-xs">{{ node.isExpanded ? '▼' : '▶' }}</span>
          </button>
          <span class="text-yellow-400 mr-2">📁</span>
          <span>{{ node.name }}/</span>
        </div>
      </td>
      <td v-for="lang in langs" :key="'f-'+node.id+'-'+lang" class="px-4 py-2 text-sm">
        <span :class="folderLangComplete(lang) ? 'text-green-400' : 'text-red-400'">
          {{ folderLangComplete(lang) ? '✅' : '❌' }}
        </span>
      </td>
      <td class="px-4 py-2"></td>
    </tr>
    <template v-if="node.isExpanded && node.children">
      <TextTreeNode
        v-for="(child, index) in node.children"
        :key="child.id"
        :node="child"
        :langs="langs"
        :depth="depth + 1"
        :is-last="index === node.children.length - 1"
        :parent-branches="updatedParentBranches"
        @toggle-folder="$emit('toggle-folder', $event)"
        @open-lang="$emit('open-lang', $event)"
      />
    </template>
  </template>
  <template v-else>
    <!-- File row -->
    <tr class="hover:bg-white/5 transition-colors align-top">
      <td class="px-4 py-3">
        <div class="flex items-center text-white font-medium text-sm">
          <div class="flex items-center font-mono text-white/40 mr-2" style="min-width: fit-content;">
            <span v-html="treePrefix"></span>
          </div>
          <button @click="toggle()" class="flex items-center justify-center w-4 h-4 hover:bg-white/20 rounded transition-colors mr-2">
            <span class="text-xs">{{ expanded ? '▼' : '▶' }}</span>
          </button>
          <span class="text-blue-300 mr-2">📄</span>
          <span>{{ node.name }}</span>
        </div>
      </td>
      <td v-for="lang in langs" :key="'h-'+node.id+'-'+lang" class="px-4 py-3 text-sm">
        <span :class="fileLangComplete(lang) ? 'text-green-400' : 'text-red-400'">{{ fileLangComplete(lang) ? '✅' : '❌' }}</span>
      </td>
      <td class="px-4 py-3 text-left">
        <div class="flex items-center gap-2">
          <button v-for="lang in langs" :key="'e-'+node.id+'-'+lang" @click="$emit('open-lang', { path, lang })" class="px-2 py-0.5 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/10">Edit {{ lang.toUpperCase() }}</button>
        </div>
      </td>
    </tr>
    <!-- Keys (expanded) -->
    <template v-if="expanded">
      <tr v-for="(key, index) in keys" :key="node.id+':'+key" class="hover:bg-white/5 transition-colors align-top">
        <td class="px-4 py-2">
          <div class="flex items-center text-white/80 text-sm">
            <div class="flex items-center font-mono text-white/40 mr-2" style="min-width: fit-content;">
              <span v-html="keyTreePrefix(index, keys.length)"></span>
            </div>
            <span class="text-purple-300 mr-2">🔑</span>
            <span>{{ key }}</span>
          </div>
        </td>
        <td v-for="lang in langs" :key="'c-'+node.id+'-'+key+'-'+lang" class="px-4 py-2 text-sm">
          <span :title="val(key, lang)" :class="val(key, lang) ? 'text-green-400' : 'text-red-400'">{{ val(key, lang) ? '✅' : '❌' }}</span>
        </td>
        <td class="px-4 py-2"></td>
      </tr>
    </template>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface FileNode {
  id: string;
  name: string;
  type: 'file';
  module: any; // generated scope module
  path: string; // rel path like ui/menus/main or ''
}
interface FolderNode {
  id: string;
  name: string;
  type: 'folder';
  isExpanded?: boolean;
  children?: Array<FileNode | FolderNode>;
}
type Node = FileNode | FolderNode;

interface Props {
  node: Node; 
  langs: string[]; 
  depth: number;
  isLast?: boolean;
  parentBranches?: boolean[];
}

const props = withDefaults(defineProps<Props>(), {
  isLast: false,
  parentBranches: () => []
});
defineEmits<{ 'toggle-folder': [id: string]; 'open-lang': [{ path: string; lang: string }] }>();

const expanded = ref(false);

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

const isFile = computed(() => props.node.type === 'file');
const moduleObj = computed(() => (isFile.value ? (props.node as FileNode).module : null));
const path = computed(() => (isFile.value ? (props.node as FileNode).path : ''));

const keys = computed(() => {
  const m = moduleObj.value || {};
  return Object.keys(m).filter((k) => k !== '__path');
});

function val(key: string, lang: string): string {
  const m = moduleObj.value || {};
  const entry = m[key] || {};
  const v = entry[lang];
  return typeof v === 'string' ? v : '';
}

function fileLangComplete(lang: string): boolean {
  return keys.value.every((k) => {
    const v = val(k, lang);
    return v && v.trim().length > 0;
  });
}

function folderLangComplete(lang: string): boolean {
  if (props.node.type !== 'folder') return false;
  
  const folderNode = props.node as FolderNode;
  if (!folderNode.children || folderNode.children.length === 0) return true;
  
  // Recursively check all children
  return folderNode.children.every(child => {
    if (child.type === 'file') {
      // Check if this file has all keys complete for this language
      const fileModule = (child as FileNode).module || {};
      const fileKeys = Object.keys(fileModule).filter(k => k !== '__path');
      return fileKeys.every(key => {
        const entry = fileModule[key] || {};
        const value = entry[lang];
        return typeof value === 'string' && value.trim().length > 0;
      });
    } else {
      // Recursively check subfolder
      return checkFolderRecursive(child as FolderNode, lang);
    }
  });
}

function checkFolderRecursive(folder: FolderNode, lang: string): boolean {
  if (!folder.children || folder.children.length === 0) return true;
  
  return folder.children.every(child => {
    if (child.type === 'file') {
      const fileModule = (child as FileNode).module || {};
      const fileKeys = Object.keys(fileModule).filter(k => k !== '__path');
      return fileKeys.every(key => {
        const entry = fileModule[key] || {};
        const value = entry[lang];
        return typeof value === 'string' && value.trim().length > 0;
      });
    } else {
      return checkFolderRecursive(child as FolderNode, lang);
    }
  });
}

function toggle() {
  expanded.value = !expanded.value;
}

function keyTreePrefix(index: number, totalKeys: number): string {
  // Generate tree prefix for keys under this file
  let prefix = treePrefix.value;
  
  // Replace the file connector with continuation lines
  prefix = prefix.replace(/[├└]/g, '│').replace(/─/g, '&nbsp;');
  
  // Add spacing if at root level
  if (props.depth === 0) {
    prefix = '&nbsp;&nbsp;&nbsp;&nbsp;';
  }
  
  // Add the key connector
  if (index === totalKeys - 1) {
    prefix += '└──';
  } else {
    prefix += '├──';
  }
  
  return prefix;
}
</script>

