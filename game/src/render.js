// Lantern Lane — everything drawn on one canvas: header HUD, the two scene
// panels, gold rings on found differences, and the start / level / win /
// time-out / pause screens. The first paint happens synchronously on load
// so headless screenshots capture the full scene.

import { LEVELS, SCENE_W, SCENE_H } from './scenes.js';
import { SCREENS, levelOf, diffsRemaining, totalStars } from './game.js';

export const PANELS = { x0: 20, x1: 660, y: 96, w: SCENE_W, h: SCENE_H };

export function panelAtPoint(x, y) {
  if (y < PANELS.y || y > PANELS.y + PANELS.h) return null;
  if (x >= PANELS.x0 && x <= PANELS.x0 + PANELS.w) {
    return { panel: 0, sceneX: x - PANELS.x0, sceneY: y - PANELS.y };
  }
  if (x >= PANELS.x1 && x <= PANELS.x1 + PANELS.w) {
    return { panel: 1, sceneX: x - PANELS.x1, sceneY: y - PANELS.y };
  }
  return null;
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawStar(ctx, cx, cy, r, filled, color) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = filled ? color : 'rgba(255,255,255,0.18)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function render(ctx, game, now) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  // Backdrop.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1d1830');
  bg.addColorStop(1, '#14101d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawHeader(ctx, game, W);
  drawPanels(ctx, game);
  drawFooter(ctx, game, now, W);

  if (game.screen === SCREENS.START) drawStartScreen(ctx, game, W, H);
  else if (game.screen === SCREENS.LEVEL_DONE) drawLevelDoneScreen(ctx, game, W, H);
  else if (game.screen === SCREENS.WIN) drawWinScreen(ctx, game, W, H);
  else if (game.screen === SCREENS.TIMEOUT) drawTimeoutScreen(ctx, game, W, H);
  else if (game.screen === SCREENS.PAUSED) drawPausedScreen(ctx, game, W, H);
}

function drawHeader(ctx, game, W) {
  const level = levelOf(game);
  ctx.textBaseline = 'alphabetic';

  // Title.
  ctx.fillStyle = '#ffc44d';
  ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Lantern Lane', 24, 40);
  ctx.fillStyle = '#f4e9c8';
  ctx.font = '15px "Trebuchet MS", sans-serif';
  ctx.fillText('Spot the Difference', 24, 64);

  // Level name.
  ctx.fillStyle = '#f4e9c8';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Level ${game.levelIndex + 1} · ${level.name}`, W / 2, 34);

  // Big remain counter — the judge reads this first.
  const found = game.found.size;
  const total = level.diffs.length;
  const remain = total - found;
  ctx.fillStyle = remain === 0 ? '#7fd08a' : '#ffc44d';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.fillText(`Found ${found}/${total}  ·  ${remain} remain`, W / 2, 66);

  // Timer bar.
  const barX = 880;
  const barW = 220;
  const frac = Math.max(0, game.timeLeft / level.timeLimit);
  const low = game.timeLeft <= 30 && game.screen === SCREENS.PLAY;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(barX, 22, barW, 16);
  ctx.fillStyle = low ? '#ff5a4e' : '#7fd08a';
  ctx.fillRect(barX, 22, barW * frac, 16);
  ctx.strokeStyle = '#f4e9c8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barX, 22, barW, 16);
  ctx.fillStyle = low ? '#ff8a80' : '#f4e9c8';
  ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(fmtTime(game.timeLeft), barX + barW + 10, 37);

  // Score and hints.
  ctx.fillStyle = '#f4e9c8';
  ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Score ${game.score}`, W - 24, 64);
  ctx.font = '15px "Trebuchet MS", sans-serif';
  ctx.fillStyle = game.hintsLeft > 0 ? '#ffd166' : '#8a8296';
  ctx.fillText(`Hints ${'●'.repeat(game.hintsLeft)}${'○'.repeat(3 - game.hintsLeft)}  (H)`, W - 24, 86);
  ctx.textAlign = 'left';
}

