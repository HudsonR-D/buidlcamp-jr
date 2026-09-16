import type { ForgeTemplate } from "../types";

// ─── Vibe Lab starter templates ──────────────────────────────────────────────
// Each one is a COMPLETE, self-contained HTML document (inline CSS + JS) that
// runs inside a sandboxed <iframe>. Every game has an "⚙️ TWEAK ZONE" near the
// top of its <script> with SCREAMING_SNAKE constants a camper can change and
// immediately see the effect of, plus a remixQuests ladder that goes from
// "change a number" to "change how the logic works."

const PLATFORMER_CODE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pixel Runner</title>
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body {
    margin: 0; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
    background: linear-gradient(180deg, #1a1440, #0a0820);
    font-family: 'Trebuchet MS', system-ui, sans-serif; color: #fff; padding: 16px;
  }
  h1 { margin: 0; font-size: 1.4rem; letter-spacing: 1px; color: #7CFC00; text-shadow: 0 0 10px rgba(124,252,0,.6); }
  #hud { display: flex; gap: 20px; font-size: 1rem; font-weight: bold; }
  #hud span { color: #FFD700; }
  canvas {
    background: #10142a; border: 4px solid #7CFC00; border-radius: 12px;
    box-shadow: 0 0 30px rgba(124,252,0,.3); max-width: 100%; touch-action: none;
  }
  #controls { display: flex; gap: 16px; }
  #controls button {
    width: 64px; height: 64px; border-radius: 50%; border: none;
    background: #7CFC00; color: #10142a; font-size: 1.5rem; font-weight: bold;
    box-shadow: 0 4px 0 #4a9a00;
  }
  #controls button:active { transform: translateY(2px); box-shadow: 0 2px 0 #4a9a00; }
  #msg {
    position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,.85); padding: 24px 32px; border-radius: 16px;
    text-align: center; display: none;
  }
  #msg button {
    margin-top: 12px; padding: 10px 24px; border-radius: 10px; border: none;
    background: #FFD700; font-weight: bold; font-size: 1rem; cursor: pointer;
  }
</style>
</head>
<body>
  <h1>🏃 PIXEL RUNNER</h1>
  <div id="hud">Lives: <span id="lives">3</span> &nbsp; Time: <span id="time">0</span>s</div>
  <canvas id="game" width="480" height="270"></canvas>
  <div id="controls">
    <button id="btn-left">◀</button>
    <button id="btn-jump">⤴</button>
    <button id="btn-right">▶</button>
  </div>
  <div id="msg">
    <div id="msg-text" style="font-size:1.3rem;font-weight:bold;"></div>
    <button id="msg-btn">Play Again</button>
  </div>

<script>
/* ============================================================
   🏃 PIXEL RUNNER — a tiny platformer you get to remix!
   Read the comments, then go break something in the TWEAK ZONE.
   ============================================================ */

// ⚙️ TWEAK ZONE — change these and press Update!
const JUMP_POWER   = 11;         // how high you jump (bigger = higher)
const GRAVITY      = 0.55;       // how fast you fall (smaller = floatier)
const PLAYER_SPEED = 3.2;        // how fast you run left/right
const PLAYER_COLOR = '#7CFC00';  // your hero's color — try any hex code!

// The level! Each platform is {x, y, w, h}. Add your own rows below.
const platforms = [
  { x: 0,   y: 250, w: 480, h: 20 },   // the ground
  { x: 120, y: 200, w: 80,  h: 14 },
  { x: 250, y: 160, w: 80,  h: 14 },
  { x: 370, y: 120, w: 70,  h: 14 },
];

const GOAL = { x: 420, y: 90, w: 24, h: 30 }; // the flag you run to win

// ─── Everything below makes the game run — read it, don't fear it! ───

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let player, lives, startTime, elapsed, won, keys;

function resetPlayer() {
  player = { x: 20, y: 220, w: 20, h: 24, vx: 0, vy: 0, onGround: false };
}

function newGame() {
  resetPlayer();
  lives = 3;
  startTime = Date.now();
  elapsed = 0;
  won = false;
  document.getElementById('lives').textContent = lives;
  document.getElementById('msg').style.display = 'none';
}

keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

function pressJump() {
  if (player.onGround) {
    player.vy = -JUMP_POWER;
    player.onGround = false;
  }
}

