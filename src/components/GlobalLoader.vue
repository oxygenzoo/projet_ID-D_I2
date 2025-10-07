<template>
  <div v-if="globalState.loading" class="loader-overlay">
    <div class="spinner"></div>
  </div>
</template>

<script setup>
import { globalState } from '@/store/useGlobal.js'
</script>

<style scoped>
.loader-overlay {
  position: fixed; inset: 0; background: rgba(255,255,255,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.spinner {
  width: 40px; height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
