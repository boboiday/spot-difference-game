// Lantern Lane — deterministic `?shot=` states for screenshots. Every state
// is applied synchronously on load (before the first paint) so a headless
// screenshot captures the finished frame, never a blank canvas.
//
//   ?shot=start  — title screen over level 1, nothing found yet
//   ?shot=play   — level 2 mid-play, 4 found with gold rings, 6 remain
//   ?shot=play2  — level 3 mid-play, 2 found, timer low and red
//   ?shot=end    — win screen, all levels complete, stars lit

import { SCREENS, startLevel, levelOf } from './game.js';

const SHOT_PRESETS = {
  start: { level: 0, found: [], timeLeft: 120, screen: SCREENS.START },
  play: { level: 1, found: ['flag', 'sail', 'buoy', 'rope'], timeLeft: 96, screen: SCREENS.PLAY },
  play2: { level: 2, found: ['teacup', 'rung'], timeLeft: 24, screen: SCREENS.PLAY },
  end: { level: 2, found: null, timeLeft: 61, screen: SCREENS.WIN },
};

export function applyShot(game, shotName) {
  const preset = SHOT_PRESETS[shotName];
  if (!preset) return false;
  game.frozen = true;
  startLevel(game, preset.level);
  game.timeLeft = preset.timeLeft;
  if (preset.found === null) {
    // Win screen: every level complete, all differences found.
    game.found = new Set(levelOf(game).diffs.map((d) => d.id));
    game.levelStars = [3, 3, 3];
    game.score = 8420;
    game.bestCombo = 6;
    game.totalFound = 29;
  } else {
    game.found = new Set(preset.found);
    game.score = preset.found.length * 140;
    game.bestCombo = Math.max(2, preset.found.length);
  }
  game.screen = preset.screen;
  game.message = '';
  game.messageUntil = 0;
  game.hintTarget = null;
  if (preset.screen === SCREENS.PLAY) {
    game.message = preset.level === 1 ? 'Found it — Sail colour! +100' : '';
    game.messageUntil = 0;
  }
  return true;
}

export function shotNames() {
  return Object.keys(SHOT_PRESETS);
}
