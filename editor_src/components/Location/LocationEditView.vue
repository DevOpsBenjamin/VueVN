<template>
  <div class="h-full flex flex-col bg-black/10">
    <div class="flex-1 overflow-y-auto">
      <div class="p-6 space-y-6">
        <!-- Dynamic Tab Content -->
        <section class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <LocationEventView v-if="editorState.activeLocationTab === 'events'" />
          <LocationActionView v-if="editorState.activeLocationTab === 'actions'" />
          <LocationImageView v-if="editorState.activeLocationTab === 'images'" />
          <LocationSoundView v-if="editorState.activeLocationTab === 'sounds'" />
          <LocationTextView v-if="editorState.activeLocationTab === 'texts'" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorState } from '@editor/stores/editorState';
import LocationEventView from './LocationEventView.vue';
import LocationActionView from './LocationActionView.vue';
import LocationImageView from './LocationImageView.vue';
import LocationSoundView from './LocationSoundView.vue';
import LocationTextView from './LocationTextView.vue';

const editorState = useEditorState();
</script>