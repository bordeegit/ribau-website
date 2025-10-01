<template>
  <div id="app">
    <h1>Viva i cani (specialmente lobo) 🐶</h1>
    <p>CLicca se ami i cani -> {{ count }} </p>
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
