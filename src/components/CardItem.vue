<script setup>
const baseUrl = import.meta.env.BASE_URL

defineProps({
  card: { type: Object, required: true },
  excluded: { type: Boolean, default: false },
  inHand: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<template>
  <button
    class="card-item"
    :class="{ excluded, 'in-hand': inHand }"
    :aria-pressed="excluded"
    :aria-label="`${card.rank} of ${card.suit}`"
    @click="$emit('toggle', card.id)"
  >
    <img
      :src="`${baseUrl}${card.image}`"
      :alt="`${card.rank} of ${card.suit}`"
      draggable="false"
    />
  </button>
</template>

<style scoped>
.card-item {
  background: none;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
  transition:
    opacity 0.2s,
    filter 0.2s,
    transform 0.15s,
    border-color 0.2s;

  img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 4px;
  }

  &:hover {
    transform: scale(1.05);
    border-color: var(--accent-border);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &.excluded {
    opacity: 0.3;
    filter: grayscale(100%);

    &:hover {
      opacity: 0.5;
    }
  }

  &.in-hand {
    border-color: var(--accent);
    opacity: 0.85;

    &:hover {
      border-color: var(--accent-border);
    }
  }
}
</style>