// touch + mouse buttons so this works great on iPad
document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowLeft'] = true; });
document.getElementById('btn-left').addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowLeft'] = false; });
document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowRight'] = true; });
document.getElementById('btn-right').addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowRight'] = false; });
document.getElementById('btn-jump').addEventListener('touchstart', (e) => { e.preventDefault(); pressJump(); });
document.getElementById('btn-left').addEventListener('mousedown', () => keys['ArrowLeft'] = true);
document.getElementById('btn-left').addEventListener('mouseup', () => keys['ArrowLeft'] = false);
document.getElementById('btn-right').addEventListener('mousedown', () => keys['ArrowRight'] = true);
document.getElementById('btn-right').addEventListener('mouseup', () => keys['ArrowRight'] = false);
document.getElementById('btn-jump').addEventListener('mousedown', pressJump);

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function update() {
  if (won) return;

  // left/right + jump
  if (keys['ArrowLeft'] || keys['a']) player.vx = -PLAYER_SPEED;
  else if (keys['ArrowRight'] || keys['d']) player.vx = PLAYER_SPEED;
  else player.vx = 0;

  if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) {
    pressJump();
  }

  // gravity always pulls down
  player.vy += GRAVITY;

  // move, then resolve collisions against every platform
  player.x += player.vx;
  player.y += player.vy;
  player.onGround = false;

  for (const p of platforms) {
    if (rectsOverlap(player, p)) {
      if (player.vy > 0 && player.y + player.h - player.vy <= p.y + 1) {
        // landed on top
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0 && player.y - player.vy >= p.y + p.h) {
        // bonked head on the underside
        player.y = p.y + p.h;
        player.vy = 0;
      } else if (player.vx > 0) {
        player.x = p.x - player.w;
      } else if (player.vx < 0) {
        player.x = p.x + p.w;
      }
    }
  }

  // fell off the world = lose a life
  if (player.y > canvas.height + 40) {
    loseLife();
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  if (rectsOverlap(player, GOAL)) {
    winGame();
  }

  elapsed = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById('time').textContent = elapsed;
}

function loseLife() {
  lives--;
  document.getElementById('lives').textContent = lives;
  if (lives <= 0) {
    showMsg('💀 Out of lives! Give it another go.');
  } else {
    resetPlayer();
  }
}

function winGame() {
  won = true;
  showMsg('🏁 YOU MADE IT! Time: ' + elapsed + 's');
}

function showMsg(text) {
  document.getElementById('msg-text').textContent = text;
  document.getElementById('msg').style.display = 'block';
}

document.getElementById('msg-btn').addEventListener('click', newGame);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#10142a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4a3f7a';
  for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);

  ctx.fillStyle = '#FFD700';
  ctx.fillRect(GOAL.x, GOAL.y, 4, GOAL.h);
  ctx.beginPath();
  ctx.moveTo(GOAL.x + 4, GOAL.y);
  ctx.lineTo(GOAL.x + 22, GOAL.y + 7);
  ctx.lineTo(GOAL.x + 4, GOAL.y + 14);
  ctx.fill();

  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

