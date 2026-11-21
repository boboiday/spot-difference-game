// Lantern Lane scenes. Each scene is drawn twice from one function: the left
// panel with no differences applied, the right panel with every difference
// applied, so the two pictures are near-identical by construction. A
// difference is a small, real drawn change at a fixed spot in scene space
// (600 x 470), with a marker radius and a point value: small, hidden ones
// are worth more.

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx, cx, cy, r, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function bird(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.9, x, y);
  ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.9, x + s, y);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Level 1 — Morning Market. 7 differences, 120 seconds.
// ---------------------------------------------------------------------------
function drawMarket(ctx, W, H, on) {
  // Sky: warm morning gradient.
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#ffe9b8');
  sky.addColorStop(1, '#ffd08a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Sun with rays.
  ctx.fillStyle = '#ffcf4d';
  ctx.beginPath();
  ctx.arc(72, 66, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffcf4d';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(72 + Math.cos(a) * 38, 66 + Math.sin(a) * 38);
    ctx.lineTo(72 + Math.cos(a) * 50, 66 + Math.sin(a) * 50);
    ctx.stroke();
  }

  // Drifting clouds.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (const [cx, cy, s] of [[210, 48, 1], [430, 34, 0.8], [330, 92, 0.6]]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 34 * s, 13 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 24 * s, cy + 5 * s, 24 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wire across the sky with birds; one extra bird is a difference.
  ctx.strokeStyle = '#5b4a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(W / 2, 116, W, 92);
  ctx.stroke();
  bird(ctx, 160, 102, 9, '#3a2f26');
  bird(ctx, 300, 110, 9, '#3a2f26');
  bird(ctx, 520, 98, 9, '#3a2f26');
  if (on.has('bird')) bird(ctx, 455, 104, 9, '#3a2f26');

  // Rooftops in the distance.
  ctx.fillStyle = '#c96f4a';
  ctx.fillRect(0, 150, W, 26);
  ctx.fillStyle = '#b25a38';
  for (const bx of [20, 130, 250, 370, 480]) {
    ctx.beginPath();
    ctx.moveTo(bx, 150);
    ctx.lineTo(bx + 55, 118);
    ctx.lineTo(bx + 110, 150);
    ctx.closePath();
    ctx.fill();
  }

  // Clock tower, centre-left. Its hands show a different time on the right.
  ctx.fillStyle = '#f3e2c2';
  ctx.fillRect(268, 96, 64, 120);
  ctx.fillStyle = '#a34d2d';
  ctx.beginPath();
  ctx.moveTo(262, 96);
  ctx.lineTo(300, 66);
  ctx.lineTo(338, 96);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff8e6';
  ctx.beginPath();
  ctx.arc(300, 128, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5b4a3a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = '#2e2118';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(300, 128);
  if (on.has('clock')) {
    ctx.lineTo(300, 106); // 12
    ctx.moveTo(300, 128);
    ctx.lineTo(318, 134); // ~4
  } else {
    ctx.lineTo(288, 112); // ~10
    ctx.moveTo(300, 128);
    ctx.lineTo(300, 108); // 12
  }
  ctx.stroke();
  ctx.fillStyle = '#2e2118';
  ctx.beginPath();
  ctx.arc(300, 128, 3, 0, Math.PI * 2);
  ctx.fill();

  // Cobble ground.
  ctx.fillStyle = '#d9b98a';
  ctx.fillRect(0, 216, W, H - 216);
  ctx.strokeStyle = 'rgba(120,90,50,0.35)';
  ctx.lineWidth = 1.5;
  for (let gy = 240; gy < H; gy += 34) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();
  }
  for (let gx = 30; gx < W; gx += 52) {
    ctx.beginPath();
    ctx.moveTo(gx, 216);
    ctx.lineTo(gx - 14, H);
    ctx.stroke();
  }

  // Left stall: fruit, striped awning, hanging lantern, hand-painted sign.
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(48, 268, 150, 10);
  ctx.fillRect(58, 278, 10, 92);
  ctx.fillRect(178, 278, 10, 92);
  // Awning stripes.
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#e4572e' : '#fff3d6';
    ctx.fillRect(40 + i * 27, 216, 27, 52);
  }
  ctx.fillStyle = '#e4572e';
  ctx.beginPath();
  ctx.moveTo(40, 216);
  ctx.lineTo(202, 216);
  ctx.lineTo(196, 232);
  ctx.lineTo(46, 232);
  ctx.closePath();
  ctx.fill();
  // Sign: one letter changes.
  ctx.fillStyle = '#fff3d6';
  roundRect(ctx, 138, 188, 96, 34, 6);
  ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#7a3b12';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(on.has('sign') ? 'SEBAR' : 'SEGAR', 186, 206);
  // Hanging lantern: missing on the right.
  if (!on.has('lantern')) {
    ctx.strokeStyle = '#5b4a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(92, 232);
    ctx.lineTo(92, 246);
    ctx.stroke();
    ctx.fillStyle = '#ffb703';
    roundRect(ctx, 80, 246, 24, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#e4572e';
    ctx.fillRect(80, 254, 24, 4);
    ctx.fillRect(80, 268, 24, 4);
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(92, 261, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Fruit baskets.
  ctx.fillStyle = '#a9713f';
  ctx.beginPath();
  ctx.ellipse(105, 330, 52, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e4572e';
  for (const [ax, ay] of [[78, 318], [100, 310], [122, 318], [90, 326], [112, 326]]) {
    ctx.beginPath();
    ctx.arc(ax, ay, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#7cb342';
  ctx.beginPath();
  ctx.ellipse(168, 336, 34, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffb703';
  for (const [ax, ay] of [[152, 328], [168, 322], [184, 328]]) {
    ctx.beginPath();
    ctx.arc(ax, ay, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  // The cat asleep on a crate: absent on the right.
  if (!on.has('cat')) {
    ctx.fillStyle = '#8a5a33';
    ctx.fillRect(66, 352, 62, 44);
    ctx.strokeStyle = '#6e4525';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(66, 374);
    ctx.lineTo(128, 374);
    ctx.stroke();
    ctx.fillStyle = '#f2a541';
    ctx.beginPath();
    ctx.ellipse(97, 348, 26, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(122, 340, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(114, 332);
    ctx.lineTo(116, 322);
    ctx.lineTo(121, 331);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(126, 330);
    ctx.lineTo(130, 321);
    ctx.lineTo(133, 331);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2e2118';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(126, 340);
    ctx.lineTo(132, 340);
    ctx.stroke();
  }

  // Right stall: bread and flowers, big umbrella, apple basket.
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(380, 268, 160, 10);
  ctx.fillRect(392, 278, 10, 92);
  ctx.fillRect(518, 278, 10, 92);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2a9d8f' : '#fff3d6';
    ctx.fillRect(372 + i * 29, 216, 29, 52);
  }
  // Umbrella: red on the left, teal on the right.
  ctx.fillStyle = on.has('umbrella') ? '#2a9d8f' : '#e4572e';
  ctx.beginPath();
  ctx.moveTo(408, 300);
  ctx.quadraticCurveTo(460, 238, 512, 300);
  ctx.quadraticCurveTo(486, 312, 460, 300);
  ctx.quadraticCurveTo(434, 312, 408, 300);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5b4a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(460, 262);
  ctx.lineTo(460, 300);
  ctx.stroke();
  // Bread loaves.
  ctx.fillStyle = '#c98a4b';
  for (const [bx, by] of [[400, 258], [428, 252], [456, 258]]) {
    ctx.beginPath();
    ctx.ellipse(bx, by, 15, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Apple basket: one apple missing on the right.
  ctx.fillStyle = '#a9713f';
  ctx.beginPath();
  ctx.ellipse(352, 372, 46, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e4572e';
  const apples = [[330, 362], [352, 354], [374, 362], [340, 370], [364, 370]];
  for (const [ax, ay] of apples) {
    if (on.has('apple') && ax === 352 && ay === 354) continue;
    ctx.beginPath();
    ctx.arc(ax, ay, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  // Flower pots.
  ctx.fillStyle = '#c96f4a';
  ctx.fillRect(492, 340, 26, 26);
  ctx.fillRect(524, 340, 26, 26);
  ctx.fillStyle = '#e76f9b';
  for (const [fx, fy] of [[498, 332], [512, 328], [530, 332], [544, 328]]) {
    ctx.beginPath();
    ctx.arc(fx, fy, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd166';
  for (const [fx, fy] of [[505, 336], [537, 336]]) {
    ctx.beginPath();
    ctx.arc(fx, fy, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

const MARKET_DIFFS = [
  { id: 'clock', x: 300, y: 128, r: 26, points: 100, label: 'Clock hands' },
  { id: 'bird', x: 455, y: 104, r: 18, points: 150, label: 'Extra bird' },
  { id: 'cat', x: 97, y: 348, r: 30, points: 120, label: 'Sleeping cat' },
  { id: 'sign', x: 186, y: 205, r: 30, points: 120, label: 'Sign letter' },
  { id: 'umbrella', x: 460, y: 282, r: 34, points: 100, label: 'Umbrella colour' },
  { id: 'lantern', x: 92, y: 261, r: 20, points: 150, label: 'Hanging lantern' },
  { id: 'apple', x: 352, y: 354, r: 16, points: 150, label: 'Missing apple' },
];

// ---------------------------------------------------------------------------
// Level 2 — Harbour at Dusk. 10 differences, 150 seconds.
// ---------------------------------------------------------------------------
function drawHarbour(ctx, W, H, on) {
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  sky.addColorStop(0, '#3d2b63');
  sky.addColorStop(0.55, '#c96f4a');
  sky.addColorStop(1, '#ffb703');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.6);
  // Low sun over the water.
  ctx.fillStyle = '#ff9e4d';
  ctx.beginPath();
  ctx.arc(300, 268, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,158,77,0.35)';
  ctx.beginPath();
  ctx.arc(300, 268, 52, 0, Math.PI * 2);
  ctx.fill();
  // Stars come out; one extra star is a difference.
  ctx.fillStyle = '#fff8e6';
  for (const [sx, sy] of [[60, 40], [150, 70], [380, 30], [480, 90], [240, 26], [520, 150]]) {
    star(ctx, sx, sy, 4, 4, '#fff8e6');
  }
  if (on.has('star')) star(ctx, 545, 55, 5, 4, '#fff8e6');
  // Gulls; one extra gull is a difference.
  bird(ctx, 120, 60, 10, '#2e2118');
  bird(ctx, 210, 96, 10, '#2e2118');
  bird(ctx, 430, 70, 10, '#2e2118');
  if (on.has('gull')) bird(ctx, 150, 78, 10, '#2e2118');

  // Sea.
  const sea = ctx.createLinearGradient(0, 280, 0, H);
  sea.addColorStop(0, '#2a6f8f');
  sea.addColorStop(1, '#123a52');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 280, W, H - 280);
  // Sun glitter on the water.
  ctx.fillStyle = 'rgba(255,183,3,0.5)';
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(268 + i * 8, 292 + i * 22, 64 - i * 10, 4);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  for (let wy = 320; wy < H; wy += 36) {
    ctx.beginPath();
    for (let wx = 0; wx < W; wx += 60) {
      ctx.moveTo(wx, wy + ((wx / 60) % 2 === 0 ? 0 : 4));
      ctx.lineTo(wx + 34, wy + ((wx / 60) % 2 === 0 ? 0 : 4));
    }
    ctx.stroke();
  }

  // Lighthouse on the right headland.
  ctx.fillStyle = '#5b4a3a';
  ctx.beginPath();
  ctx.moveTo(500, 300);
  ctx.lineTo(560, 300);
  ctx.lineTo(548, 210);
  ctx.lineTo(512, 210);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f3e2c2';
  ctx.fillRect(508, 240, 44, 14);
  ctx.fillRect(512, 268, 36, 12);
  ctx.fillStyle = '#2e2118';
  ctx.fillRect(506, 196, 48, 16);
  // Lamp room window: lit or dark.
  ctx.fillStyle = on.has('lampwindow') ? '#ffe66d' : '#2e3a52';
  ctx.fillRect(514, 200, 32, 9);
  if (on.has('lampwindow')) {
    ctx.fillStyle = 'rgba(255,230,109,0.25)';
    ctx.beginPath();
    ctx.moveTo(514, 204);
    ctx.lineTo(600, 170);
    ctx.lineTo(600, 240);
    ctx.lineTo(514, 208);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#a34d2d';
  ctx.beginPath();
  ctx.moveTo(504, 196);
  ctx.lineTo(530, 182);
  ctx.lineTo(556, 196);
  ctx.closePath();
  ctx.fill();

  // The pier from the left.
  ctx.fillStyle = '#6e4525';
  ctx.fillRect(0, 330, 190, 16);
  ctx.fillRect(14, 346, 12, 70);
  ctx.fillRect(80, 346, 12, 70);
  ctx.fillRect(150, 346, 12, 70);
  // Pier lamp: missing on the right.
  if (!on.has('pierlamp')) {
    ctx.strokeStyle = '#2e2118';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(85, 330);
    ctx.lineTo(85, 292);
    ctx.stroke();
    ctx.fillStyle = '#ffe66d';
    ctx.beginPath();
    ctx.arc(85, 284, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,230,109,0.3)';
    ctx.beginPath();
    ctx.arc(85, 284, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  // Crates on the pier: one fewer on the right.
  ctx.fillStyle = '#b98a4e';
  ctx.fillRect(210, 330, 34, 34);
  ctx.fillRect(248, 330, 34, 34);
  ctx.fillRect(229, 296, 34, 34);
  if (!on.has('crates')) ctx.fillRect(282, 330, 34, 34);
  ctx.strokeStyle = '#6e4525';
  ctx.lineWidth = 2;
  for (const [cx, cy] of [[210, 330], [248, 330], [229, 296], [282, 330]]) {
    if (on.has('crates') && cx === 282) continue;
    ctx.strokeRect(cx, cy, 34, 34);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 34, cy + 34);
    ctx.moveTo(cx + 34, cy);
    ctx.lineTo(cx, cy + 34);
    ctx.stroke();
  }
  // Rope coil on the pier: absent on the right.
  if (!on.has('rope')) {
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 5;
    for (const rr of [16, 11, 6]) {
      ctx.beginPath();
      ctx.arc(180, 408, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Sailboat with a flag; the flag points the other way on the right.
  ctx.fillStyle = '#5b4a3a';
  ctx.beginPath();
  ctx.moveTo(240, 330);
  ctx.lineTo(360, 330);
  ctx.lineTo(330, 352);
  ctx.lineTo(270, 352);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5b4a3a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 330);
  ctx.lineTo(300, 190);
  ctx.stroke();
  // Sail: cream on the left, coral on the right.
  ctx.fillStyle = on.has('sail') ? '#ff7b6b' : '#fff3d6';
  ctx.beginPath();
  ctx.moveTo(304, 196);
  ctx.lineTo(304, 326);
  ctx.lineTo(368, 326);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2a9d8f';
  ctx.beginPath();
  ctx.moveTo(296, 210);
  ctx.lineTo(296, 326);
  ctx.lineTo(244, 326);
  ctx.closePath();
  ctx.fill();
  // Flag.
  ctx.fillStyle = '#e4572e';
  ctx.beginPath();
  if (on.has('flag')) {
    ctx.moveTo(300, 190);
    ctx.lineTo(272, 198);
    ctx.lineTo(300, 206);
  } else {
    ctx.moveTo(300, 190);
    ctx.lineTo(328, 198);
    ctx.lineTo(300, 206);
  }
  ctx.closePath();
  ctx.fill();

  // A fish jumps — or doesn't.
  if (on.has('fish')) {
    ctx.fillStyle = '#7fc4d8';
    ctx.beginPath();
    ctx.ellipse(505, 322, 18, 8, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(518, 314);
    ctx.lineTo(530, 306);
    ctx.lineTo(528, 320);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(505, 344, 14, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  // Buoy bobbing in the water: missing on the right.
  if (!on.has('buoy')) {
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.arc(420, 388, 12, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.fillRect(414, 382, 12, 6);
    ctx.fillStyle = '#2e2118';
    ctx.fillRect(418, 372, 4, 10);
  }
}

const HARBOUR_DIFFS = [
  { id: 'fish', x: 505, y: 322, r: 22, points: 140, label: 'Jumping fish' },
  { id: 'flag', x: 300, y: 198, r: 22, points: 120, label: 'Flag direction' },
  { id: 'lampwindow', x: 530, y: 204, r: 20, points: 140, label: 'Lighthouse light' },
  { id: 'gull', x: 150, y: 78, r: 16, points: 150, label: 'Extra gull' },
  { id: 'sail', x: 330, y: 260, r: 34, points: 100, label: 'Sail colour' },
  { id: 'buoy', x: 420, y: 384, r: 18, points: 150, label: 'Missing buoy' },
  { id: 'pierlamp', x: 85, y: 284, r: 20, points: 140, label: 'Pier lamp' },
  { id: 'crates', x: 299, y: 347, r: 26, points: 120, label: 'Crate count' },
  { id: 'star', x: 545, y: 55, r: 14, points: 160, label: 'Extra star' },
  { id: 'rope', x: 180, y: 408, r: 22, points: 130, label: 'Rope coil' },
];

// ---------------------------------------------------------------------------
// Level 3 — Midnight Library. 12 differences, 180 seconds.
// ---------------------------------------------------------------------------
function drawLibrary(ctx, W, H, on) {
  // Room: deep blue walls, warm floor.
  ctx.fillStyle = '#232a4a';
  ctx.fillRect(0, 0, W, 300);
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(0, 300, W, H - 300);
  ctx.fillStyle = '#6e4525';
  for (let fy = 320; fy < H; fy += 26) {
    ctx.fillRect(0, fy, W, 3);
  }

  // Window with the moon; on the right the moon is a star.
  ctx.fillStyle = '#10152e';
  roundRect(ctx, 430, 30, 120, 110, 8);
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(490, 30);
  ctx.lineTo(490, 140);
  ctx.moveTo(430, 85);
  ctx.lineTo(550, 85);
  ctx.stroke();
  if (on.has('moon')) {
    star(ctx, 490, 85, 22, 4, '#ffe66d');
  } else {
    ctx.fillStyle = '#ffeec2';
    ctx.beginPath();
    ctx.arc(490, 85, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8d5a0';
    ctx.beginPath();
    ctx.arc(482, 78, 5, 0, Math.PI * 2);
    ctx.arc(498, 92, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wall clock; hands at a different time on the right.
  ctx.fillStyle = '#f3e2c2';
  ctx.beginPath();
  ctx.arc(520, 180, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5b4a3a';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = '#2e2118';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(520, 180);
  if (on.has('wallclock')) {
    ctx.lineTo(520, 160);
    ctx.moveTo(520, 180);
    ctx.lineTo(536, 188);
  } else {
    ctx.lineTo(510, 164);
    ctx.moveTo(520, 180);
    ctx.lineTo(520, 162);
  }
  ctx.stroke();

  // Bookshelves along the left and centre walls.
  function shelf(x, y, w, count, missingIndex) {
    ctx.fillStyle = '#5b3a22';
    ctx.fillRect(x, y, w, 10);
    ctx.fillRect(x, y - 108, 8, 118);
    ctx.fillRect(x + w - 8, y - 108, 8, 118);
    const colors = ['#c0392b', '#2a9d8f', '#e67e22', '#7d5ba6', '#2e86ab', '#e4572e', '#7cb342'];
    const bw = (w - 16) / count;
    for (let i = 0; i < count; i++) {
      if (missingIndex !== undefined && i === missingIndex) continue;
      ctx.fillStyle = colors[i % colors.length];
      const bh = 62 + ((i * 13) % 30);
      ctx.fillRect(x + 8 + i * bw + 1, y - 8 - bh, bw - 2, bh);
    }
  }
  shelf(24, 150, 190, 7, on.has('books') ? 3 : undefined);
  shelf(24, 270, 190, 6, undefined);
  shelf(240, 150, 170, 6, undefined);

  // Ladder leaning on the shelves; one rung missing on the right.
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(370, 60);
  ctx.lineTo(400, 300);
  ctx.moveTo(398, 60);
  ctx.lineTo(428, 300);
  ctx.stroke();
  ctx.lineWidth = 4;
  for (const [rx, ry] of [[376, 110], [382, 160], [388, 210], [394, 260]]) {
    if (on.has('rung') && ry === 210) continue;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + 26, ry);
    ctx.stroke();
  }

  // Desk with a lamp, a book and a teacup.
  ctx.fillStyle = '#6e4525';
  ctx.fillRect(150, 330, 260, 14);
  ctx.fillRect(160, 344, 12, 86);
  ctx.fillRect(388, 344, 12, 86);
  // Lamp: shade amber on the left, green on the right.
  ctx.fillStyle = '#2e2118';
  ctx.fillRect(146, 330, 8, 34);
  ctx.beginPath();
  ctx.ellipse(150, 368, 26, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = on.has('lampshade') ? '#2a9d8f' : '#ffb703';
  ctx.beginPath();
  ctx.moveTo(126, 296);
  ctx.lineTo(174, 296);
  ctx.lineTo(162, 264);
  ctx.lineTo(138, 264);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,230,109,0.35)';
  ctx.beginPath();
  ctx.moveTo(126, 296);
  ctx.lineTo(174, 296);
  ctx.lineTo(196, 344);
  ctx.lineTo(104, 344);
  ctx.closePath();
  ctx.fill();
  // Book on the desk: open on the left, closed on the right.
  if (on.has('deskbook')) {
    ctx.fillStyle = '#a34d2d';
    roundRect(ctx, 220, 312, 64, 18, 3);
    ctx.fill();
    ctx.fillStyle = '#e8d5a0';
    ctx.fillRect(226, 308, 52, 4);
  } else {
    ctx.fillStyle = '#f3e2c2';
    ctx.beginPath();
    ctx.moveTo(220, 330);
    ctx.lineTo(252, 312);
    ctx.lineTo(284, 330);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(252, 312);
    ctx.lineTo(252, 330);
    ctx.stroke();
    ctx.fillStyle = '#7d5ba6';
    ctx.fillRect(220, 330, 64, 5);
  }
  // Teacup: present on the left, gone on the right.
  if (!on.has('teacup')) {
    ctx.fillStyle = '#e8f1f2';
    roundRect(ctx, 316, 312, 26, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#2e2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(344, 320, 7, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(200,200,200,0.8)';
    ctx.beginPath();
    ctx.moveTo(324, 308);
    ctx.quadraticCurveTo(322, 300, 326, 294);
    ctx.moveTo(334, 308);
    ctx.quadraticCurveTo(336, 300, 332, 294);
    ctx.stroke();
  }

  // Globe on a stand: tilted the other way on the right.
  ctx.fillStyle = '#5b3a22';
  ctx.fillRect(296, 300, 8, 30);
  ctx.beginPath();
  ctx.ellipse(300, 332, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(300, 268);
  ctx.rotate(on.has('globe') ? 0.45 : -0.45);
  ctx.fillStyle = '#2e86ab';
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7cb342';
  ctx.beginPath();
  ctx.ellipse(-8, -8, 10, 7, 0.4, 0, Math.PI * 2);
  ctx.ellipse(10, 10, 8, 6, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Candle on the side table: lit on the left, out on the right.
  ctx.fillStyle = '#5b3a22';
  ctx.fillRect(56, 300, 70, 12);
  ctx.fillRect(62, 312, 8, 40);
  ctx.fillRect(112, 312, 8, 40);
  ctx.fillStyle = '#f3e2c2';
  ctx.fillRect(80, 272, 14, 28);
  if (!on.has('candle')) {
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.ellipse(87, 260, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,183,3,0.3)';
    ctx.beginPath();
    ctx.arc(87, 258, 16, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(87, 270);
    ctx.quadraticCurveTo(84, 262, 88, 254);
    ctx.stroke();
  }

  // Armchair with a sleeping cat — or an empty chair.
  ctx.fillStyle = '#7d5ba6';
  roundRect(ctx, 420, 330, 110, 70, 12);
  ctx.fill();
  ctx.fillStyle = '#6a4a93';
  roundRect(ctx, 420, 300, 110, 44, 12);
  ctx.fill();
  ctx.fillStyle = '#5b3a7a';
  ctx.fillRect(420, 392, 14, 28);
  ctx.fillRect(516, 392, 14, 28);
  if (!on.has('chaircat')) {
    ctx.fillStyle = '#3a2f26';
    ctx.beginPath();
    ctx.ellipse(475, 322, 30, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(500, 312, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(492, 304);
    ctx.lineTo(494, 294);
    ctx.lineTo(499, 303);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(503, 302);
    ctx.lineTo(507, 293);
    ctx.lineTo(510, 303);
    ctx.closePath();
    ctx.fill();
  }

  // Potted plant: fuller on the left, sparse on the right.
  ctx.fillStyle = '#c96f4a';
  ctx.beginPath();
  ctx.moveTo(524, 420);
  ctx.lineTo(566, 420);
  ctx.lineTo(560, 448);
  ctx.lineTo(530, 448);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2e7d32';
  const leaves = [[536, 402], [552, 388], [566, 400], [544, 380], [558, 372]];
  for (const [lx, ly] of leaves) {
    if (on.has('plant') && (lx === 544 || lx === 558)) continue;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 8, 18, (lx - 550) * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rug: one stripe changes colour.
  ctx.fillStyle = '#a34d2d';
  roundRect(ctx, 220, 420, 160, 38, 6);
  ctx.fill();
  ctx.fillStyle = on.has('rug') ? '#2a9d8f' : '#e8d5a0';
  ctx.fillRect(232, 430, 136, 8);
  ctx.fillStyle = '#e8d5a0';
  ctx.fillRect(232, 442, 136, 6);
}

const LIBRARY_DIFFS = [
  { id: 'books', x: 119, y: 120, r: 24, points: 120, label: 'Books on shelf' },
  { id: 'chaircat', x: 475, y: 318, r: 30, points: 130, label: 'Cat on chair' },
  { id: 'globe', x: 300, y: 268, r: 26, points: 120, label: 'Globe tilt' },
  { id: 'wallclock', x: 520, y: 180, r: 22, points: 130, label: 'Wall clock' },
  { id: 'teacup', x: 329, y: 320, r: 16, points: 150, label: 'Teacup' },
  { id: 'candle', x: 87, y: 260, r: 18, points: 150, label: 'Candle flame' },
  { id: 'rung', x: 388, y: 210, r: 20, points: 140, label: 'Ladder rung' },
  { id: 'plant', x: 550, y: 392, r: 22, points: 130, label: 'Plant leaves' },
  { id: 'moon', x: 490, y: 85, r: 20, points: 140, label: 'Moon or star' },
  { id: 'rug', x: 300, y: 434, r: 26, points: 110, label: 'Rug stripe' },
  { id: 'deskbook', x: 252, y: 322, r: 24, points: 120, label: 'Desk book' },
  { id: 'lampshade', x: 150, y: 280, r: 26, points: 110, label: 'Lamp shade' },
];

export const LEVELS = [
  {
    name: 'Morning Market',
    tagline: 'A sleepy market wakes up — 7 differences to find.',
    timeLimit: 120,
    hints: 3,
    draw: drawMarket,
    diffs: MARKET_DIFFS,
  },
  {
    name: 'Harbour at Dusk',
    tagline: 'Lanterns on the pier as the sun goes down — 10 differences.',
    timeLimit: 150,
    hints: 3,
    draw: drawHarbour,
    diffs: HARBOUR_DIFFS,
  },
  {
    name: 'Midnight Library',
    tagline: 'One lamp burning past midnight — 12 differences.',
    timeLimit: 180,
    hints: 3,
    draw: drawLibrary,
    diffs: LIBRARY_DIFFS,
  },
];

export const SCENE_W = 600;
export const SCENE_H = 470;