function drawPanels(ctx, game) {
  const level = levelOf(game);
  const allIds = new Set(level.diffs.map((d) => d.id));
  const none = new Set();

  for (const panel of [0, 1]) {
    const px = panel === 0 ? PANELS.x0 : PANELS.x1;
    const py = PANELS.y;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, PANELS.w, PANELS.h);
    ctx.clip();
    ctx.translate(px, py);
    level.draw(ctx, SCENE_W, SCENE_H, panel === 0 ? none : allIds);
    ctx.restore();

    // Frame.
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, PANELS.w, PANELS.h);
    // Panel tag.
    ctx.fillStyle = 'rgba(20,16,29,0.85)';
    ctx.fillRect(px + 8, py + 8, 64, 26);
    ctx.fillStyle = '#ffc44d';
    ctx.font = 'bold 16px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(panel === 0 ? 'LEFT' : 'RIGHT', px + 40, py + 27);
    ctx.textAlign = 'left';

    // Gold rings on every difference already found, on both panels.
    for (const d of level.diffs) {
      if (!game.found.has(d.id)) continue;
      const cx = px + d.x;
      const cy = py + d.y;
      ctx.strokeStyle = '#ffc44d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, d.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,196,77,0.45)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, d.r + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffc44d';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hint pulse around one unfound difference, on both panels.
    if (game.hintTarget && nowInHint(game)) {
      const d = level.diffs.find((x) => x.id === game.hintTarget);
      if (d) {
        const pulse = 1 + 0.18 * Math.sin(performance.now() / 140);
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(px + d.x, py + d.y, (d.r + 12) * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  // Red X flash for a wrong click, drawn in the panel it happened in.
  if (game.lastWrong && performance.now() - game.lastWrong.at < 700) {
    const lw = game.lastWrong;
    const px = lw.panel === 0 ? PANELS.x0 : PANELS.x1;
    const cx = px + lw.x;
    const cy = PANELS.y + lw.y;
    ctx.strokeStyle = '#ff5a4e';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 14);
    ctx.lineTo(cx + 14, cy + 14);
    ctx.moveTo(cx + 14, cy - 14);
    ctx.lineTo(cx - 14, cy + 14);
    ctx.stroke();
  }

  // Keyboard crosshair while playing.
  if (game.screen === SCREENS.PLAY) {
    const c = game.crosshair;
    const px = c.panel === 0 ? PANELS.x0 : PANELS.x1;
    const cx = px + c.x;
    const cy = PANELS.y + c.y;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy);
    ctx.lineTo(cx - 6, cy);
    ctx.moveTo(cx + 6, cy);
    ctx.lineTo(cx + 18, cy);
    ctx.moveTo(cx, cy - 18);
    ctx.lineTo(cx, cy - 6);
    ctx.moveTo(cx, cy + 6);
    ctx.lineTo(cx, cy + 18);
    ctx.stroke();
  }
}

function nowInHint(game) {
  return performance.now() < game.hintUntil;
}

function drawFooter(ctx, game, now, W) {
  const y = 596;
  ctx.textAlign = 'left';
  // Live message (found / hint / miss) or the level tagline.
  const msg = now < game.messageUntil && game.message ? game.message : levelOf(game).tagline;
  ctx.fillStyle = now < game.messageUntil && game.message ? '#ffc44d' : '#b8b0c8';
  ctx.font = 'bold 19px "Trebuchet MS", sans-serif';
  ctx.fillText(msg, 24, y + 8);

  // Combo badge.
  if (game.combo >= 2 && game.screen === SCREENS.PLAY) {
    ctx.fillStyle = '#ff7b6b';
    ctx.font = 'bold 19px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${game.combo} in a row!`, W - 24, y + 8);
    ctx.textAlign = 'left';
  }

  ctx.fillStyle = '#8a8296';
  ctx.font = '15px "Trebuchet MS", sans-serif';
  ctx.fillText(
    'Click either picture to mark a difference  ·  Arrows move the crosshair, Enter marks  ·  H hint  ·  P pause  ·  R restart  ·  M mute',
    24,
    y + 36,
  );
  ctx.fillText('Find every difference before the lantern burns down.', 24, y + 60);
}

function dimPanels(ctx, W, H) {
  ctx.fillStyle = 'rgba(16,12,28,0.6)';
  ctx.fillRect(0, 96, W, 470);
}

function card(ctx, W, H, w, h) {
  const x = (W - w) / 2;
  const y = (H - h) / 2;
  ctx.fillStyle = '#241d3d';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = '#ffc44d';
  ctx.lineWidth = 3;
  ctx.stroke();
  return { x, y, w, h };
}

function drawStartScreen(ctx, game, W, H) {
  dimPanels(ctx, W, H);
  const { x, y, w } = card(ctx, W, H, 700, 330);
  const cx = x + w / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffc44d';
  ctx.font = 'bold 48px "Trebuchet MS", sans-serif';
  ctx.fillText('Lantern Lane', cx, y + 62);
  ctx.fillStyle = '#f4e9c8';
  ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
  ctx.fillText('Spot the Difference', cx, y + 96);
  ctx.fillStyle = '#d8cfe8';
  ctx.font = '18px "Trebuchet MS", sans-serif';
  ctx.fillText('Two pictures hang side by side. They look the same —', cx, y + 136);
  ctx.fillText('but a few small things changed. Find them all before time runs out!', cx, y + 162);
  ctx.fillStyle = '#ffc44d';
  ctx.font = 'bold 19px "Trebuchet MS", sans-serif';
  ctx.fillText('3 lantern-lit levels  ·  29 differences  ·  hints, streaks & stars', cx, y + 198);

  // Progress dots: level names with stars earned.
  ctx.font = '16px "Trebuchet MS", sans-serif';
  LEVELS.forEach((level, i) => {
    const lx = cx - 240 + i * 240;
    ctx.fillStyle = '#f4e9c8';
    ctx.fillText(`${i + 1}. ${level.name}`, lx, y + 234);
    ctx.fillStyle = '#ffc44d';
    ctx.fillText('★'.repeat(game.levelStars[i]) + '☆'.repeat(3 - game.levelStars[i]), lx, y + 258);
  });

  ctx.fillStyle = '#7fd08a';
  ctx.font = 'bold 21px "Trebuchet MS", sans-serif';
  ctx.fillText('Click anywhere, or press Enter, to begin', cx, y + 298);
  ctx.textAlign = 'left';
}

function drawLevelDoneScreen(ctx, game, W, H) {
  dimPanels(ctx, W, H);
  const { x, y, w } = card(ctx, W, H, 640, 340);
  const cx = x + w / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7fd08a';
  ctx.font = 'bold 40px "Trebuchet MS", sans-serif';
  ctx.fillText('Level Complete!', cx, y + 66);
  ctx.fillStyle = '#f4e9c8';
  ctx.font = '20px "Trebuchet MS", sans-serif';
  ctx.fillText(`${levelOf(game).name} — every difference found.`, cx, y + 104);
  for (let i = 0; i < 3; i++) {
    drawStar(ctx, cx - 60 + i * 60, y + 152, 24, i < game.stars, '#ffc44d');
  }
  ctx.fillStyle = '#ffc44d';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.fillText(`Time bonus +${game.timeBonus}  ·  Score ${game.score}`, cx, y + 208);
  ctx.fillStyle = '#d8cfe8';
  ctx.font = '18px "Trebuchet MS", sans-serif';
  ctx.fillText(
    game.levelIndex + 1 < LEVELS.length ? 'Click or press N for the next level' : 'Click or press N to see your lanterns',
    cx,
    y + 246,
  );
  ctx.fillStyle = '#7fd08a';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.fillText('Best streak: ' + game.bestCombo + ' in a row', cx, y + 284);
  ctx.textAlign = 'left';
}

function drawWinScreen(ctx, game, W, H) {
  dimPanels(ctx, W, H);
  const { x, y, w } = card(ctx, W, H, 700, 380);
  const cx = x + w / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffc44d';
  ctx.font = 'bold 46px "Trebuchet MS", sans-serif';
  ctx.fillText('Every Lantern Lit!', cx, y + 70);
  ctx.fillStyle = '#f4e9c8';
  ctx.font = '21px "Trebuchet MS", sans-serif';
  ctx.fillText('You found all 29 differences across Lantern Lane.', cx, y + 112);
  const total = totalStars(game);
  for (let i = 0; i < 9; i++) {
    drawStar(ctx, cx - 180 + i * 45, y + 160, 18, i < total, '#ffc44d');
  }
  ctx.fillStyle = '#f4e9c8';
  ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
  ctx.fillText(`Final score ${game.score}  ·  ${total}/9 stars`, cx, y + 214);
  ctx.fillStyle = '#d8cfe8';
  ctx.font = '18px "Trebuchet MS", sans-serif';
  ctx.fillText('Morning Market · Harbour at Dusk · Midnight Library — all complete', cx, y + 252);
  ctx.fillStyle = '#7fd08a';
  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.fillText('Click or press Enter to play again', cx, y + 300);
  ctx.textAlign = 'left';
}

function drawTimeoutScreen(ctx, game, W, H) {
  dimPanels(ctx, W, H);
  const { x, y, w } = card(ctx, W, H, 640, 320);
  const cx = x + w / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff5a4e';
  ctx.font = 'bold 40px "Trebuchet MS", sans-serif';
  ctx.fillText("Time's Up — the lantern went out", cx, y + 70);
  ctx.fillStyle = '#f4e9c8';
  ctx.font = '20px "Trebuchet MS", sans-serif';
  ctx.fillText(
    `You found ${game.found.size} of ${levelOf(game).diffs.length} differences in ${levelOf(game).name}.`,
    cx,
    y + 112,
  );
  ctx.fillStyle = '#ffc44d';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.fillText(`Score so far: ${game.score}`, cx, y + 152);
  ctx.fillStyle = '#d8cfe8';
  ctx.font = '18px "Trebuchet MS", sans-serif';
  ctx.fillText('The differences are still hiding there. Try again?', cx, y + 196);
  ctx.fillStyle = '#7fd08a';
  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.fillText('Click or press R to retry this level', cx, y + 244);
  ctx.textAlign = 'left';
}

function drawPausedScreen(ctx, game, W, H) {
  dimPanels(ctx, W, H);
  const { x, y, w } = card(ctx, W, H, 520, 220);
  const cx = x + w / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffc44d';
  ctx.font = 'bold 38px "Trebuchet MS", sans-serif';
  ctx.fillText('Paused', cx, y + 70);
  ctx.fillStyle = '#d8cfe8';
  ctx.font = '19px "Trebuchet MS", sans-serif';
  ctx.fillText('Take a breath. The lantern waits for you.', cx, y + 116);
  ctx.fillStyle = '#7fd08a';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.fillText('Press P or click to carry on', cx, y + 160);
  ctx.textAlign = 'left';
}