newGame();
loop();
</script>
</body>
</html>`;

const CLICKER_CODE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Idle Empire</title>
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body {
    margin: 0; min-height: 100vh; background: linear-gradient(180deg, #3b1f00, #1a0e00);
    font-family: 'Trebuchet MS', system-ui, sans-serif; color: #fff;
    display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 14px;
  }
  h1 { margin: 0; color: #FFD166; text-shadow: 0 0 10px rgba(255,209,102,.6); }
  #score { font-size: 2.2rem; font-weight: bold; color: #FFD166; }
  #cps { font-size: 0.95rem; opacity: .8; }
  #cookie {
    font-size: 6rem; background: none; border: none; cursor: pointer;
    filter: drop-shadow(0 6px 10px rgba(0,0,0,.5)); transition: transform .08s;
    touch-action: manipulation;
  }
  #cookie:active { transform: scale(0.9); }
  #shop { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 8px; }
  .item {
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(255,255,255,.08); border: 2px solid rgba(255,209,102,.3);
    border-radius: 12px; padding: 10px 14px; cursor: pointer;
  }
  .item:active { transform: scale(.98); }
  .item.disabled { opacity: .4; cursor: not-allowed; }
  .item-name { font-weight: bold; }
  .item-sub { font-size: .8rem; opacity: .7; }
  .item-cost { color: #7CFC00; font-weight: bold; }
  #floaters { position: fixed; inset: 0; pointer-events: none; }
  .floater { position: absolute; font-weight: bold; color: #FFD166; animation: rise 0.9s ease-out forwards; }
  @keyframes rise { to { transform: translateY(-60px); opacity: 0; } }
</style>
</head>
<body>
  <h1>🍪 IDLE EMPIRE</h1>
  <div id="score">0</div>
  <div id="cps">+0 per second</div>
  <button id="cookie">🍪</button>
  <div id="shop"></div>
  <div id="floaters"></div>

<script>
/* ============================================================
   🍪 IDLE EMPIRE — click, upgrade, and build a cookie empire!
   Everything you can tweak lives in the TWEAK ZONE below.
   ============================================================ */

// ⚙️ TWEAK ZONE — change these and press Update!
const CLICK_VALUE = 1;              // points earned per click
const UPGRADE_COST_GROWTH = 1.15;   // each purchase makes the next one this much pricier
const ITEMS = [                     // add more rows for more upgrades!
  { name: '🍪 Cookie Farm',    baseCost: 15,   cps: 1  },
  { name: '🏭 Cookie Factory', baseCost: 100,  cps: 8  },
  { name: '🚀 Cookie Rocket',  baseCost: 1100, cps: 47 },
];

// ─── Everything below runs the game — read it, don't fear it! ───

let points = 0;
let owned = ITEMS.map(() => 0);

function currentCost(i) {
  return Math.ceil(ITEMS[i].baseCost * Math.pow(UPGRADE_COST_GROWTH, owned[i]));
}

function totalCps() {
  let sum = 0;
  for (let i = 0; i < ITEMS.length; i++) sum += ITEMS[i].cps * owned[i];
  return sum;
}

function fmt(n) {
  return Math.floor(n).toLocaleString();
}

function renderShop() {
  const shop = document.getElementById('shop');
  shop.replaceChildren();

  ITEMS.forEach((item, i) => {
    const cost = currentCost(i);

    const row = document.createElement('div');
    row.className = 'item' + (points < cost ? ' disabled' : '');

    const info = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'item-name';
    name.textContent = item.name;
    const sub = document.createElement('div');
    sub.className = 'item-sub';
    sub.textContent = 'Owned: ' + owned[i] + ' • +' + item.cps + '/sec each';
    info.appendChild(name);
    info.appendChild(sub);

    const costEl = document.createElement('div');
    costEl.className = 'item-cost';
    costEl.textContent = String(fmt(cost));

    row.appendChild(info);
    row.appendChild(costEl);
    row.addEventListener('click', () => buy(i));
    shop.appendChild(row);
  });
}

function buy(i) {
  const cost = currentCost(i);
  if (points < cost) return;
  points -= cost;
  owned[i]++;
  updateDisplay();
}

function spawnFloater(text, x, y) {
  const f = document.createElement('div');
  f.className = 'floater';
  f.textContent = text;
  f.style.left = x + 'px';
  f.style.top = y + 'px';
  document.getElementById('floaters').appendChild(f);
  setTimeout(() => f.remove(), 900);
}

function click(e) {
  points += CLICK_VALUE;
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - 10;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - 10;
  spawnFloater('+' + CLICK_VALUE, x, y);
  updateDisplay();
}

document.getElementById('cookie').addEventListener('click', click);
document.getElementById('cookie').addEventListener('touchstart', (e) => { e.preventDefault(); click(e); });

function updateDisplay() {
  document.getElementById('score').textContent = fmt(points);
  document.getElementById('cps').textContent = '+' + fmt(totalCps()) + ' per second';
  renderShop();
}

// the idle part! every second, add your per-second income automatically
setInterval(() => {
  points += totalCps();
  updateDisplay();
}, 1000);

updateDisplay();
</script>
</body>
</html>`;

