'use strict';

const MAX_WRONG = 6;

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

function drawHangman(n) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gallows
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth   = 4;
  ctx.lineCap     = 'round';
  line(20, 240, 180, 240);
  line(60, 240, 60,  20);
  line(60,  20, 140, 20);
  line(140, 20, 140, 50);

  if (n === 0) return;

  ctx.strokeStyle = '#fffffe';
  ctx.fillStyle   = '#fffffe';
  ctx.lineWidth   = 3;

  if (n >= 1) { ctx.beginPath(); ctx.arc(140, 70, 20, 0, Math.PI * 2); ctx.stroke(); }
  if (n >= 2) line(140, 90, 140, 160);
  if (n >= 3) line(140, 110, 110, 145);
  if (n >= 4) line(140, 110, 170, 145);
  if (n >= 5) line(140, 160, 110, 200);
  if (n >= 6) line(140, 160, 170, 200);
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
}

// ── End game ───────────────────────────────────────────────────────────────
function endGame(won) {
  renderWord(!won);
  document.querySelectorAll('.key-btn').forEach(b => (b.disabled = true));

  const banner = document.getElementById('result-banner');
  banner.className = 'result-banner ' + (won ? 'win' : 'lose');
  banner.textContent = won ? 'You got it!' : 'Game over!';

  document.getElementById('result-word').textContent = secretWord.toUpperCase();

  saveHistory(secretWord, hint, won);
  showScreen('result-screen');
  fetchDefinition(secretWord);
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
