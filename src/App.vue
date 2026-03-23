<script setup>
import { ref, watch, toValue } from 'vue'
import { CARDS } from './data/cards.js'
import { useDeck } from './composables/useDeck.js'
import { useHandSimulation } from './composables/useHandSimulation.js'
import { calculateHandSimProbabilities } from './utils/handSimProbabilities.js'
import DeckGrid from './components/DeckGrid.vue'
import HandSimulation from './components/HandSimulation.vue'

const { excludedIds, toggleCard, resetDeck, activeCards, activeCount } =
  useDeck()

const {
  handCardIds,
  selectedToPlayIds,
  handCards,
  fixedCards,
  drawPool,
  drawCount,
  isHandFull,
  addToHand,
  removeFromHand,
  togglePlaySelection,
  drawRandomHand,
  clearHand,
} = useHandSimulation(activeCards)

// Hand simulation probabilities
const handSimProbabilities = ref({})
watch(
  () => [toValue(fixedCards), toValue(drawPool), toValue(drawCount)],
  ([fixed, pool, count]) => {
    if (count === 0) {
      handSimProbabilities.value = {}
      return
    }
    handSimProbabilities.value = calculateHandSimProbabilities(
      fixed,
      pool,
      count
    )
  },
  { immediate: true }
)

function handleDeckCardClick(cardId) {
  // Card in hand → remove from hand
  if (handCardIds.has(cardId)) {
    removeFromHand(cardId)
    return
  }
  // Hand not full + card is active → add to hand
  if (!isHandFull.value && !excludedIds.has(cardId)) {
    addToHand(cardId)
    return
  }
  // Otherwise → normal toggle
  toggleCard(cardId)
}
</script>

<template>
  <div id="center">
    <h1>Balatro Odds Calculator</h1>
    <p class="deck-info">
      Deck: <span class="deck-count">{{ activeCount }}</span> / 52 cards
    </p>
    <button class="counter" @click="resetDeck">Reset Deck</button>
    <HandSimulation
      :hand-cards="handCards"
      :selected-to-play-ids="selectedToPlayIds"
      :probabilities="handSimProbabilities"
      :draw-count="drawCount"
      @toggle-play="togglePlaySelection"
      @remove-card="removeFromHand"
      @draw-random="drawRandomHand"
      @clear-hand="clearHand"
    />
    <DeckGrid
      :cards="CARDS"
      :excluded-ids="excludedIds"
      :hand-card-ids="handCardIds"
      @toggle-card="handleDeckCardClick"
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

.deck-info {
  font-size: 18px;
  color: var(--text);
}

.deck-count {
  color: var(--orange);
  font-weight: 700;
}

.counter {
  font-family: var(--sans);
  font-size: 16px;
  padding: 5px 14px;
  border-radius: 6px;
  color: var(--red);
  background: rgba(253, 95, 85, 0.15);
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.3s;

  &:hover {
    border-color: rgba(253, 95, 85, 0.5);
  }
  &:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 2px;
  }
}
</style>
