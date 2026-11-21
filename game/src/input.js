// Lantern Lane — mouse and keyboard input. Clicks are translated from page
// pixels into scene coordinates and handed to the game; the keyboard drives
// a crosshair so the whole game is playable without a mouse.

import { SCREENS, markSpot, startGame, startLevel, nextLevel, useHint, togglePause } from './game.js';
import { panelAtPoint, PANELS } from './render.js';
import { ensureAudio, playClick, playFound, playMiss, playHint, toggleMute } from './audio.js';

export function attachInput(canvas, game) {
  canvas.addEventListener('click', (event) => {
    ensureAudio();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    handleClick(game, x, y);
  });

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const hit = panelAtPoint(x, y);
    if (hit) {
      game.crosshair = { x: hit.sceneX, y: hit.sceneY, panel: hit.panel };
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    handleKey(game, event.key);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
  });
}

function handleClick(game, x, y) {
  const now = performance.now();
  if (game.screen === SCREENS.START) {
    playClick();
    startGame(game);
    return;
  }
  if (game.screen === SCREENS.LEVEL_DONE) {
    playClick();
    nextLevel(game);
    return;
  }
  if (game.screen === SCREENS.WIN || game.screen === SCREENS.TIMEOUT) {
    playClick();
    startGame(game);
    return;
  }
  if (game.screen === SCREENS.PAUSED) {
    togglePause(game);
    return;
  }
  const hit = panelAtPoint(x, y);
  if (!hit) return;
  const result = markSpot(game, hit.sceneX, hit.sceneY, now);
  if (result === 'miss' && game.lastWrong) game.lastWrong.panel = hit.panel;
  if (result === 'found') playFound(game.combo);
  else if (result === 'miss') playMiss();
}

function moveCrosshair(game, dx, dy) {
  const c = game.crosshair;
  c.x = Math.max(0, Math.min(PANELS.w, c.x + dx));
  c.y = Math.max(0, Math.min(PANELS.h, c.y + dy));
}

function handleKey(game, key) {
  const now = performance.now();
  const k = key.toLowerCase();
  if (k === 'm') {
    toggleMute();
    return;
  }
  if (game.screen === SCREENS.START) {
    if (k === 'enter' || k === ' ') {
      ensureAudio();
      playClick();
      startGame(game);
    }
    if (k === '1' || k === '2' || k === '3') {
      ensureAudio();
      playClick();
      startGame(game);
      startLevel(game, Number(k) - 1);
    }
    return;
  }
  if (game.screen === SCREENS.LEVEL_DONE) {
    if (k === 'enter' || k === ' ' || k === 'n') {
      playClick();
      nextLevel(game);
    }
    return;
  }
  if (game.screen === SCREENS.WIN || game.screen === SCREENS.TIMEOUT) {
    if (k === 'enter' || k === ' ' || k === 'r') {
      playClick();
      startGame(game);
    }
    return;
  }
  if (game.screen === SCREENS.PAUSED) {
    if (k === 'p' || k === 'escape' || k === 'enter' || k === ' ') togglePause(game);
    return;
  }
  if (game.screen !== SCREENS.PLAY) return;
  switch (k) {
    case 'arrowleft':
      moveCrosshair(game, -14, 0);
      break;
    case 'arrowright':
      moveCrosshair(game, 14, 0);
      break;
    case 'arrowup':
      moveCrosshair(game, 0, -14);
      break;
    case 'arrowdown':
      moveCrosshair(game, 0, 14);
      break;
    case 'enter':
    case ' ': {
      ensureAudio();
      const result = markSpot(game, game.crosshair.x, game.crosshair.y, now);
      if (result === 'miss' && game.lastWrong) game.lastWrong.panel = game.crosshair.panel;
      if (result === 'found') playFound(game.combo);
      else if (result === 'miss') playMiss();
      break;
    }
    case 'h':
      if (useHint(game, now)) playHint();
      break;
    case 'p':
    case 'escape':
      togglePause(game);
      break;
    case 'r':
      startLevel(game, game.levelIndex);
      break;
    case 'tab':
      game.crosshair.panel = 1 - game.crosshair.panel;
      break;
    default:
      break;
  }
}
