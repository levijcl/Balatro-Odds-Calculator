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
      <span class="hand-prob" :class="{ zero: !probabilities[hand.key] }">{{
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
  background: var(--bg-surface);
  border-radius: 8px;
  padding: 8px 0;
  border: 1px solid var(--border);
}

.hand-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 16px;
}

.hand-label {
  color: var(--orange);
  font-size: 16px;
  font-weight: 600;
}

.hand-prob {
  color: var(--green);
  font-size: 16px;
  font-weight: 500;
  min-width: 70px;
  text-align: right;

  &.zero {
    color: var(--border);
  }
}
</style>
