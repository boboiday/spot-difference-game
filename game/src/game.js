// Lantern Lane — game state machine: levels, timer, scoring, hints, streaks.
// Pure logic; rendering lives in render.js, input in input.js.

import { LEVELS } from './scenes.js';

export const SCREENS = {
  START: 'start',
  PLAY: 'play',
  LEVEL_DONE: 'levelDone',
  WIN: 'win',
  TIMEOUT: 'timeout',
  PAUSED: 'paused',
};

export function createGame() {
  return {
    screen: SCREENS.START,
    levelIndex: 0,
    found: new Set(),
    score: 0,
    combo: 0,
    bestCombo: 0,
    hintsLeft: 3,
    timeLeft: 0,
    timeBonus: 0,
    stars: 0,
    levelStars: [0, 0, 0],
    totalFound: 0,
    wrongClicks: 0,
    // Transient feedback, consumed by the renderer.
    lastWrong: null, // {x, y, panel, at}
    lastFound: null, // {x, y, at}
    hintTarget: null, // diff id
    hintUntil: 0,
    message: '',
    messageUntil: 0,
    crosshair: { x: 300, y: 235, panel: 0 },
    pausedFrom: null,
    frozen: false, // shot mode: no ticking, deterministic frame
  };
}

export function levelOf(game) {
  return LEVELS[game.levelIndex];
}

export function diffsRemaining(game) {
  return levelOf(game).diffs.length - game.found.size;
}

export function startLevel(game, index) {
  const level = LEVELS[index];
  game.levelIndex = index;
  game.found = new Set();
  game.combo = 0;
  game.hintsLeft = level.hints;
  game.timeLeft = level.timeLimit;
  game.screen = SCREENS.PLAY;
  game.lastWrong = null;
  game.lastFound = null;
  game.hintTarget = null;
  game.message = '';
  game.crosshair = { x: 300, y: 235, panel: 0 };
}

export function startGame(game) {
  game.score = 0;
  game.bestCombo = 0;
  game.totalFound = 0;
  game.wrongClicks = 0;
  game.levelStars = [0, 0, 0];
  startLevel(game, 0);
}

function nearestDiff(game, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const d of levelOf(game).diffs) {
    const dx = d.x - x;
    const dy = d.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return { diff: best, dist: bestD };
}

// Mark a spot in scene coordinates. Returns 'found' | 'already' | 'miss'.
export function markSpot(game, x, y, now) {
  if (game.screen !== SCREENS.PLAY) return 'idle';
  const { diff, dist } = nearestDiff(game, x, y);
  if (diff && dist <= diff.r + 14 && !game.found.has(diff.id)) {
    game.found.add(diff.id);
    game.totalFound += 1;
    game.combo += 1;
    game.bestCombo = Math.max(game.bestCombo, game.combo);
    const comboBonus = (game.combo - 1) * 25;
    const gained = diff.points + comboBonus;
    game.score += gained;
    game.lastFound = { x: diff.x, y: diff.y, at: now, gained, label: diff.label };
    game.message = `Found it — ${diff.label}! +${gained}`;
    game.messageUntil = now + 1800;
    if (game.found.size === levelOf(game).diffs.length) {
      finishLevel(game, now);
    }
    return 'found';
  }
  if (diff && dist <= diff.r + 14 && game.found.has(diff.id)) {
    return 'already';
  }
  game.combo = 0;
  game.wrongClicks += 1;
  game.timeLeft = Math.max(0, game.timeLeft - 3);
  game.lastWrong = { x, y, at: now };
  game.message = 'Not quite — 3 seconds lost';
  game.messageUntil = now + 1400;
  return 'miss';
}

function finishLevel(game, now) {
  const level = levelOf(game);
  const timeBonus = Math.round(game.timeLeft) * 5;
  game.timeBonus = timeBonus;
  game.score += timeBonus;
  const accuracy = game.wrongClicks === 0 ? 3 : game.timeLeft > level.timeLimit * 0.4 ? 2 : 1;
  // Stars: 3 for a clean fast finish, 2 for a solid one, 1 for scraping through.
  game.stars = game.wrongClicks === 0 && game.timeLeft > 30 ? 3 : game.timeLeft > 15 ? 2 : 1;
  game.stars = Math.max(game.stars, accuracy === 3 ? 3 : game.stars);
  game.levelStars[game.levelIndex] = game.stars;
  game.screen = SCREENS.LEVEL_DONE;
  game.message = '';
}

export function nextLevel(game) {
  if (game.levelIndex + 1 < LEVELS.length) {
    startLevel(game, game.levelIndex + 1);
  } else {
    game.screen = SCREENS.WIN;
  }
}

export function useHint(game, now) {
  if (game.screen !== SCREENS.PLAY || game.hintsLeft <= 0) return false;
  const remaining = levelOf(game).diffs.filter((d) => !game.found.has(d.id));
  if (remaining.length === 0) return false;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  game.hintsLeft -= 1;
  game.hintTarget = pick.id;
  game.hintUntil = now + 2200;
  game.message = `Hint — look near the ${pick.label.toLowerCase()}`;
  game.messageUntil = now + 2200;
  return true;
}

export function tick(game, dtSeconds, now) {
  if (game.frozen || game.screen !== SCREENS.PLAY) return;
  game.timeLeft -= dtSeconds;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = SCREENS.TIMEOUT;
    game.message = '';
  }
}

export function togglePause(game) {
  if (game.screen === SCREENS.PLAY) {
    game.pausedFrom = SCREENS.PLAY;
    game.screen = SCREENS.PAUSED;
  } else if (game.screen === SCREENS.PAUSED) {
    game.screen = SCREENS.PLAY;
  }
}

export function totalStars(game) {
  return game.levelStars.reduce((a, b) => a + b, 0);
}
