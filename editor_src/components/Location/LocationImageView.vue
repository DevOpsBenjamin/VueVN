<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-white text-lg font-semibold flex items-center">
        <span class="mr-2">🖼️</span>
        Images
        <span class="ml-3 text-xs text-white/50">Location: {{ selectedLocation }}</span>
      </h2>
      <div class="flex items-center gap-2">
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onPickFiles">
        <button @click="fileInput?.click()" class="flex items-center space-x-2 px-3 py-1 bg-purple-600/30 hover:bg-purple-600/40 rounded border border-white/20 text-white text-sm">
          <span>➕</span><span>Upload</span>
        </button>
        <button @click="refresh" class="px-3 py-1 bg-white/10 hover:bg-white/20 rounded border border-white/10 text-sm">Refresh</button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-9">
        <div class="flex items-center justify-between mb-2 text-sm text-white/70">
          <div class="flex items-center gap-2">
            <button class="hover:underline text-white/50" @click="cd('')">/{{ rootDir }}</button>
            <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
              <span>/</span>
              <button class="hover:underline" @click="cd(breadcrumbs.slice(0, idx+1).join('/'))">{{ crumb }}</button>
            </template>
          </div>
          <div class="flex items-center gap-2">
            <button @click="up()" :disabled="!subDir" :class="['px-2 py-0.5 rounded border text-xs', subDir ? 'bg-white/10 hover:bg-white/20 border-white/10' : 'bg-white/5 text-white/40 border-white/5 cursor-not-allowed']">Up</button>
            <button @click="mkdir" class="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded border border-white/10">New Folder</button>
          </div>
        </div>
        <div class="border-2 border-dashed border-white/10 rounded-lg p-4 min-h-[50vh]"
             @dragover.prevent
             @drop.prevent="onDrop">
          <div v-if="loading" class="text-sm text-white/60">Loading...</div>
          <div v-else class="grid grid-cols-6 gap-3">
            <!-- directories -->
            <div v-for="d in dirs" :key="d.path" class="border border-white/10 rounded p-2 hover:bg-white/5 cursor-pointer" @click="cd(relFromImages(d.path))">
              <div class="text-4xl mb-2">📁</div>
              <div class="text-xs text-white/80 truncate" :title="d.name">{{ d.name }}</div>
            </div>
            <div v-for="img in images" :key="img.path" class="group relative border border-white/10 rounded overflow-hidden cursor-pointer" @click="select(img)">
              <img :src="toRuntime(img.path)" class="w-full h-24 object-cover">
            </div>
            <div v-if="images.length===0 && dirs.length===0" class="text-white/60 text-sm">Empty folder. Drop files here to upload.</div>
          </div>
        </div>
      </div>
      <div class="col-span-3">
        <div class="p-4 border border-white/10 rounded bg-black/10" v-if="selected">
          <div class="flex items-center justify-between mb-1">
            <div class="text-sm font-semibold">Preview</div>
            <button @click="onDeleteSelected" class="px-2 py-0.5 text-xs bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/30">Delete</button>
          </div>
          <div class="text-xs text-white/60 break-all mb-2">{{ toRuntime(selected.path) }}</div>
          <img :src="toRuntime(selected.path)" class="w-full rounded border border-white/10 mb-3" />
          <div class="grid grid-cols-2 gap-2 text-sm items-center">
            <div class="text-white/60">Size</div>
            <div>{{ formatSize(selected.size) }}</div>
            <div class="text-white/60">Modified</div>
            <div>{{ formatDate(selected.modified) }}</div>
            <div class="text-white/60">Name</div>
            <div>
              <template v-if="editingName">
                <input v-model="nameInput" class="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm w-full" />
                <div class="flex items-center gap-2 mt-2">
                  <button @click="saveRename" class="px-2 py-0.5 text-xs bg-green-500/30 hover:bg-green-500/40 rounded border border-green-500/40">Save</button>
                  <button @click="cancelRename" class="px-2 py-0.5 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20">Cancel</button>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center justify-between gap-2">
                  <div class="truncate" :title="selected.name">{{ selected.name }}</div>
                  <button @click="startRename" class="px-2 py-0.5 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20">Edit</button>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div v-else class="text-white/60 text-sm p-4 border border-white/10 rounded bg-black/10">Select an image to preview</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useEditorState } from '@editor/stores/editorState';

type Asset = { name: string; path: string; size: number; modified: string };

const editorState = useEditorState();
const selectedLocation = computed(() => editorState.selectedLocation || 'global');
const images = reactive<Asset[]>([]);
const subDir = ref<string>(''); // relative under rootDir
const loading = ref(false);
const selected = ref<Asset | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const editingName = ref(false);
const nameInput = ref('');

function select(a: Asset) { selected.value = a; }

