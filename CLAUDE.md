# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Balatro Odds Calculator — a frontend-only Vue 3 app that calculates poker hand probabilities based on the card game Balatro. Users customize a deck (default 52 cards) and see the probability of each Balatro hand type when drawing cards.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally

No test runner or linter is configured yet (ESLint installation is planned).

## Tech Stack

- **Vue 3** with `<script setup>` SFCs and Composition API
- **Vite 8** for dev server and bundling
- **JavaScript** (no TypeScript)
- Deployed to GitHub Pages (frontend only, no backend)

## Architecture

Early-stage project — currently contains the Vite/Vue starter template. The spec (`spec.md`, not committed to remote) outlines two main features:

1. **Deck probability view**: User customizes a deck (ranks + suits), draws 8 cards, sees probability of each poker hand type
2. **Hand simulation**: User selects cards to play (up to 5), sees probabilities for the next draw that refills the hand

Balatro hand types (from spec): High Card, Pair, Two Pair, Three of a Kind, Straight, Flush, Full House, Four of a Kind, Straight Flush, Royal Flush.

## Key Notes

- The spec file (`spec.md`) is local-only and intentionally not pushed to remote
- Default hand size is 8 cards (configurable by user)
- Straights: Aces can be high (A K Q J 10) or low (A 2 3 4 5) but not wrap-around (K A 2 3 4 is invalid)
