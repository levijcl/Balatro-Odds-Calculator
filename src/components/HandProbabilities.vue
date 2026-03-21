<script setup>
import { HAND_TYPES } from '../data/handTypes.js'

defineProps({
  probabilities: { type: Object, required: true },
})

function formatPercent(val) {
  if (val == null || val === 0) return '0%'
  if (val >= 1) return '100%'
  if (val < 0.0001) return '< 0.01%'
  return (val * 100).toFixed(2) + '%'
}
</script>

<template>
  <div class="hand-probabilities">
    <div v-for="hand in HAND_TYPES" :key="hand.key" class="hand-row">
      <span class="hand-label">{{ hand.label }}</span>
      <span class="hand-prob">{{
        formatPercent(probabilities[hand.key])
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.hand-probabilities {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  gap: 2px;
}

.hand-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.hand-label {
  color: var(--text-h);
  font-size: 14px;
}

.hand-prob {
  font-family: 'Courier New', Courier, monospace;
  color: var(--accent);
  font-size: 14px;
  min-width: 70px;
  text-align: right;
}
</style>
