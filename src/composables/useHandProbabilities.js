import { ref, watch, toValue } from 'vue'
import { calculateProbabilities } from '../utils/handProbabilities.js'

export function useHandProbabilities(cardPool, drawCount = 8) {
  const probabilities = ref({})

  watch(
    () => [toValue(cardPool), toValue(drawCount)],
    ([cards, count]) => {
      probabilities.value = calculateProbabilities(cards, count)
    },
    { immediate: true }
  )

  return { probabilities }
}
