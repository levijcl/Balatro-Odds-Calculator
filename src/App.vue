<script setup>
import { CARDS } from './data/cards.js'
import { useDeck } from './composables/useDeck.js'
import DeckGrid from './components/DeckGrid.vue'

const { excludedIds, toggleCard, resetDeck, activeCount } = useDeck()
</script>

<template>
  <div id="center">
    <p>Deck: {{ activeCount }} / 52 cards</p>
    <button class="counter" @click="resetDeck">Reset Deck</button>
    <DeckGrid
      :cards="CARDS"
      :excluded-ids="excludedIds"
      @toggle-card="toggleCard"
    />
  </div>
</template>
