<script setup>
import { CARDS } from './data/cards.js'
import { useDeck } from './composables/useDeck.js'
import { useHandProbabilities } from './composables/useHandProbabilities.js'
import DeckGrid from './components/DeckGrid.vue'
import HandProbabilities from './components/HandProbabilities.vue'

const { excludedIds, toggleCard, resetDeck, activeCards, activeCount } =
  useDeck()
const { probabilities } = useHandProbabilities(activeCards)
</script>

<template>
  <div id="center">
    <p>Deck: {{ activeCount }} / 52 cards</p>
    <button class="counter" @click="resetDeck">Reset Deck</button>
    <HandProbabilities :probabilities="probabilities" />
    <DeckGrid
      :cards="CARDS"
      :excluded-ids="excludedIds"
      @toggle-card="toggleCard"
    />
  </div>
</template>

<style scoped>
#center {
  display: flex;
  flex-direction: column;
  gap: 16px;
  place-items: center;
  flex-grow: 1;
  padding: 0 16px 32px;

  @media (max-width: 1024px) {
    padding: 0 12px 24px;
    gap: 12px;
  }
}

.counter {
  font-family: var(--sans);
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.3s;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}
</style>
