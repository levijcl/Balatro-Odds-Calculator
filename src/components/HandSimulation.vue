<script setup>
import HandProbabilities from './HandProbabilities.vue'

const baseUrl = import.meta.env.BASE_URL

const props = defineProps({
  handCards: { type: Array, required: true },
  selectedToPlayIds: { type: Set, required: true },
  probabilities: { type: Object, required: true },
  drawCount: { type: Number, required: true },
  handSize: { type: Number, default: 8 },
})

defineEmits(['toggle-play', 'remove-card', 'draw-random', 'clear-hand'])

function emptySlots() {
  return Math.max(0, props.handSize - props.handCards.length)
}
</script>

<template>
  <div class="hand-simulation">
    <div class="hand-header">
      <span class="hand-title">Hand</span>
      <span class="hand-info">
        {{ handCards.length }} / {{ handSize }} cards
        <template v-if="drawCount > 0">
          &middot; Playing {{ drawCount }} / 5
        </template>
      </span>
      <div class="hand-actions">
        <button class="hand-btn" @click="$emit('draw-random')">
          {{ handCards.length === 0 ? 'Draw Hand' : 'Fill' }}
        </button>
        <button
          v-if="handCards.length > 0"
          class="hand-btn btn-danger"
          @click="$emit('clear-hand')"
        >
          Clear
        </button>
      </div>
    </div>

    <HandProbabilities :probabilities="probabilities" />
    <div class="hand-cards">
      <button
        v-for="card in handCards"
        :key="card.id"
        class="hand-card"
        :class="{ 'selected-to-play': selectedToPlayIds.has(card.id) }"
        :aria-label="`${card.rank} of ${card.suit}${selectedToPlayIds.has(card.id) ? ' (selected to play)' : ''}`"
        @click="$emit('toggle-play', card.id)"
      >
        <img
          :src="`${baseUrl}${card.image}`"
          :alt="`${card.rank} of ${card.suit}`"
          draggable="false"
        />
        <button
          class="remove-btn"
          aria-label="Remove from hand"
          @click.stop="$emit('remove-card', card.id)"
        >
          &times;
        </button>
      </button>
      <div
        v-for="i in emptySlots()"
        :key="'empty-' + i"
        class="hand-card empty-slot"
      >
        <span class="plus">+</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hand-simulation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 700px;
  background: var(--bg-surface);
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 16px;
  box-sizing: border-box;
}

.hand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.hand-title {
  font-weight: 700;
  color: var(--text-h);
  font-size: 18px;
}

.hand-info {
  font-size: 16px;
  color: var(--text);
}

.hand-actions {
  display: flex;
  gap: 8px;
}

.hand-btn {
  font-family: var(--sans);
  font-size: 16px;
  padding: 4px 14px;
  border-radius: 6px;
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

  &.btn-danger {
    color: var(--red);
    background: rgba(253, 95, 85, 0.15);

    &:hover {
      border-color: rgba(253, 95, 85, 0.5);
    }

    &:focus-visible {
      outline-color: var(--red);
    }
  }
}

.hand-cards {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.hand-card {
  position: relative;
  width: 70px;
  box-sizing: border-box;
  background: none;
  border: 2px solid var(--border);
  border-radius: 6px;
  padding: 0;
  margin-top: 8px;
  cursor: pointer;
  transition:
    transform 0.15s,
    border-color 0.2s,
    box-shadow 0.2s,
    margin 0.15s;

  img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 4px;
  }

  &:hover {
    border-color: var(--accent-border);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &.selected-to-play {
    border-color: var(--orange);
    margin-top: 0;
    margin-bottom: 8px;
    box-shadow: 0 4px 12px rgba(253, 162, 0, 0.3);
  }

  @media (max-width: 600px) {
    width: 55px;
  }
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--red);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: opacity 0.15s;

  @media (hover: hover) {
    opacity: 0;

    .hand-card:hover & {
      opacity: 1;
    }
  }
}

.empty-slot {
  aspect-ratio: 876 / 1164;
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  cursor: default;
}

.plus {
  color: var(--text);
  font-size: 24px;
  opacity: 0.4;
}
</style>
