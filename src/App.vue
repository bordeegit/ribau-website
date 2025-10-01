<template>
  <div id="app">
    <h1>Hello from Vue + Vite 🚀</h1>
    <p>Clicked {{ count }} times</p>
    <button @click="count++">Click me</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<style>
#app { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding: 2rem; }
button { padding: .5rem 1rem; cursor: pointer; }
</style>
