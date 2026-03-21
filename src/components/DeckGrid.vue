<script setup>
import { computed } from 'vue'
import CardItem from './CardItem.vue'
import { SUITS } from '../data/cards.js'

const props = defineProps({
  cards: { type: Array, required: true },
  excludedIds: { type: Set, required: true },
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
        @toggle="$emit('toggle-card', $event)"
      />
    </div>
  </div>
</template>
