<template>
  <template v-if="node.type === 'folder'">
    <tr class="hover:bg-white/5 transition-colors">
      <td :class="['px-4 py-2', depthClass]">
        <div class="flex items-center gap-2 text-white font-medium text-sm">
          <button @click="$emit('toggle-folder', node.id)" class="flex items-center justify-center w-4 h-4 hover:bg-white/20 rounded">
            <span class="text-xs">{{ node.isExpanded ? '▼' : '▶' }}</span>
          </button>
          <span class="text-yellow-400">📁</span>
          <span>{{ node.name }}/</span>
        </div>
      </td>
      <td v-for="lang in langs" :key="'f-'+node.id+'-'+lang" class="px-4 py-2 text-sm text-white/50">—</td>
      <td class="px-4 py-2"></td>
    </tr>
    <template v-if="node.isExpanded && node.children">
      <TextTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :langs="langs"
        :depth="depth + 1"
        @toggle-folder="$emit('toggle-folder', $event)"
        @open-lang="$emit('open-lang', $event)"
      />
    </template>
  </template>
  <template v-else>
    <!-- File row -->
    <tr class="hover:bg-white/5 transition-colors align-top">
      <td :class="['px-4 py-3', depthClass]">
        <div class="text-white font-medium text-sm flex items-center gap-2">
          <span class="w-4"></span>
          <button @click="toggle()" class="w-4 h-4 text-xs hover:bg-white/20 rounded">{{ expanded ? '▼' : '▶' }}</button>
          <span class="text-blue-300">📄</span>
          <span>{{ node.name }}</span>
        </div>
        <div v-if="path" class="text-white/40 text-2xs" :style="{ marginLeft: depthOffset }">/{{ path }}</div>
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
      <tr v-for="key in keys" :key="node.id+':'+key" class="hover:bg-white/5 transition-colors align-top">
        <td :class="['px-4 py-2', depthClass]">
          <div class="text-white/80 text-sm" :style="{ marginLeft: '28px' }">• {{ key }}</div>
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

const props = defineProps<{ node: Node; langs: string[]; depth: number }>();
defineEmits<{ 'toggle-folder': [id: string]; 'open-lang': [{ path: string; lang: string }] }>();

const expanded = ref(false);
const depthOffset = computed(() => `${props.depth * 20 + 20}px`);
const depthClass = computed(() => (props.depth > 0 ? `pl-${Math.min(props.depth * 4 + 4, 20)}` : ''));

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

function toggle() {
  expanded.value = !expanded.value;
}
</script>

