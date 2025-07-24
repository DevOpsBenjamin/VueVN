<template>
  <div class="p-2 bg-gray-800 text-xs text-gray-200 h-full overflow-auto">
    <pre>{{ state }}</pre>
  </div>
</template>

<script setup>
const state = {
  player: {
    name: 'Player1',
    money: 100,
    inventory: [],
  },
  location: 'bedroom',
};
</script>
