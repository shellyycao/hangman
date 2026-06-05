'use strict';

const MAX_WRONG = 12; // 6 body + 6 clothing stages

// ── State ──────────────────────────────────────────────────────────────────
let secretWord = '';
let hint       = '';
let guessed    = new Set();
let wrongCount = 0;
let gameOver   = false;

// ── Screen helpers ─────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Canvas ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('hangman-canvas');
const ctx    = canvas.getContext('2d');

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawHangman(n, won = false) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';

  // ── Gallows ──
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth   = 4;
  line(20, 240, 180, 240);
  line(60, 240, 60,  20);
  line(60,  20, 140, 20);
  line(140, 20, 140, 50);

  if (n === 0) { if (won) drawWinDecorations(); return; }

  const dead = n >= 6;

  // ── Stage 7+: hat (drawn behind head) ──
  if (n >= 7) drawHat();

  // ── Head ──
  if (n >= 1) {
    ctx.strokeStyle = '#fffffe';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.arc(140, 70, 20, 0, Math.PI * 2);
    ctx.stroke();

    if (dead) {
      // XX eyes
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      line(129, 61, 137, 69); line(137, 61, 129, 69); // left X
      line(143, 61, 151, 69); line(151, 61, 143, 69); // right X
      // Wavy dead mouth
      ctx.strokeStyle = '#fffffe';
      ctx.beginPath();
      ctx.moveTo(132, 79); ctx.lineTo(136, 76); ctx.lineTo(140, 79);
      ctx.lineTo(144, 76); ctx.lineTo(148, 79);
      ctx.stroke();
    } else {
      // Normal worried eyes + mouth
      ctx.fillStyle = '#fffffe';
      ctx.beginPath(); ctx.arc(133, 65, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(147, 65, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fffffe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(140, 74, 5, 0.3, Math.PI - 0.3);
      ctx.stroke();
    }
  }

  // ── Body ──
  ctx.strokeStyle = '#fffffe';
  ctx.lineWidth   = 3;
  if (n >= 2) line(140, 90, 140, 160);
  if (n >= 3) line(140, 110, 110, 145);
  if (n >= 4) line(140, 110, 170, 145);
  if (n >= 5) line(140, 160, 110, 200);
  if (n >= 6) line(140, 160, 170, 200);

  // ── Clothing stages ──
  if (n >= 8)  drawShirt();
  if (n >= 9)  drawPants();
  if (n >= 10) drawShoes();
  if (n >= 11) drawTie();
  if (n >= 12) drawScarf();

  if (won) drawWinDecorations();
}

// ── Clothing helpers ───────────────────────────────────────────────────────
function drawHat() {
  ctx.fillStyle   = '#1a1a2e';
  ctx.strokeStyle = '#fffffe';
  ctx.lineWidth   = 2;
  ctx.fillRect(126, 49, 28, 4);  ctx.strokeRect(126, 49, 28, 4);  // brim
  ctx.fillRect(131, 36, 18, 14); ctx.strokeRect(131, 36, 18, 14); // crown
}

function drawShirt() {
  ctx.strokeStyle = '#74c0fc';
  ctx.lineWidth   = 2;
  // collar V
  ctx.beginPath();
  ctx.moveTo(136, 92); ctx.lineTo(140, 100); ctx.lineTo(144, 92);
  ctx.stroke();
  // buttons
  ctx.fillStyle = '#74c0fc';
  [110, 122, 134, 146].forEach(y => {
    ctx.beginPath(); ctx.arc(140, y, 2, 0, Math.PI * 2); ctx.fill();
  });
}

function drawPants() {
  ctx.strokeStyle = '#4dabf7';
  ctx.lineWidth   = 2;
  ctx.strokeRect(131, 158, 18, 5); // belt
  // pant inner seams
  line(132, 163, 120, 197);
  line(148, 163, 160, 197);
}

function drawShoes() {
  ctx.fillStyle   = '#868e96';
  ctx.strokeStyle = '#868e96';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.ellipse(107, 204, 11, 5, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(173, 204, 11, 5,  0.25, 0, Math.PI * 2); ctx.fill();
}

function drawTie() {
  ctx.fillStyle = '#f03e3e';
  ctx.beginPath();
  ctx.moveTo(138, 101); ctx.lineTo(134, 112);
  ctx.lineTo(140, 152); ctx.lineTo(146, 112);
  ctx.lineTo(142, 101);
  ctx.closePath();
  ctx.fill();
}

function drawScarf() {
  ctx.strokeStyle = '#ff922b';
  ctx.lineWidth   = 5;
  ctx.beginPath();
  ctx.arc(140, 92, 14, Math.PI + 0.4, -0.4);
  ctx.stroke();
  line(126, 97, 116, 120);
}

// ── Win decorations ────────────────────────────────────────────────────────
function drawWinDecorations() {
  // Flowers along the base
  [[32, 233, '#ff6b6b'], [100, 233, '#69db7c'], [168, 233, '#ffd43b']].forEach(([x, y, c]) => drawFlower(x, y, c));

  // Banner text on beam
  ctx.fillStyle = '#ffd43b';
  ctx.font      = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎉 YOU WIN!', 98, 16);

  // Birds perched on pole
  drawBird(48, 14);
  drawBird(68, 10);
}

function drawFlower(cx, cy, color) {
  ctx.fillStyle = color;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, 4, 2.5, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd43b';
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
}

function drawBird(x, y) {
  ctx.strokeStyle = '#fffffe';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.arc(x - 4, y, 4, Math.PI, 0);
  ctx.arc(x + 4, y, 4, Math.PI, 0);
  ctx.stroke();
}

// ── Word display ───────────────────────────────────────────────────────────
function renderWord(reveal = false) {
  document.getElementById('word-display').innerHTML = secretWord
    .split('')
    .map(ch => {
      if (ch === ' ') return '<div class="letter-box space"></div>';
      if (guessed.has(ch)) return `<div class="letter-box">${ch}</div>`;
      if (reveal)          return `<div class="letter-box reveal-miss">${ch}</div>`;
      return '<div class="letter-box"></div>';
    })
    .join('');
}

// ── Keyboard ───────────────────────────────────────────────────────────────
function buildKeyboard() {
  const kb = document.getElementById('keyboard');
  kb.innerHTML = '';
  for (let i = 97; i <= 122; i++) {
    const ch  = String.fromCharCode(i);
    const btn = document.createElement('button');
    btn.className     = 'key-btn';
    btn.textContent   = ch;
    btn.dataset.letter = ch;
    btn.addEventListener('click', () => handleGuess(ch));
    kb.appendChild(btn);
  }
}

function updateKeyboard() {
  document.querySelectorAll('.key-btn').forEach(btn => {
    const ch = btn.dataset.letter;
    if (guessed.has(ch)) {
      btn.disabled = true;
      btn.classList.add(secretWord.includes(ch) ? 'correct' : 'wrong');
    }
  });
}

// ── Guess logic ────────────────────────────────────────────────────────────
function handleGuess(ch) {
  if (gameOver || guessed.has(ch)) return;
  guessed.add(ch);
  if (!secretWord.includes(ch)) wrongCount++;

  document.getElementById('wrong-count').textContent = wrongCount;
  drawHangman(wrongCount);
  renderWord();
  updateKeyboard();

  const allRevealed = secretWord.split('').every(c => c === ' ' || guessed.has(c));
  if (allRevealed) {
    gameOver = true;
    endGame(true);
  } else if (wrongCount >= MAX_WRONG) {
    gameOver = true;
    endGame(false);
  }

  // After 6 wrong: show "dead" notice in the wrong label
  const label = document.querySelector('.wrong-label');
  if (wrongCount >= 6 && !allRevealed && wrongCount < MAX_WRONG) {
    label.innerHTML = `Wrong: <span id="wrong-count">${wrongCount}</span> / 12 &nbsp;<span style="color:#ff6b6b;font-size:0.75rem">💀 still going…</span>`;
  } else {
    document.getElementById('wrong-count').textContent = wrongCount;
  }
}

// ── End game ───────────────────────────────────────────────────────────────
function endGame(won) {
  renderWord(!won);
  document.querySelectorAll('.key-btn').forEach(b => (b.disabled = true));

  // Redraw with win decorations if player won
  drawHangman(wrongCount, won);

  // Brief pause so the player sees the canvas update before screen switches
  setTimeout(() => {
    const banner = document.getElementById('result-banner');
    banner.className = 'result-banner ' + (won ? 'win' : 'lose');
    banner.textContent = won ? 'You got it! 🎉' : 'Game over!';

    document.getElementById('result-word').textContent = secretWord.toUpperCase();

    saveHistory(secretWord, hint, won);
    showScreen('result-screen');
    fetchDefinition(secretWord);
  }, 800);
}

// ── Dictionary / Wikipedia lookup ─────────────────────────────────────────
async function fetchDefinition(word) {
  const box = document.getElementById('definition-box');

  // 1. Try Free Dictionary API
  try {
    const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (res.ok) {
      const data  = await res.json();
      const entry = data[0];
      const html  = entry.meanings.slice(0, 3).map(m => {
        const def = m.definitions[0].definition;
        return `<div class="meaning"><span class="pos-tag">${m.partOfSpeech}</span>${def}</div>`;
      }).join('');
      box.innerHTML = html + `<p class="def-source">Source: <a href="https://dictionaryapi.dev" target="_blank">Free Dictionary API</a></p>`;
      return;
    }
  } catch (_) {}

  // 2. Fallback: Wikipedia summary
  try {
    const res  = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.extract) {
        const pageUrl = data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(word)}`;
        box.innerHTML = `<div class="meaning">${data.extract}</div>
          <p class="def-source">Source: <a href="${pageUrl}" target="_blank">Wikipedia</a></p>`;
        return;
      }
    }
  } catch (_) {}

  box.innerHTML = '<div class="meaning" style="color:#3d3d5c;font-style:italic;">No definition found for this word.</div>';
}

// ── History (localStorage) ─────────────────────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem('hangman-history') || '[]'); }
  catch (_) { return []; }
}

function saveHistory(word, wordHint, won) {
  const entry   = { word, hint: wordHint, won, date: new Date().toLocaleDateString(), def: '' };
  const history = getHistory();
  // Avoid duplicate consecutive entries for the same word
  if (history.length && history[0].word === word) return;
  history.unshift(entry);
  localStorage.setItem('hangman-history', JSON.stringify(history.slice(0, 100)));
}

function renderHistory() {
  const list    = document.getElementById('history-list');
  const history = getHistory();

  if (!history.length) {
    list.innerHTML = '<p class="no-history">No games played yet.</p>';
    return;
  }

  list.innerHTML = history.map(e => `
    <div class="history-item">
      <div class="history-item-header">
        <span class="history-word">${e.word}</span>
        <span class="history-badge ${e.won ? 'win' : 'lose'}">${e.won ? 'Won' : 'Lost'}</span>
      </div>
      ${e.hint ? `<p class="history-def" style="color:#a7a9be;margin-bottom:4px">Hint: ${e.hint}</p>` : ''}
      <p class="history-def">${e.defText || 'No definition cached.'}</p>
      <p class="history-date">${e.date}</p>
    </div>`).join('');
}

function openHistory() {
  renderHistory();
  document.getElementById('history-modal').classList.remove('hidden');
}

function closeHistory() {
  document.getElementById('history-modal').classList.add('hidden');
}

// ── Game start ─────────────────────────────────────────────────────────────
function startGame() {
  const wordInput = document.getElementById('word-input');
  const hintInput = document.getElementById('hint-input');
  const errEl     = document.getElementById('setup-error');

  const raw = wordInput.value.trim().toLowerCase();
  if (!raw) { errEl.textContent = 'Please enter a word.'; return; }
  if (!/^[a-z ]+$/.test(raw)) { errEl.textContent = 'Only letters and spaces, please.'; return; }
  errEl.textContent = '';

  secretWord = raw;
  hint       = hintInput.value.trim();
  wordInput.value = '';
  hintInput.value = '';

  showScreen('handoff-screen');
}

function beginGuessing() {
  guessed    = new Set();
  wrongCount = 0;
  gameOver   = false;

  document.getElementById('wrong-count').textContent = 0;
  document.getElementById('hint-display').textContent = hint ? `Hint: ${hint}` : '';

  drawHangman(0);
  renderWord();
  buildKeyboard();
  showScreen('game-screen');
}

// ── Event listeners ────────────────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', startGame);

document.getElementById('word-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') startGame();
});

document.getElementById('ready-btn').addEventListener('click', beginGuessing);

document.getElementById('play-again-btn').addEventListener('click', () => {
  showScreen('setup-screen');
});

document.getElementById('open-history-btn').addEventListener('click', openHistory);
document.getElementById('result-history-btn').addEventListener('click', openHistory);
document.getElementById('close-history-btn').addEventListener('click', closeHistory);

document.getElementById('history-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeHistory();
});

document.addEventListener('keydown', e => {
  const ch = e.key.toLowerCase();
  if (/^[a-z]$/.test(ch) && document.getElementById('game-screen').classList.contains('active')) {
    handleGuess(ch);
  }
});
