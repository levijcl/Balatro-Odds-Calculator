<script setup>
import { computed } from 'vue'
import CardItem from './CardItem.vue'
import { SUITS } from '../data/cards.js'

const props = defineProps({
  cards: { type: Array, required: true },
  excludedIds: { type: Set, required: true },
  handCardIds: { type: Set, default: () => new Set() },
})

defineEmits(['toggle-card'])

const cardsBySuit = computed(() =>
  SUITS.map((suit) => ({
    suit,
    cards: props.cards.filter((c) => c.suit === suit).reverse(),
  }))
)
</script>

<template>
  <div class="deck-grid">
    <div v-for="group in cardsBySuit" :key="group.suit" class="suit-row">
      <CardItem
        v-for="card in group.cards"
        :key="card.id"
        :card="card"
        :excluded="excludedIds.has(card.id)"
        :in-hand="handCardIds.has(card.id)"
        @toggle="$emit('toggle-card', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.deck-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.suit-row {
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 4px;
}

@media (max-width: 600px) {
  .suit-row {
    grid-template-columns: repeat(7, 1fr);
  }
}
</style>
