import { comb } from './combinations.js'
import {
  getRankCounts,
  getSuitCounts,
  getSuitRankCounts,
} from './handProbabilities.js'

// ─── A. Rank-multiplicity DP (with fixed cards) ────────────────────────────
// Computes: Pair, Two Pair, 3oaK, Full House, 4oaK, 5oaK
//
// Same structure as the deck version, but:
// - j tracks DRAWN cards (0..drawCount)
// - ge2/ge3/ge4/ge5 flags use totalInRank = fixedCount[r] + draw_r

function computeRankMultiplicityDPSim(
  fixedRankCounts,
  poolRankCounts,
  drawCount
) {
  const maxJ = drawCount
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
    const fr = fixedRankCounts[r]
    const pr = poolRankCounts[r]
    if (fr === 0 && pr === 0) continue

    const next = create()

    for (let j = 0; j <= maxJ; j++) {
      for (let ge2 = 0; ge2 < 3; ge2++) {
        for (let ge3 = 0; ge3 < 2; ge3++) {
          for (let ge4 = 0; ge4 < 2; ge4++) {
            for (let ge5 = 0; ge5 < 2; ge5++) {
              const val = dp[j][ge2][ge3][ge4][ge5]
              if (val === 0) continue

              const maxK = Math.min(pr, maxJ - j)
              for (let k = 0; k <= maxK; k++) {
                const ways = comb(pr, k)
                const nj = j + k
                const total = fr + k
                const nge2 = Math.min(ge2 + (total >= 2 ? 1 : 0), 2)
                const nge3 = Math.min(ge3 + (total >= 3 ? 1 : 0), 1)
                const nge4 = Math.min(ge4 + (total >= 4 ? 1 : 0), 1)
                const nge5 = Math.min(ge5 + (total >= 5 ? 1 : 0), 1)
                next[nj][nge2][nge3][nge4][nge5] += val * ways
              }
            }
          }
        }
      }
    }

    dp = next
  }

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
          const val = dp[drawCount][ge2][ge3][ge4][ge5]
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

// ─── B. Flush (with fixed cards) ────────────────────────────────────────────

function computeFlushSim(fixedSuitCounts, poolSuitCounts, poolSize, drawCount) {
  let count = 0
  for (const suit in poolSuitCounts) {
    const fs = fixedSuitCounts[suit] || 0
    const ps = poolSuitCounts[suit]
    const otherPool = poolSize - ps

    const minDraw = Math.max(0, 5 - fs)
    for (let k = minDraw; k <= Math.min(ps, drawCount); k++) {
      const remaining = drawCount - k
      if (remaining > otherPool) continue
      count += comb(ps, k) * comb(otherPool, remaining)
    }
  }
  // Also check suits that only exist in fixed cards (no pool cards)
  for (const suit in fixedSuitCounts) {
    if (poolSuitCounts[suit]) continue // already handled
    if (fixedSuitCounts[suit] >= 5) {
      // All 5+ flush cards are fixed, draw anything
      count += comb(poolSize, drawCount)
    }
  }
  return count
}

// ─── C. Straight DP (with fixed cards) ──────────────────────────────────────

