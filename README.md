# Lantern Lane — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/boboiday/spot-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/boboiday/spot-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

(referral xdr8gw0z) — [make.fun](https://make.fun/?ref=xdr8gw0z&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

An original spot-the-difference game built for the [make.fun](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) bounty "The best spot the difference game".

Two near-identical pictures hang side by side in a cosy lantern-lit lane. They look the same — but a few small things changed. Find them all before the lantern burns down.

## Play

Serve `game/` with any static server and open `index.html` in desktop Chrome:

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests, no external assets — all art is drawn procedurally in Canvas 2D and all sounds are synthesised with WebAudio.

## The game

- **3 levels, 29 differences**: Morning Market (7, 120 s), Harbour at Dusk (10, 150 s), Midnight Library (12, 180 s)
- **Click either picture** to mark a difference — a golden ring appears on both panels, with a chime and points. Small, hidden differences are worth more; streaks earn combo bonuses.
- **Wrong clicks** flash a red X and cost 3 seconds.
- **Hints (H)**: 3 per level, briefly pulse the region of one unfound difference.
- **Keyboard**: arrows move the crosshair, Enter/Space marks, H hint, P/Esc pause, R restart, 1/2/3 level select, M mute.
- **Timer bar** drains visibly and turns red under 30 seconds. Level-complete screens award stars and a time bonus; a win screen lights all nine stars.

## Layout

- `game/index.html` — page shell and canvas
- `game/styles.css` — page chrome
- `game/src/main.js` — bootstrap, synchronous first paint, `?shot=` states
- `game/src/scenes.js` — the three hand-built scenes and their difference lists
- `game/src/render.js` — HUD, panels, markers, screens
- `game/src/input.js` — mouse and keyboard input
- `game/src/audio.js` — WebAudio synth sounds
- `game/src/game.js` — state machine: levels, timer, scoring, hints
- `game/src/shots.js` — deterministic screenshot states (`start`, `play`, `play2`, `end`)
- `main.ts` — entrypoint: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — real renders of the game

## Licence

MIT — see [LICENSE](LICENSE).
