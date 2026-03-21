<script setup>
const baseUrl = import.meta.env.BASE_URL

defineProps({
  card: { type: Object, required: true },
  excluded: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<template>
  <button
    class="card-item"
    :class="{ excluded }"
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
