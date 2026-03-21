const SUITS = ['hearts', 'clubs', 'diamonds', 'spades']
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

const CARDS = SUITS.flatMap((suit, suitIndex) =>
  RANKS.map((rank, rankIndex) => {
    const id = suitIndex * 13 + rankIndex + 1
    return {
      id,
      suit,
      rank,
      image: `cards/8BitDeck${id}.png`,
    }
  })
)

export { SUITS, RANKS, CARDS }