async function refresh() {
  loading.value = true;
  try {
    const base = rootDir.value;
    const path = subDir.value ? `${base}/${subDir.value}` : base;
    const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
    if (!res.ok) {
      // Auto-create default folder for selected location
      if (res.status === 404 && subDir.value) {
        await fetch('/api/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, type: 'directory' })
        });
        return refresh();
      }
      throw new Error('Failed to list');
    }
    const data = await res.json();
    const dirsData = (data as any[]).filter(i => i.type === 'directory');
    const files = (data as any[]).filter(i => i.type === 'file' && /\.(png|jpg|jpeg|gif|webp)$/i.test(i.name))
      .map(i => ({ name: i.name, path: i.path, size: i.size, modified: i.modified }));
    images.splice(0, images.length, ...files);
    dirs.splice(0, dirs.length, ...dirsData);
    if (selected.value) {
      const found = images.find(x => x.path === selected.value!.path);
      selected.value = found || null;
    }
  } finally {
    loading.value = false;
  }
}

function formatSize(n: number) {
  if (!n && n !== 0) return '-';
  const units = ['B','KB','MB','GB'];
  let i = 0; let v = n;
  while (v >= 1024 && i < units.length-1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${units[i]}`;
}
function formatDate(s: string) { try { return new Date(s).toLocaleString(); } catch { return s; } }

async function onPickFiles(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  await uploadFiles(input.files);
  input.value = '';
}
async function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;
  await uploadFiles(files);
}
async function uploadFiles(files: FileList | File[]) {
  for (const f of Array.from(files)) {
    const form = new FormData();
    form.append('file', f, f.name);
    if (subDir.value) form.append('dest', `${rootDir.value}/${subDir.value}`);
    else form.append('dest', rootDir.value);
    await fetch('/api/assets/upload', { method: 'POST', body: form });
  }
  await refresh();
}
async function remove(path: string) {
  if (!confirm('Delete this file?')) return;
  const res = await fetch(`/api/delete?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
  if (res.ok) await refresh();
}
async function onDeleteSelected() {
  if (!selected.value) return;
  await remove(selected.value.path);
  selected.value = null;
}
async function rename(oldPath: string) {
  const base = oldPath.split('/');
  const current = base[base.length-1];
  const next = prompt('New name', current);
  if (!next || next === current) return;
  const newPath = base.slice(0,-1).concat(next).join('/');
  const res = await fetch('/api/rename', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPath, newPath })
  });
  if (res.ok) await refresh();
}
function startRename() {
  if (!selected.value) return;
  nameInput.value = selected.value.name;
  editingName.value = true;
}
function cancelRename() { editingName.value = false; }
async function saveRename() {
  if (!selected.value) return;
  const baseParts = selected.value.path.split('/');
  baseParts.pop();
  const newPath = [...baseParts, nameInput.value].join('/');
  const res = await fetch('/api/rename', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPath: selected.value.path, newPath })
  });
  if (res.ok) {
    editingName.value = false;
    await refresh();
    // reselect the renamed item
    const found = images.find(x => x.path === newPath);
    if (found) selected.value = found;
  }
}
async function copy(path: string) {
  try { await navigator.clipboard.writeText(toRuntime(path)); } catch {}
}

function toRuntime(pathStr: string): string {
  const loc = selectedLocation.value;
  if (pathStr.startsWith(`locations/${loc}/`)) {
    return `/${pathStr.replace(/^locations\//, '')}`;
  }
  if (pathStr.startsWith('global/')) {
    return `/${pathStr}`;
  }
  return '/' + pathStr;
}

onMounted(refresh);

// Initialize default folder to selected location
onMounted(() => { refresh(); });

// Navigation helpers
const rootDir = computed(() => selectedLocation.value === 'global'
  ? 'global/images'
  : `locations/${selectedLocation.value}/images`);
const breadcrumbs = computed(() => (subDir.value ? subDir.value.split('/') : []));
const dirs = reactive<any[]>([]);
function relFromImages(p: string): string {
  const base = rootDir.value.replace(/\\/g, '/');
  const norm = p.replace(/\\/g, '/');
  return norm.startsWith(base + '/') ? norm.slice(base.length + 1) : norm === base ? '' : norm;
}
function cd(dir: string) { subDir.value = dir; refresh(); }
function up() {
  if (!subDir.value) return;
  const parts = subDir.value.split('/');
  parts.pop();
  subDir.value = parts.join('/');
  refresh();
}
async function mkdir() {
  const name = prompt('New folder name');
  if (!name) return;
  const base = rootDir.value;
  const path = subDir.value ? `${base}/${subDir.value}/${name}` : `${base}/${name}`;
  await fetch('/api/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, type: 'directory' })
  });
  await refresh();
}
</script>

<style scoped>
.min-h-\[50vh\] { min-height: 50vh; }
</style>
