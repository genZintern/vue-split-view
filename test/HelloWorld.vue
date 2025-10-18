<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const msg = ref("Hello World");
</script>

<style scoped>
.hello { text-align: center; }
</style>
