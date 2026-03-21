# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Balatro Odds Calculator — a frontend-only Vue 3 app that calculates poker hand probabilities based on the card game Balatro. Users customize a deck (default 52 cards) and see the probability of each Balatro hand type when drawing cards.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint
- `npm run lint:fix` — run ESLint with auto-fix
- `npm run format` — format `src/` with Prettier
- `npm run format:check` — check formatting without writing
- `npm run deploy` — build and deploy to GitHub Pages via `gh-pages`

No test runner is configured.

## Tech Stack

- **Vue 3** with `<script setup>` SFCs and Composition API
- **Vite 8** for dev server and bundling
- **JavaScript** (no TypeScript)
- **ESLint 10** + **Prettier** for linting/formatting (flat config in `eslint.config.js`)
- Deployed to GitHub Pages (frontend only, no backend)

## Architecture

The spec (`spec.md`, not committed to remote) outlines two main features:

1. **Deck probability view**: User customizes a deck (ranks + suits), draws 8 cards, sees probability of each poker hand type
2. **Hand simulation**: User selects cards to play (up to 5), sees probabilities for the next draw that refills the hand

Balatro hand types (from spec): High Card, Pair, Two Pair, Three of a Kind, Straight, Flush, Full House, Four of a Kind, Straight Flush, Royal Flush.

Key modules:
- `src/data/cards.js` — static card definitions (SUITS, RANKS, CARDS array mapping image filenames to suit/rank)
- `src/composables/useDeck.js` — reactive deck state (excludedIds Set, toggleCard, activeCards computed)
- `src/components/DeckGrid.vue` + `CardItem.vue` — deck display grid with click-to-toggle exclusion
- Card images: 52 PNGs in `public/cards/` named `8BitDeck1.png`–`8BitDeck52.png` (1–13 Hearts, 14–26 Clubs, 27–39 Diamonds, 40–52 Spades, each suit ordered 2→A)

## Code Style

- No semicolons, single quotes, 2-space indent, trailing commas in ES5 positions (see `.prettierrc.json`)
- Prettier is enforced as an ESLint rule — `npm run lint` catches formatting issues too
- Use `<style scoped>` in Vue components — keep component styles colocated, not in global `style.css`
- Prefer nested CSS selectors (`&:hover`, `&.class`, `img { }`) over flat repetitive selectors

## Key Notes

- The spec file (`spec.md`) is local-only and intentionally not pushed to remote
- Default hand size is 8 cards (configurable by user)
- Straights: Aces can be high (A K Q J 10) or low (A 2 3 4 5) but not wrap-around (K A 2 3 4 is invalid)
- Vite `base` is set to `/Balatro-Odds-Calculator/` for GitHub Pages — asset paths must be relative or use this base
