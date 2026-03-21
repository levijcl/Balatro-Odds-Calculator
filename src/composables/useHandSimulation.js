import { reactive, computed, watch } from 'vue'
import { CARDS } from '../data/cards.js'

export function useHandSimulation(activeCards, handSize = 8) {
  const handCardIds = reactive(new Set())
  const selectedToPlayIds = reactive(new Set())

  const handCards = computed(() => CARDS.filter((c) => handCardIds.has(c.id)))

  const fixedCards = computed(() =>
    handCards.value.filter((c) => !selectedToPlayIds.has(c.id))
  )

  const drawPool = computed(() =>
    activeCards.value.filter((c) => !handCardIds.has(c.id))
  )

  const drawCount = computed(() => selectedToPlayIds.size)
  const isHandFull = computed(() => handCardIds.size >= handSize)
  const handExists = computed(() => handCardIds.size > 0)

  function addToHand(id) {
    if (handCardIds.size >= handSize) return
    handCardIds.add(id)
  }

  function removeFromHand(id) {
    handCardIds.delete(id)
    selectedToPlayIds.delete(id)
  }

  function togglePlaySelection(id) {
    if (!handCardIds.has(id)) return
    if (selectedToPlayIds.has(id)) {
      selectedToPlayIds.delete(id)
    } else {
      if (selectedToPlayIds.size >= 5) return
      selectedToPlayIds.add(id)
    }
  }

  function drawRandomHand() {
    const available = activeCards.value.filter((c) => !handCardIds.has(c.id))
    const needed = handSize - handCardIds.size
    // Fisher-Yates shuffle for unbiased sampling
    const arr = [...available]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    for (let i = 0; i < Math.min(needed, arr.length); i++) {
      handCardIds.add(arr[i].id)
    }
  }

  function clearHand() {
    handCardIds.clear()
    selectedToPlayIds.clear()
  }

  // If a card in hand gets excluded from deck, remove it from hand
  watch(activeCards, (newActive) => {
    const activeIdSet = new Set(newActive.map((c) => c.id))
    for (const id of handCardIds) {
      if (!activeIdSet.has(id)) {
        handCardIds.delete(id)
        selectedToPlayIds.delete(id)
      }
    }
  })

  return {
    handCardIds,
    selectedToPlayIds,
    handCards,
    fixedCards,
    drawPool,
    drawCount,
    isHandFull,
    handExists,
    addToHand,
    removeFromHand,
    togglePlaySelection,
    drawRandomHand,
    clearHand,
  }
}