const MAZE_CODE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Neon Maze</title>
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body {
    margin: 0; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 14px; background: #0a0a1a;
    font-family: 'Trebuchet MS', system-ui, sans-serif; color: #fff; padding: 16px; touch-action: none;
  }
  h1 { margin: 0; color: #00f0ff; text-shadow: 0 0 12px rgba(0,240,255,.7); }
  #hud { font-size: 1.1rem; font-weight: bold; color: #FFD166; }
  #maze { display: grid; gap: 2px; background: #000; padding: 6px; border-radius: 12px; box-shadow: 0 0 30px rgba(0,240,255,.25); }
  .cell { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 16px; border-radius: 4px; }
  .wall { background: var(--wall-color, #ff00aa); }
  .path { background: #14142a; }
  #arrows { display: grid; grid-template-columns: repeat(3, 56px); grid-template-rows: repeat(2, 56px); gap: 6px; }
  #arrows button { border: none; border-radius: 10px; background: #00f0ff; color: #0a0a1a; font-size: 1.3rem; font-weight: bold; box-shadow: 0 4px 0 #007b85; }
  #arrows button:active { transform: translateY(2px); box-shadow: 0 2px 0 #007b85; }
  #up { grid-column: 2; grid-row: 1; }
  #left { grid-column: 1; grid-row: 2; }
  #down { grid-column: 2; grid-row: 2; }
  #right { grid-column: 3; grid-row: 2; }
  #msg {
    position: fixed; top: 40%; left: 50%; transform: translate(-50%,-50%);
    background: rgba(0,0,0,.9); padding: 24px 32px; border-radius: 16px; text-align: center; display: none;
  }
  #msg button { margin-top: 12px; padding: 10px 24px; border-radius: 10px; border: none; background: #00f0ff; font-weight: bold; cursor: pointer; }
</style>
</head>
<body>
  <h1>🌀 NEON MAZE</h1>
  <div id="hud">⏱ <span id="time">0.0</span>s</div>
  <div id="maze"></div>
  <div id="arrows">
    <button id="up">▲</button>
    <button id="left">◀</button>
    <button id="down">▼</button>
    <button id="right">▶</button>
  </div>
  <div id="msg">
    <div id="msg-text" style="font-size:1.3rem;font-weight:bold;"></div>
    <button id="msg-btn">Play Again</button>
  </div>

<script>
/* ============================================================
   🌀 NEON MAZE — get your emoji from S to the goal!
   The maze layout below is just text — redraw it however you like.
   ============================================================ */

// ⚙️ TWEAK ZONE — change these and press Update!
const MAZE = [
  "###########",
  "#S........#",
  "#.#########",
  "#.........#",
  "#########.#",
  "#.........#",
  "#.#########",
  "#........G#",
  "###########",
];
const WALL_COLOR = '#ff00aa'; // any hex color
const PLAYER_EMOJI = '🐙';
const GOAL_EMOJI = '⭐';

// ─── Everything below reads the MAZE text and runs the game ───

document.documentElement.style.setProperty('--wall-color', WALL_COLOR);

const rows = MAZE.length;
const cols = MAZE[0].length;
let px, py, goalX, goalY, startTime, timerHandle, won;

function findMarkers() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (MAZE[y][x] === 'S') { px = x; py = y; }
      if (MAZE[y][x] === 'G') { goalX = x; goalY = y; }
    }
  }
}
findMarkers();

const mazeEl = document.getElementById('maze');
mazeEl.style.gridTemplateColumns = 'repeat(' + cols + ', 28px)';

function isWall(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return true;
  return MAZE[y][x] === '#';
}

function render() {
  mazeEl.replaceChildren();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = document.createElement('div');
      const ch = MAZE[y][x];
      cell.className = 'cell ' + (ch === '#' ? 'wall' : 'path');
      if (x === px && y === py) cell.textContent = PLAYER_EMOJI;
      else if (x === goalX && y === goalY) cell.textContent = GOAL_EMOJI;
      mazeEl.appendChild(cell);
    }
  }
}

function tryMove(dx, dy) {
  if (won) return;
  const nx = px + dx, ny = py + dy;
  if (isWall(nx, ny)) return;
  px = nx; py = ny;
  render();
  if (px === goalX && py === goalY) win();
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') tryMove(0, -1);
  if (e.key === 'ArrowDown' || e.key === 's') tryMove(0, 1);
  if (e.key === 'ArrowLeft' || e.key === 'a') tryMove(-1, 0);
  if (e.key === 'ArrowRight' || e.key === 'd') tryMove(1, 0);
});