function computeStraightSim(
  fixedRankCounts,
  poolRankCounts,
  poolSize,
  drawCount
) {
  const maxJ = drawCount
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
    const fr = fixedRankCounts[rankIdx]
    const pr = poolRankCounts[rankIdx]

    // Skip only if rank has no cards at all (fixed or pool)
    if (fr === 0 && pr === 0) {
      // Rank not present → run resets. Must propagate state.
      const next = create()
      for (let j = 0; j <= maxJ; j++) {
        for (let run = 0; run < 5; run++) {
          for (let found = 0; found < 2; found++) {
            for (let lowRun = 0; lowRun < 5; lowRun++) {
              const val = dp[j][run][found][lowRun]
              if (val === 0) continue
              // k=0 forced, rank not present
              next[j][0][found][lowRun] += val
            }
          }
        }
      }
      dp = next
      continue
    }

    const next = create()

    for (let j = 0; j <= maxJ; j++) {
      for (let run = 0; run < 5; run++) {
        for (let found = 0; found < 2; found++) {
          for (let lowRun = 0; lowRun < 5; lowRun++) {
            const val = dp[j][run][found][lowRun]
            if (val === 0) continue

            const maxK = Math.min(pr, maxJ - j)
            for (let k = 0; k <= maxK; k++) {
              const ways = comb(pr, k)
              const nj = j + k
              const rankPresent = fr + k >= 1

              let nRun, nFound, nLowRun

              if (!rankPresent) {
                nRun = 0
                nFound = found
                nLowRun = lowRun
              } else {
                nRun = run + 1
                nFound = found
                nLowRun = lowRun

                if (rankIdx <= 3 && lowRun === rankIdx) {
                  nLowRun = rankIdx + 1
                }

                if (nRun >= 5) {
                  nFound = 1
                  nRun = 4
                }

                if (rankIdx === 12 && nLowRun === 4) {
                  nFound = 1
                }
              }

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

  let count = 0
  for (let run = 0; run < 5; run++) {
    for (let lowRun = 0; lowRun < 5; lowRun++) {
      count += dp[drawCount][run][1][lowRun]
    }
  }
  return count
}

// ─── D. Straight Flush & Royal Flush (with fixed cards) ─────────────────────

function computeStraightFlushAndRoyalSim(fixedCards, drawPool, drawCount) {
  const fixedSR = getSuitRankCounts(fixedCards)
  const poolSR = getSuitRankCounts(drawPool)
  const poolSize = drawPool.length

  const allSuits = new Set()
  for (const c of fixedCards) allSuits.add(c.suit)
  for (const c of drawPool) allSuits.add(c.suit)
  const suits = [...allSuits]

  // All possible straight flush runs
  const allRuns = []
  for (let start = 0; start <= 8; start++) {
    allRuns.push([start, start + 1, start + 2, start + 3, start + 4])
  }
  allRuns.push([12, 0, 1, 2, 3]) // ace-low

  const coresBySuit = {}
  for (const suit of suits) {
    const cores = []
    for (const run of allRuns) {
      let valid = true
      for (const ri of run) {
        const key = `${suit}:${ri}`
        const inFixed = fixedSR.get(key) || 0
        const inPool = poolSR.get(key) || 0
        if (inFixed + inPool === 0) {
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

  let sfCount = 0
  let rfCount = 0

  for (const suit in coresBySuit) {
    const cores = coresBySuit[suit]
    const numCores = cores.length

    for (let mask = 1; mask < 1 << numCores; mask++) {
      const unionRanks = new Set()
      let isRoyal = false
      let allRoyal = true

      for (let i = 0; i < numCores; i++) {
        if (mask & (1 << i)) {
          for (const ri of cores[i].ranks) {
            unionRanks.add(ri)
          }
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

      // Count how many union cards need to be drawn (not already fixed)
      let neededFromDraw = 0
      let achievable = true
      for (const ri of unionRanks) {
        const key = `${suit}:${ri}`
        const inFixed = fixedSR.get(key) || 0
        if (inFixed >= 1) continue // already in hand
        const inPool = poolSR.get(key) || 0
        if (inPool === 0) {
          achievable = false
          break
        }
        neededFromDraw++
      }
      if (!achievable) continue
      if (neededFromDraw > drawCount) continue

      const ways = comb(poolSize - neededFromDraw, drawCount - neededFromDraw)

      const bits = popcount(mask)
      const sign = bits % 2 === 1 ? 1 : -1

      sfCount += sign * ways

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

// ─── E. Flush House & Flush Five (with fixed cards) ─────────────────────────

function computeFlushHouseAndFlushFiveSim(fixedCards, drawPool, drawCount) {
  const fixedSR = getSuitRankCounts(fixedCards)
  const poolSR = getSuitRankCounts(drawPool)
  const poolSize = drawPool.length

  const allSuits = new Set()
  for (const c of fixedCards) allSuits.add(c.suit)
  for (const c of drawPool) allSuits.add(c.suit)

  let flushFiveCount = 0
  let flushHouseCount = 0

  for (const suit of allSuits) {
    const ranksInSuit = []
    for (let ri = 0; ri < 13; ri++) {
      const key = `${suit}:${ri}`
      const fc = fixedSR.get(key) || 0
      const pc = poolSR.get(key) || 0
      if (fc + pc > 0) ranksInSuit.push({ ri, fc, pc })
    }

    // Flush Five: 5 cards same rank AND same suit
    for (const { fc, pc } of ranksInSuit) {
      if (fc + pc < 5) continue
      const needed = Math.max(0, 5 - fc)
      if (needed > pc || needed > drawCount) continue
      flushFiveCount +=
        comb(pc, needed) * comb(poolSize - pc, drawCount - needed)
    }

    // Flush House: 3 of rank A + 2 of rank B, all same suit
    for (let i = 0; i < ranksInSuit.length; i++) {
      for (let j = 0; j < ranksInSuit.length; j++) {
        if (i === j) continue
        const a = ranksInSuit[i]
        const b = ranksInSuit[j]
        if (a.fc + a.pc < 3 || b.fc + b.pc < 2) continue

        const needA = Math.max(0, 3 - a.fc)
        const needB = Math.max(0, 2 - b.fc)
        const totalNeed = needA + needB

        if (needA > a.pc || needB > b.pc || totalNeed > drawCount) continue

        flushHouseCount +=
          comb(a.pc, needA) *
          comb(b.pc, needB) *
          comb(poolSize - a.pc - b.pc, drawCount - totalNeed)
      }
    }
  }

  return {
    flushFive: flushFiveCount,
    flushHouse: flushHouseCount,
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function calculateHandSimProbabilities(fixedCards, drawPool, drawCount) {
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

  if (drawCount === 0) return probs

  const poolSize = drawPool.length
  const total = comb(poolSize, drawCount)
  if (total === 0) return probs

  // High Card: always 100% when drawing at least 1 card
  probs.highCard = 1

  const fixedRankCounts = getRankCounts(fixedCards)
  const poolRankCounts = getRankCounts(drawPool)
  const fixedSuitCounts = getSuitCounts(fixedCards)
  const poolSuitCounts = getSuitCounts(drawPool)

  // A. Rank-multiplicity DP
  const rankResults = computeRankMultiplicityDPSim(
    fixedRankCounts,
    poolRankCounts,
    drawCount
  )
  probs.pair = rankResults.pair / total
  probs.twoPair = rankResults.twoPair / total
  probs.threeOfAKind = rankResults.threeOfAKind / total
  probs.fullHouse = rankResults.fullHouse / total
  probs.fourOfAKind = rankResults.fourOfAKind / total
  probs.fiveOfAKind = rankResults.fiveOfAKind / total

  // B. Flush
  probs.flush =
    computeFlushSim(fixedSuitCounts, poolSuitCounts, poolSize, drawCount) /
    total

  // C. Straight
  probs.straight =
    computeStraightSim(fixedRankCounts, poolRankCounts, poolSize, drawCount) /
    total

  // D. Straight Flush & Royal Flush
  const sfResults = computeStraightFlushAndRoyalSim(
    fixedCards,
    drawPool,
    drawCount
  )
  probs.straightFlush = sfResults.straightFlush / total
  probs.royalFlush = sfResults.royalFlush / total

  // E. Flush House & Flush Five
  const fhResults = computeFlushHouseAndFlushFiveSim(
    fixedCards,
    drawPool,
    drawCount
  )
  probs.flushHouse = fhResults.flushHouse / total
  probs.flushFive = fhResults.flushFive / total

  return probs
}
