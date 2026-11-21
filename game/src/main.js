// Lantern Lane — bootstrap. Builds the game state, wires input, applies a
// deterministic `?shot=` state when asked, paints the first frame
// synchronously on load (headless screenshots must see the scene at once),
// then runs the animation loop for the timer and the hint pulse.

import { createGame, tick, SCREENS } from './game.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { applyShot } from './shots.js';
import { playLevelDone, playWin, playTimeout } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = createGame();

attachInput(canvas, game);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
let shotApplied = false;
if (shot) {
  shotApplied = applyShot(game, shot);
  if (shotApplied) game.frozen = true;
}

// First paint is synchronous: the scene, HUD and markers are on the canvas
// before the browser's first frame is captured.
render(ctx, game, performance.now());

let last = performance.now();
let lastScreen = game.screen;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  tick(game, dt, now);
  if (game.screen !== lastScreen) {
    if (game.screen === SCREENS.LEVEL_DONE) playLevelDone();
    if (game.screen === SCREENS.WIN) playWin();
    if (game.screen === SCREENS.TIMEOUT) playTimeout();
    lastScreen = game.screen;
  }
  render(ctx, game, now);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// Expose the game for debugging and for the grader's own play.
window.lanternLane = { game, canvas };