document.getElementById('up').addEventListener('click', () => tryMove(0, -1));
document.getElementById('down').addEventListener('click', () => tryMove(0, 1));
document.getElementById('left').addEventListener('click', () => tryMove(-1, 0));
document.getElementById('right').addEventListener('click', () => tryMove(1, 0));

// swipe support for touch devices
let touchStartX = 0, touchStartY = 0;
document.body.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});
document.body.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > 20) tryMove(dx > 0 ? 1 : -1, 0);
  } else if (Math.abs(dy) > 20) {
    tryMove(0, dy > 0 ? 1 : -1);
  }
});

function startTimer() {
  startTime = Date.now();
  timerHandle = setInterval(() => {
    document.getElementById('time').textContent = ((Date.now() - startTime) / 1000).toFixed(1);
  }, 100);
}

function win() {
  won = true;
  clearInterval(timerHandle);
  const finalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  document.getElementById('msg-text').textContent = '⭐ You escaped in ' + finalTime + 's!';
  document.getElementById('msg').style.display = 'block';
}

function newGame() {
  findMarkers();
  won = false;
  document.getElementById('msg').style.display = 'none';
  clearInterval(timerHandle);
  startTimer();
  render();
}

document.getElementById('msg-btn').addEventListener('click', newGame);

newGame();
</script>
</body>
</html>`;

const DODGER_CODE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Asteroid Dodge</title>
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body {
    margin: 0; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
    background: radial-gradient(circle at 50% 0%, #1a0a2e, #05010f);
    font-family: 'Trebuchet MS', system-ui, sans-serif; color: #fff; padding: 16px;
  }
  h1 { margin: 0; color: #ff5ac4; text-shadow: 0 0 12px rgba(255,90,196,.7); }
  #hud { font-weight: bold; color: #FFD166; }
  canvas {
    background: #05010f; border: 4px solid #ff5ac4; border-radius: 12px;
    box-shadow: 0 0 30px rgba(255,90,196,.3); max-width: 100%; touch-action: none;
  }
  #msg {
    position: fixed; top: 40%; left: 50%; transform: translate(-50%,-50%);
    background: rgba(0,0,0,.9); padding: 24px 32px; border-radius: 16px; text-align: center; display: none;
  }
  #msg button { margin-top: 12px; padding: 10px 24px; border-radius: 10px; border: none; background: #ff5ac4; font-weight: bold; cursor: pointer; }
</style>
</head>
<body>
  <h1>🛸 ASTEROID DODGE</h1>
  <div id="hud">Score: <span id="score">0</span> &nbsp; Best: <span id="best">0</span></div>
  <canvas id="game" width="360" height="480"></canvas>
  <div id="msg">
    <div id="msg-text" style="font-size:1.3rem;font-weight:bold;"></div>
    <button id="msg-btn">Play Again</button>
  </div>

<script>
/* ============================================================
   🛸 ASTEROID DODGE — steer your ship, dodge the rocks!
   The longer you survive, the faster and thicker the asteroids fall.
   ============================================================ */

// ⚙️ TWEAK ZONE — change these and press Update!
const SPAWN_RATE = 45;    // lower = more asteroids (frames between spawns)
const FALL_SPEED = 3;     // how fast asteroids fall
const SHIP_EMOJI = '🛸';
const ROCK_EMOJI = '☄️';

// ─── Everything below runs the game — read it, don't fear it! ───

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const SHIP_W = 34, SHIP_H = 34;

let shipX, rocks, frame, score, best, alive, spawnEvery, fallSpeed;

// Storage is unavailable inside the isolated preview; keep the session score.
best = 0;
try { best = Number(localStorage.getItem('asteroidDodgeBest') || 0); } catch {}
document.getElementById('best').textContent = best;

function newGame() {
  shipX = canvas.width / 2 - SHIP_W / 2;
  rocks = [];
  frame = 0;
  score = 0;
  alive = true;
  spawnEvery = SPAWN_RATE;
  fallSpeed = FALL_SPEED;
  document.getElementById('msg').style.display = 'none';
}

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function pointerToShipX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / rect.width;
  return (clientX - rect.left) * scale - SHIP_W / 2;
}
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  shipX = pointerToShipX(e.touches[0].clientX);
}, { passive: false });
canvas.addEventListener('mousemove', (e) => {
  if (e.buttons === 1) shipX = pointerToShipX(e.clientX);
});

function spawnRock() {
  const size = 24 + Math.random() * 20;
  rocks.push({ x: Math.random() * (canvas.width - size), y: -size, size: size });
}

function update() {
  if (!alive) return;
  frame++;

  if (keys['ArrowLeft'] || keys['a']) shipX -= 5;
  if (keys['ArrowRight'] || keys['d']) shipX += 5;
  shipX = Math.max(0, Math.min(canvas.width - SHIP_W, shipX));

  // difficulty ramps up the longer you survive
  const difficulty = 1 + frame / 1800;
  if (frame % Math.max(10, Math.floor(spawnEvery / difficulty)) === 0) spawnRock();

  for (const r of rocks) r.y += fallSpeed * difficulty;
  rocks = rocks.filter((r) => r.y < canvas.height + 40);

  const shipY = canvas.height - SHIP_H - 12;
  for (const r of rocks) {
    const dx = (shipX + SHIP_W / 2) - (r.x + r.size / 2);
    const dy = (shipY + SHIP_H / 2) - (r.y + r.size / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < (SHIP_W + r.size) / 2 - 8) gameOver();
  }

  score = Math.floor(frame / 6);
  document.getElementById('score').textContent = score;
}

function gameOver() {
  alive = false;
  if (score > best) {
    best = score;
    try { localStorage.setItem('asteroidDodgeBest', String(best)); } catch {}
    document.getElementById('best').textContent = best;
  }
  document.getElementById('msg-text').textContent = '💥 Boom! Score: ' + score;
  document.getElementById('msg').style.display = 'block';
}

document.getElementById('msg-btn').addEventListener('click', newGame);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 53) % canvas.width;
    const sy = (i * 97 + frame) % canvas.height;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const r of rocks) {
    ctx.font = Math.floor(r.size) + 'px sans-serif';
    ctx.fillText(ROCK_EMOJI, r.x + r.size / 2, r.y + r.size / 2);
  }

  ctx.font = SHIP_W + 'px sans-serif';
  ctx.fillText(SHIP_EMOJI, shipX + SHIP_W / 2, canvas.height - SHIP_H / 2 - 12);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

newGame();
loop();
</script>
</body>
</html>`;

