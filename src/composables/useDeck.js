import { reactive, computed } from 'vue'
import { CARDS } from '../data/cards.js'

export function useDeck() {
  const excludedIds = reactive(new Set())

  function toggleCard(id) {
    if (excludedIds.has(id)) {
      excludedIds.delete(id)
    } else {
      excludedIds.add(id)
    }
  }

  function resetDeck() {
    excludedIds.clear()
  }

  const activeCards = computed(() =>
    CARDS.filter((card) => !excludedIds.has(card.id))
  )

  const activeCount = computed(() => activeCards.value.length)

  return { excludedIds, toggleCard, resetDeck, activeCards, activeCount }
}
