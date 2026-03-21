import { RANKS } from '../data/cards.js'
import { comb } from './combinations.js'

export const RANK_INDEX = Object.fromEntries(RANKS.map((r, i) => [r, i]))

/**
 * Build rank counts: how many active cards per rank.
 * Returns array of length 13 (index 0 = '2', index 12 = 'A').
 */
export function getRankCounts(cards) {
  const counts = new Array(13).fill(0)
  for (const c of cards) {
    counts[RANK_INDEX[c.rank]]++
  }
  return counts
}

/**
 * Build suit counts: how many active cards per suit.
 * Returns object { hearts: n, clubs: n, diamonds: n, spades: n }.
 */
export function getSuitCounts(cards) {
  const counts = {}
  for (const c of cards) {
    counts[c.suit] = (counts[c.suit] || 0) + 1
  }
  return counts
}

/**
 * Build suit-rank counts: how many active cards per (suit, rank) pair.
 * Returns Map<string, number> keyed by "suit:rankIndex".
 */
export function getSuitRankCounts(cards) {
  const counts = new Map()
  for (const c of cards) {
    const key = `${c.suit}:${RANK_INDEX[c.rank]}`
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}

// ─── A. Rank-multiplicity DP ─────────────────────────────────────────────────
// Computes: Pair, Two Pair, 3oaK, Full House, 4oaK, 5oaK
//
// State: dp[j][ge2][ge3][ge4][ge5]
//   j: cards selected (0..h)
//   ge2: min(ranks with 2+ cards, 2)  → 0,1,2
//   ge3: min(ranks with 3+ cards, 1)  → 0,1
//   ge4: min(ranks with 4+ cards, 1)  → 0,1
//   ge5: min(ranks with 5+ cards, 1)  → 0,1

function computeRankMultiplicityDP(rankCounts, h) {
  const maxJ = h
  // dp[j][ge2][ge3][ge4][ge5]
  // Dimensions: (h+1) x 3 x 2 x 2 x 2
  const create = () => {
    const dp = new Array(maxJ + 1)
    for (let j = 0; j <= maxJ; j++) {
      dp[j] = new Array(3)
      for (let a = 0; a < 3; a++) {
        dp[j][a] = new Array(2)
        for (let b = 0; b < 2; b++) {
          dp[j][a][b] = new Array(2)
          for (let c = 0; c < 2; c++) {
            dp[j][a][b][c] = new Float64Array(2)
          }
        }
      }
    }
    return dp
  }

  let dp = create()
  dp[0][0][0][0][0] = 1

  for (let r = 0; r < 13; r++) {
    const cr = rankCounts[r]
    if (cr === 0) continue // skip ranks with no active cards (no state change)

    const next = create()

    for (let j = 0; j <= maxJ; j++) {
      for (let ge2 = 0; ge2 < 3; ge2++) {
        for (let ge3 = 0; ge3 < 2; ge3++) {
          for (let ge4 = 0; ge4 < 2; ge4++) {
            for (let ge5 = 0; ge5 < 2; ge5++) {
              const val = dp[j][ge2][ge3][ge4][ge5]
              if (val === 0) continue

              // Try taking k cards from this rank
              const maxK = Math.min(cr, maxJ - j)
              for (let k = 0; k <= maxK; k++) {
                const ways = comb(cr, k)
                const nj = j + k
                const nge2 = Math.min(ge2 + (k >= 2 ? 1 : 0), 2)
                const nge3 = Math.min(ge3 + (k >= 3 ? 1 : 0), 1)
                const nge4 = Math.min(ge4 + (k >= 4 ? 1 : 0), 1)
                const nge5 = Math.min(ge5 + (k >= 5 ? 1 : 0), 1)
                next[nj][nge2][nge3][nge4][nge5] += val * ways
              }
            }
          }
        }
      }
    }

    dp = next
  }

  // Extract counts for h cards
  const results = {
    pair: 0,
    twoPair: 0,
    threeOfAKind: 0,
    fullHouse: 0,
    fourOfAKind: 0,
    fiveOfAKind: 0,
  }

  for (let ge2 = 0; ge2 < 3; ge2++) {
    for (let ge3 = 0; ge3 < 2; ge3++) {
      for (let ge4 = 0; ge4 < 2; ge4++) {
        for (let ge5 = 0; ge5 < 2; ge5++) {
          const val = dp[h][ge2][ge3][ge4][ge5]
          if (val === 0) continue
          if (ge2 >= 1) results.pair += val
          if (ge2 >= 2) results.twoPair += val
          if (ge3 >= 1) results.threeOfAKind += val
          if (ge3 >= 1 && ge2 >= 2) results.fullHouse += val
          if (ge4 >= 1) results.fourOfAKind += val
          if (ge5 >= 1) results.fiveOfAKind += val
        }
      }
    }
  }

  return results
}

// ─── B. Flush (suit summation) ───────────────────────────────────────────────

function computeFlush(suitCounts, n, h) {
  let count = 0
  for (const suit in suitCounts) {
    const cs = suitCounts[suit]
    for (let k = 5; k <= Math.min(h, cs); k++) {
      count += comb(cs, k) * comb(n - cs, h - k)
    }
  }
  return count
}

// ─── C. Straight DP ──────────────────────────────────────────────────────────
//
// Process ranks 2..A (indices 0..12).
// State: dp[j][run][found][lowRun]
//   j: cards selected (0..h)
//   run: current consecutive streak (0..4, once hits 5 → found)
//   found: whether a straight exists (0,1)
//   lowRun: consecutive run from rank index 0 (0..4, for ace-low)

function computeStraight(rankCounts, n, h) {
  const maxJ = h
  // dp[j][run][found][lowRun]
  // Dimensions: (h+1) x 5 x 2 x 5
  const create = () => {
    const dp = new Array(maxJ + 1)
    for (let j = 0; j <= maxJ; j++) {
      dp[j] = new Array(5)
      for (let r = 0; r < 5; r++) {
        dp[j][r] = new Array(2)
        for (let f = 0; f < 2; f++) {
          dp[j][r][f] = new Float64Array(5)
        }
      }
    }
    return dp
  }

  let dp = create()
  dp[0][0][0][0] = 1

  for (let rankIdx = 0; rankIdx < 13; rankIdx++) {
    const cr = rankCounts[rankIdx]
    const next = create()

    for (let j = 0; j <= maxJ; j++) {
      for (let run = 0; run < 5; run++) {
        for (let found = 0; found < 2; found++) {
          for (let lowRun = 0; lowRun < 5; lowRun++) {
            const val = dp[j][run][found][lowRun]
            if (val === 0) continue

            const maxK = Math.min(cr, maxJ - j)
            for (let k = 0; k <= maxK; k++) {
              const ways = comb(cr, k)
              const nj = j + k

              let nRun, nFound, nLowRun

              if (k === 0) {
                nRun = 0
                nFound = found
                nLowRun = lowRun
              } else {
                nRun = run + 1
                nFound = found
                nLowRun = lowRun

                // Update lowRun: only grows while consecutive from rank 0
                if (rankIdx <= 3 && lowRun === rankIdx) {
                  nLowRun = rankIdx + 1
                }

                // Check standard straight (5 consecutive)
                if (nRun >= 5) {
                  nFound = 1
                  nRun = 4 // cap to avoid exceeding state bounds
                }

                // Check ace-low straight: Ace (index 12) + 2,3,4,5 (lowRun=4)
                if (rankIdx === 12 && nLowRun === 4) {
                  nFound = 1
                }
              }

              // Clamp states
              nRun = Math.min(nRun, 4)
              nLowRun = Math.min(nLowRun, 4)

              next[nj][nRun][nFound][nLowRun] += val * ways
            }
          }
        }
      }
    }

    dp = next
  }

  // Sum all states where found=1 and j=h
  let count = 0
  for (let run = 0; run < 5; run++) {
    for (let lowRun = 0; lowRun < 5; lowRun++) {
      count += dp[h][run][1][lowRun]
    }
  }
  return count
}

// ─── D. Straight Flush & Royal Flush (enumeration + IE) ──────────────────────

function computeStraightFlushAndRoyal(cards, n, h) {
  const suitRankCounts = getSuitRankCounts(cards)
  const suits = [...new Set(cards.map((c) => c.suit))]

  // All possible straight flush cores: for each suit, runs of 5 consecutive ranks
  // Run starting indices: 0(2-6), 1(3-7), ..., 8(10-A)
  // Plus ace-low: ranks [12,0,1,2,3] = A,2,3,4,5
  const allRuns = []
  for (let start = 0; start <= 8; start++) {
    allRuns.push([start, start + 1, start + 2, start + 3, start + 4])
  }
  // Ace-low: A(12), 2(0), 3(1), 4(2), 5(3)
  allRuns.push([12, 0, 1, 2, 3])

  // Build cores per suit
  const coresBySuit = {}
  for (const suit of suits) {
    const cores = []
    for (const run of allRuns) {
      // Check all 5 cards exist in active deck
      let valid = true
      for (const ri of run) {
        const cnt = suitRankCounts.get(`${suit}:${ri}`) || 0
        if (cnt === 0) {
          valid = false
          break
        }
      }
      if (valid) {
        cores.push({ ranks: run, suit })
      }
    }
    if (cores.length > 0) {
      coresBySuit[suit] = cores
    }
  }

  // For each suit, use inclusion-exclusion over its cores
  let sfCount = 0
  let rfCount = 0

  for (const suit in coresBySuit) {
    const cores = coresBySuit[suit]

    // Inclusion-exclusion: iterate over all non-empty subsets
    const numCores = cores.length
    for (let mask = 1; mask < 1 << numCores; mask++) {
      // Compute union of rank indices for this subset
      const unionRanks = new Set()
      let isRoyal = false
      let allRoyal = true

      for (let i = 0; i < numCores; i++) {
        if (mask & (1 << i)) {
          for (const ri of cores[i].ranks) {
            unionRanks.add(ri)
          }
          // Check if this core is a royal flush (ranks 8,9,10,11,12 = 10,J,Q,K,A)
          const isThisCoreRoyal =
            cores[i].ranks.includes(8) &&
            cores[i].ranks.includes(9) &&
            cores[i].ranks.includes(10) &&
            cores[i].ranks.includes(11) &&
            cores[i].ranks.includes(12)
          if (isThisCoreRoyal) isRoyal = true
          else allRoyal = false
        }
      }

      const unionSize = unionRanks.size
      if (unionSize > h) continue // can't fit in hand

      // Each rank in the union contributes exactly 1 card (specific suit)
      // Remaining h - unionSize cards from the other N - unionSize cards
      const ways = comb(n - unionSize, h - unionSize)

      // Count bits for inclusion-exclusion sign
      const bits = popcount(mask)
      const sign = bits % 2 === 1 ? 1 : -1

      sfCount += sign * ways

      // Royal flush: only count subsets where ALL included cores are royal
      if (isRoyal && allRoyal) {
        rfCount += sign * ways
      }
    }
  }

  return {
    straightFlush: Math.max(0, sfCount),
    royalFlush: Math.max(0, rfCount),
  }
}

function popcount(x) {
  let count = 0
  while (x) {
    count += x & 1
    x >>= 1
  }
  return count
}

// ─── E. Flush House & Flush Five ─────────────────────────────────────────────

function computeFlushHouseAndFlushFive(cards, n, h) {
  const suitRankCounts = getSuitRankCounts(cards)

  let flushFiveCount = 0
  let flushHouseCount = 0

  // Group by suit
  const suits = [...new Set(cards.map((c) => c.suit))]
  for (const suit of suits) {
    // Get rank counts for this suit
    const rankCountsInSuit = []
    for (let ri = 0; ri < 13; ri++) {
      const cnt = suitRankCounts.get(`${suit}:${ri}`) || 0
      if (cnt > 0) rankCountsInSuit.push({ ri, cnt })
    }

    // Flush Five: 5 cards of same rank and same suit
    for (const { cnt } of rankCountsInSuit) {
      if (cnt >= 5) {
        flushFiveCount += comb(cnt, 5) * comb(n - 5, h - 5)
      }
    }

    // Flush House: 3 of rank A + 2 of rank B, all same suit
    for (let i = 0; i < rankCountsInSuit.length; i++) {
      for (let j = 0; j < rankCountsInSuit.length; j++) {
        if (i === j) continue
        const cntA = rankCountsInSuit[i].cnt
        const cntB = rankCountsInSuit[j].cnt
        if (cntA >= 3 && cntB >= 2) {
          flushHouseCount += comb(cntA, 3) * comb(cntB, 2) * comb(n - 5, h - 5)
        }
      }
    }
  }

  return {
    flushFive: flushFiveCount,
    flushHouse: flushHouseCount,
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function calculateProbabilities(activeCards, handSize = 8) {
  const n = activeCards.length
  const total = comb(n, handSize)

  // Default: all zeros
  const probs = {
    highCard: 0,
    pair: 0,
    twoPair: 0,
    threeOfAKind: 0,
    straight: 0,
    flush: 0,
    fullHouse: 0,
    fourOfAKind: 0,
    straightFlush: 0,
    royalFlush: 0,
    fiveOfAKind: 0,
    flushHouse: 0,
    flushFive: 0,
  }

  if (n < handSize || total === 0) return probs

  // High Card: always 100%
  probs.highCard = 1

  const rankCounts = getRankCounts(activeCards)
  const suitCounts = getSuitCounts(activeCards)

  // A. Rank-multiplicity DP
  const rankResults = computeRankMultiplicityDP(rankCounts, handSize)
  probs.pair = rankResults.pair / total
  probs.twoPair = rankResults.twoPair / total
  probs.threeOfAKind = rankResults.threeOfAKind / total
  probs.fullHouse = rankResults.fullHouse / total
  probs.fourOfAKind = rankResults.fourOfAKind / total
  probs.fiveOfAKind = rankResults.fiveOfAKind / total

  // B. Flush
  probs.flush = computeFlush(suitCounts, n, handSize) / total

  // C. Straight
  probs.straight = computeStraight(rankCounts, n, handSize) / total

  // D. Straight Flush & Royal Flush
  const sfResults = computeStraightFlushAndRoyal(activeCards, n, handSize)
  probs.straightFlush = sfResults.straightFlush / total
  probs.royalFlush = sfResults.royalFlush / total

  // E. Flush House & Flush Five
  const fhResults = computeFlushHouseAndFlushFive(activeCards, n, handSize)
  probs.flushHouse = fhResults.flushHouse / total
  probs.flushFive = fhResults.flushFive / total

  return probs
}