const WORLDGEN_CODE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>World Generator</title>
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body {
    margin: 0; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px; background: #0a1a2a;
    font-family: 'Trebuchet MS', system-ui, sans-serif; color: #fff; padding: 16px;
  }
  h1 { margin: 0; color: #4ee7ff; text-shadow: 0 0 12px rgba(78,231,255,.6); }
  #hud { font-size: 0.9rem; opacity: .85; }
  #world { display: grid; gap: 1px; background: #000; padding: 4px; border-radius: 10px; box-shadow: 0 0 30px rgba(78,231,255,.2); }
  .tile { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
  #buttons { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  button { padding: 12px 22px; border-radius: 10px; border: none; background: #4ee7ff; color: #0a1a2a; font-weight: bold; cursor: pointer; font-size: 1rem; }
  button:active { transform: scale(.96); }
</style>
</head>
<body>
  <h1>🌍 WORLD GENERATOR</h1>
  <div id="hud">Seed: <span id="seed-label">0</span></div>
  <div id="world"></div>
  <div id="buttons">
    <button id="regen">🎲 Regenerate</button>
  </div>

<script>
/* ============================================================
   🌍 WORLD GENERATOR — every click makes a brand new island!
   pickTile() below is the "recipe" that turns numbers into biomes.
   ============================================================ */

// ⚙️ TWEAK ZONE — change these and press Update!
const WORLD_SIZE = 18; // width & height in tiles — try making it bigger!
const TILE_EMOJI = {
  water:    '🌊',
  sand:     '🏖️',
  grass:    '🌿',
  forest:   '🌲',
  mountain: '⛰️',
  snow:     '❄️',
};
// elevation goes from 0 (low) to 1 (high) — these are the biome cutoffs
const BIOME_THRESHOLDS = {
  water:    0.32,
  sand:     0.38,
  grass:    0.60,
  forest:   0.78,
  mountain: 0.90,
  // anything higher than mountain becomes snow
};

// pick a biome name for a given elevation value (0..1)
function pickTile(elevation) {
  if (elevation < BIOME_THRESHOLDS.water) return 'water';
  if (elevation < BIOME_THRESHOLDS.sand) return 'sand';
  if (elevation < BIOME_THRESHOLDS.grass) return 'grass';
  if (elevation < BIOME_THRESHOLDS.forest) return 'forest';
  if (elevation < BIOME_THRESHOLDS.mountain) return 'mountain';
  return 'snow';
}

// ─── Everything below generates the noise & draws the grid ───

// a tiny seeded random number generator — same seed always makes the same world!
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// smooth "value noise": scatter random points on a coarse grid, then blend
// between them so nearby tiles share similar elevation (islands, not static)
function makeElevationField(size, rand) {
  const coarse = 5; // spacing between random anchor points
  const gridN = Math.ceil(size / coarse) + 2;
  const anchors = [];
  for (let y = 0; y < gridN; y++) {
    anchors.push([]);
    for (let x = 0; x < gridN; x++) anchors[y].push(rand());
  }
  function smooth(t) { return t * t * (3 - 2 * t); } // smoothstep

  const field = [];
  for (let y = 0; y < size; y++) {
    field.push([]);
    for (let x = 0; x < size; x++) {
      const gx = x / coarse, gy = y / coarse;
      const x0 = Math.floor(gx), y0 = Math.floor(gy);
      const tx = smooth(gx - x0), ty = smooth(gy - y0);
      const a = anchors[y0][x0], b = anchors[y0][x0 + 1];
      const c = anchors[y0 + 1][x0], d = anchors[y0 + 1][x0 + 1];
      const top = a + (b - a) * tx;
      const bottom = c + (d - c) * tx;
      let e = top + (bottom - top) * ty;

      // pull the edges down toward water so islands form naturally
      const cx = size / 2, cy = size / 2;
      const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / (size / 2);
      e = e * (1 - dist * 0.6);

      field[y].push(Math.max(0, Math.min(1, e)));
    }
  }
  return field;
}

const worldEl = document.getElementById('world');
worldEl.style.gridTemplateColumns = 'repeat(' + WORLD_SIZE + ', 24px)';

function generate(seed) {
  document.getElementById('seed-label').textContent = seed;
  const rand = mulberry32(seed);
  const field = makeElevationField(WORLD_SIZE, rand);

  worldEl.replaceChildren();
  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      const tileType = pickTile(field[y][x]);
      const cell = document.createElement('div');
      cell.className = 'tile';
      cell.textContent = TILE_EMOJI[tileType];
      cell.title = tileType + ' (' + field[y][x].toFixed(2) + ')';
      worldEl.appendChild(cell);
    }
  }
}

document.getElementById('regen').addEventListener('click', () => {
  generate(Math.floor(Math.random() * 1000000));
});

generate(Math.floor(Math.random() * 1000000));
</script>
</body>
</html>`;

export const FORGE_TEMPLATES: ForgeTemplate[] = [
  {
    id: "platformer",
    name: "Pixel Runner",
    icon: "🏃",
    tagline:
      "Jump across platforms and reach the flag. Classic canvas platformer physics.",
    minTier: "Bronze",
    code: PLATFORMER_CODE,
    remixQuests: [
      {
        title: "Jump higher",
        hint: "Find JUMP_POWER near the top of the script and make the number bigger.",
      },
      {
        title: "Speed run",
        hint: "Change PLAYER_SPEED to make your runner zoom across the level.",
      },
      {
        title: "Moon gravity",
        hint: "Lower GRAVITY so your jumps float longer, like you're on the moon.",
      },
      {
        title: "Recolor your hero",
        hint: 'Change PLAYER_COLOR to any hex code — try "#ff00aa" or "#00ffff".',
      },
      {
        title: "Add a new platform",
        hint: "Find the platforms array and add a new { x, y, w, h } object of your own.",
      },
      {
        title: "Make double jump possible",
        hint: "Look at the pressJump() function — add a counter so the player can jump a second time while in the air.",
      },
    ],
  },
  {
    id: "clicker",
    name: "Idle Empire",
    icon: "🍪",
    tagline:
      "Click for cookies, buy upgrades, and watch your empire grow even while you're not clicking.",
    minTier: "Bronze",
    code: CLICKER_CODE,
    remixQuests: [
      {
        title: "Double your clicks",
        hint: "Find CLICK_VALUE and make it bigger — every click is worth more.",
      },
      {
        title: "Cheaper upgrades",
        hint: "Lower UPGRADE_COST_GROWTH so prices don't climb as fast.",
      },
      {
        title: "Add a new item",
        hint: "Copy a row in the ITEMS array and give it a new name, baseCost, and cps.",
      },
      {
        title: "Golden cookie bonus",
        hint: "Find the click() function and add a random chance (Math.random()) for a big bonus.",
      },
      {
        title: "Speed up a factory",
        hint: "Change the cps value on one of the ITEMS to make it produce faster.",
      },
      {
        title: "Add a mega-upgrade",
        hint: "Add one more object to ITEMS with a huge baseCost and huge cps for late-game players.",
      },
    ],
  },
  {
    id: "maze",
    name: "Neon Maze",
    icon: "🌀",
    tagline:
      "Guide your emoji from S to the goal through a glowing maze, racing the clock.",
    minTier: "Bronze",
    code: MAZE_CODE,
    remixQuests: [
      {
        title: "Redraw the maze",
        hint: 'Edit the MAZE array of text rows — "#" is a wall, "." is a path. Keep S and G somewhere reachable!',
      },
      {
        title: "Change the wall color",
        hint: "Edit WALL_COLOR to any hex code for a totally different neon vibe.",
      },
      {
        title: "Swap your character",
        hint: "Change PLAYER_EMOJI to your favorite emoji.",
      },
      {
        title: "Change the goal",
        hint: "Change GOAL_EMOJI to something else — a trophy, a diamond, anything!",
      },
      {
        title: "Build a bigger maze",
        hint: "Add more rows and columns to MAZE (keep every row the same length).",
      },
      {
        title: "Add a second goal",
        hint: "Advanced: add a new marker letter and update the win() check to look for either goal.",
      },
    ],
  },
  {
    id: "dodger",
    name: "Asteroid Dodge",
    icon: "🛸",
    tagline:
      "Steer your ship left and right to dodge falling asteroids — survive as long as you can!",
    minTier: "Silver",
    code: DODGER_CODE,
    remixQuests: [
      {
        title: "More chaos",
        hint: "Lower SPAWN_RATE so asteroids fall more often.",
      },
      {
        title: "Faster falls",
        hint: "Raise FALL_SPEED to make asteroids drop quicker.",
      },
      { title: "New ship", hint: "Change SHIP_EMOJI to any emoji you like." },
      {
        title: "New hazard",
        hint: "Change ROCK_EMOJI — what if the sky was raining something else entirely?",
      },
      {
        title: "Slower difficulty ramp",
        hint: 'Find "frame / 1800" inside update() and make the number bigger so the game stays easy longer.',
      },
      {
        title: "Add a shield power-up",
        hint: 'Advanced: spawn a rare item that, when "collected," gives one free hit.',
      },
    ],
  },
  {
    id: "worldgen",
    name: "World Generator",
    icon: "🌍",
    tagline:
      "Generate an endless variety of procedural islands with biomes, from beaches to snowy peaks.",
    minTier: "Silver",
    code: WORLDGEN_CODE,
    remixQuests: [
      {
        title: "Bigger world",
        hint: "Increase WORLD_SIZE to generate a larger map.",
      },
      {
        title: "More mountains",
        hint: "Lower the mountain threshold in BIOME_THRESHOLDS so peaks appear more often.",
      },
      {
        title: "Change the look",
        hint: "Swap any emoji in TILE_EMOJI for a different one.",
      },
      {
        title: "Add a new biome",
        hint: "Copy a rule inside pickTile() — add a new threshold and a matching entry in TILE_EMOJI and BIOME_THRESHOLDS.",
      },
      {
        title: "Less island, more continent",
        hint: 'Find the "dist * 0.6" line inside makeElevationField() and lower the number so edges sink less.',
      },
      {
        title: "Rougher terrain",
        hint: "Advanced: lower the coarse variable so anchor points sit closer together, making bumpier terrain.",
      },
    ],
  },
];
