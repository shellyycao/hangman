'use strict';

// ── State ──────────────────────────────────────────────────────────────────
let secretWord = '';
let hint       = '';
let guessed    = new Set();
let wrongCount = 0;
let gameOver   = false;

// ── Tab switching ──────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${target}`).classList.add('active');
    if (target === 'history')    renderHistory();
    if (target === 'vocabulary') renderVocabulary();
  });
});

function switchToTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
  if (name === 'vocabulary') renderVocabulary();
}

// ── Screen helpers ─────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Canvas ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('hangman-canvas');
const ctx    = canvas.getContext('2d');

function line(x1, y1, x2, y2) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

function drawHangman(n, won = false) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Win confetti/decorations behind gallows
  if (won) drawWinBg();

  // ── Gallows (gradient wood) ──
  const galGrad = ctx.createLinearGradient(60, 240, 60, 20);
  galGrad.addColorStop(0, '#ff9f43');
  galGrad.addColorStop(1, '#ff6348');
  ctx.strokeStyle = galGrad;
  ctx.lineWidth   = 5;
  line(20, 240, 180, 240);
  line(60, 240, 60, 20);
  line(60, 20, 140, 20);
  ctx.strokeStyle = '#ffd32a'; // golden rope
  ctx.lineWidth   = 3;
  line(140, 20, 140, 50);

  if (n === 0) { if (won) drawWinFg(); return; }

  const dead = n >= 6;

  // ── Cape (stage 12, behind body) ──
  if (n >= 12) drawCape();

  // ── Party hat (stage 7, behind head) ──
  if (n >= 7) drawPartyHat();

  // ── Head ──
  if (n >= 1) {
    ctx.fillStyle   = dead ? '#c0bedd' : '#ffcba4';
    ctx.strokeStyle = dead ? '#9090b8' : '#e8a87c';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(140, 70, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (dead) {
      // XX eyes
      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth   = 2.5;
      line(129, 61, 137, 69); line(137, 61, 129, 69);
      line(143, 61, 151, 69); line(151, 61, 143, 69);
      // Wavy dead mouth
      ctx.strokeStyle = '#9090b8';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(132, 79); ctx.lineTo(136, 76); ctx.lineTo(140, 79);
      ctx.lineTo(144, 76); ctx.lineTo(148, 79);
      ctx.stroke();
    } else {
      // Alive: purple dot eyes + worried mouth
      ctx.fillStyle = '#6c5ce7';
      ctx.beginPath(); ctx.arc(133, 65, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(147, 65, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6c5ce7';
      ctx.lineWidth   = 2;
      ctx.beginPath(); ctx.arc(140, 74, 5, 0.3, Math.PI - 0.3); ctx.stroke();
    }
  }

  // ── Sunglasses (stage 8, over face) ──
  if (n >= 8) drawSunglasses();

  // ── Body / limbs ──
  ctx.strokeStyle = '#fffffe';
  ctx.lineWidth   = 3;
  if (n >= 2) line(140, 90, 140, 160);
  if (n >= 3) line(140, 110, 110, 145);
  if (n >= 4) line(140, 110, 170, 145);
  if (n >= 5) line(140, 160, 110, 200);
  if (n >= 6) line(140, 160, 170, 200);

  // ── Hand accessories ──
  if (n >= 11) drawBowTie();
  if (n >= 9)  drawBalloon();   // held in left hand
  if (n >= 10) drawIceCream();  // held in right hand

  if (won) drawWinFg();
}

// ── Accessories ────────────────────────────────────────────────────────────
function drawPartyHat() {
  // Cone
  ctx.fillStyle = '#ff4757';
  ctx.beginPath();
  ctx.moveTo(122, 52); ctx.lineTo(152, 19); ctx.lineTo(160, 52);
  ctx.closePath();
  ctx.fill();
  // Stripes
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffd32a';
  line(133, 30, 156, 30);
  ctx.strokeStyle = '#2ed573';
  line(128, 39, 157, 39);
  // Brim
  ctx.fillStyle = '#c0392b';
  ctx.strokeStyle = '#ffd32a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(141, 52, 21, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Pompom
  ctx.fillStyle = '#ffd32a';
  ctx.beginPath(); ctx.arc(152, 19, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff4757';
  ctx.beginPath(); ctx.arc(152, 19, 3, 0, Math.PI * 2); ctx.fill();
}

function drawSunglasses() {
  ctx.fillStyle   = 'rgba(116,185,255,0.42)';
  ctx.strokeStyle = '#74b9ff';
  ctx.lineWidth   = 2.5;
  ctx.beginPath(); ctx.arc(130, 65, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(150, 65, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  line(139, 64, 141, 64);  // bridge
  ctx.strokeStyle = '#74b9ff';
  ctx.lineWidth   = 2;
  line(121, 66, 113, 70);  // left arm
  line(159, 66, 167, 70);  // right arm
  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(126, 61, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(146, 61, 3, 0, Math.PI * 2); ctx.fill();
}

function drawBalloon() {
  // String (curved) from left hand (110,145) up to balloon
  ctx.strokeStyle = '#ffd32a';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(110, 145);
  ctx.bezierCurveTo(105, 135, 95, 125, 88, 113);
  ctx.stroke();
  // Balloon body
  ctx.fillStyle   = '#ff4757';
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.ellipse(88, 100, 14, 17, -0.15, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Tie
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(88, 117); ctx.lineTo(84, 122); ctx.lineTo(92, 122);
  ctx.closePath(); ctx.fill();
  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.ellipse(82, 93, 4, 6, -0.5, 0, Math.PI * 2); ctx.fill();
}

function drawIceCream() {
  // Cone (right hand at 170,145)
  ctx.fillStyle   = '#fd9644';
  ctx.strokeStyle = '#e67e22';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(175, 143); ctx.lineTo(169, 167); ctx.lineTo(193, 167);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Cone lines
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth   = 1;
  line(175, 143, 169, 167);
  line(181, 143, 185, 167);
  // Scoop
  ctx.fillStyle   = '#fd79a8';
  ctx.strokeStyle = '#e84393';
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.arc(183, 136, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Swirl
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.arc(183, 136, 7, Math.PI * 1.2, Math.PI * 2.2); ctx.stroke();
  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.ellipse(178, 131, 4, 3, -0.4, 0, Math.PI * 2); ctx.fill();
}

function drawBowTie() {
  const cx = 140, cy = 92;
  ctx.fillStyle   = '#26d0ce';
  ctx.strokeStyle = '#1a9e99';
  ctx.lineWidth   = 1.5;
  // Left wing
  ctx.beginPath();
  ctx.moveTo(cx - 13, cy - 6); ctx.lineTo(cx, cy); ctx.lineTo(cx - 13, cy + 6);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(cx + 13, cy - 6); ctx.lineTo(cx, cy); ctx.lineTo(cx + 13, cy + 6);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Knot
  ctx.fillStyle   = '#148a87';
  ctx.strokeStyle = '#1a9e99';
  ctx.beginPath(); ctx.ellipse(cx, cy, 5, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Dots
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.arc(cx - 8, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 8, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
}

function drawCape() {
  const capeGrad = ctx.createLinearGradient(95, 105, 185, 215);
  capeGrad.addColorStop(0, '#a29bfe');
  capeGrad.addColorStop(1, '#6c5ce7');
  ctx.fillStyle   = capeGrad;
  ctx.strokeStyle = '#6c5ce7';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(125, 95);
  ctx.bezierCurveTo(108, 135, 88, 175, 93, 215);
  ctx.bezierCurveTo(115, 220, 162, 222, 185, 215);
  ctx.bezierCurveTo(190, 178, 172, 135, 155, 95);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
}

// ── Win decorations ────────────────────────────────────────────────────────
function drawWinBg() {
  // Confetti rectangles
  [
    [15,45,'#ff4757'],[32,95,'#ffd32a'],[183,62,'#2ed573'],
    [170,158,'#74b9ff'],[18,188,'#fd79a8'],[190,200,'#a29bfe'],
    [10,130,'#26d0ce'],[190,108,'#fd9644'],[160,32,'#fd79a8'],[26,55,'#a29bfe']
  ].forEach(([x, y, c]) => {
    ctx.fillStyle = c;
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.5);
    ctx.fillRect(-5, -2, 10, 4);
    ctx.restore();
  });
}

function drawWinFg() {
  // Flowers along base
  [[32, 234, '#ff4757'], [100, 234, '#2ed573'], [165, 234, '#ffd32a']].forEach(([x,y,c]) => drawFlower(x,y,c));
  // Stars
  [[174,38,'#ffd32a'],[23,72,'#fd79a8'],[183,140,'#74b9ff']].forEach(([x,y,c]) => drawStar(x,y,c));
  // Birds on beam
  drawBird(50, 13); drawBird(72, 9);
  // Banner
  ctx.fillStyle = '#ffd32a';
  ctx.font      = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎉 YOU WIN! 🎉', 100, 17);
}

function drawFlower(cx, cy, color) {
  ctx.fillStyle = color;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a)*6, cy + Math.sin(a)*6, 4, 2.5, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff8b0';
  ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2); ctx.fill();
}

function drawStar(cx, cy, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI / 5) - Math.PI / 2;
    const r = i % 2 === 0 ? 7 : 3;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill();
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
function renderWord() {
  document.getElementById('word-display').innerHTML = secretWord
    .split('')
    .map(ch => {
      if (ch === ' ')        return '<div class="letter-box space"></div>';
      if (guessed.has(ch))   return `<div class="letter-box revealed">${ch}</div>`;
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
    btn.className      = 'key-btn';
    btn.textContent    = ch;
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

// ── Guess logic (no wrong limit) ───────────────────────────────────────────
function handleGuess(ch) {
  if (gameOver || guessed.has(ch)) return;
  guessed.add(ch);
  if (!secretWord.includes(ch)) wrongCount++;

  // Cap drawing stages at 12 — game itself is unlimited
  drawHangman(Math.min(wrongCount, 12));
  renderWord();
  updateKeyboard();
  document.getElementById('wrong-count').textContent = wrongCount;

  const allRevealed = secretWord.split('').every(c => c === ' ' || guessed.has(c));
  if (allRevealed) {
    gameOver = true;
    endGame();
  }
}

// ── End game (always a win) ────────────────────────────────────────────────
function endGame() {
  document.querySelectorAll('.key-btn').forEach(b => (b.disabled = true));
  drawHangman(Math.min(wrongCount, 12), true);

  setTimeout(() => {
    const banner = document.getElementById('result-banner');
    banner.className   = 'result-banner win';
    banner.textContent = wrongCount === 0 ? 'Perfect! No wrong guesses! 🎉' : 'You got it! 🎉';

    document.getElementById('result-word').textContent = secretWord.toUpperCase();
    document.getElementById('wrong-summary').textContent =
      wrongCount === 0
        ? 'Flawless — not a single wrong guess!'
        : `It took ${wrongCount} wrong guess${wrongCount === 1 ? '' : 'es'} to get there.`;

    saveHistory(secretWord, hint, wrongCount);
    showScreen('result-screen');
    fetchAndCacheDefinition(secretWord);
  }, 700);
}

// ── Dictionary / Wikipedia ─────────────────────────────────────────────────
async function fetchAndCacheDefinition(word) {
  const box = document.getElementById('definition-box');
  const cached = getVocabEntry(word);

  if (cached) {
    box.innerHTML = renderDefinitionHTML(cached);
    return;
  }

  // Try Free Dictionary API
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (res.ok) {
      const data  = await res.json();
      const entry = data[0];
      const vocab = {
        word,
        phonetic:  entry.phonetic || (entry.phonetics.find(p => p.text)?.text ?? ''),
        meanings:  entry.meanings.slice(0, 3).map(m => ({
          pos:     m.partOfSpeech,
          def:     m.definitions[0]?.definition ?? '',
          example: m.definitions[0]?.example    ?? '',
        })),
        source:    'dictionary',
        sourceUrl: entry.sourceUrls?.[0] ?? 'https://dictionaryapi.dev',
        dateAdded: new Date().toLocaleDateString(),
      };
      saveVocabEntry(vocab);
      box.innerHTML = renderDefinitionHTML(vocab);
      return;
    }
  } catch (_) {}

  // Fallback: Wikipedia
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.extract) {
        const pageUrl = data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(word)}`;
        const vocab = {
          word,
          phonetic:  '',
          meanings:  [{ pos: '', def: data.extract, example: '' }],
          source:    'wikipedia',
          sourceUrl: pageUrl,
          dateAdded: new Date().toLocaleDateString(),
        };
        saveVocabEntry(vocab);
        box.innerHTML = renderDefinitionHTML(vocab);
        return;
      }
    }
  } catch (_) {}

  box.innerHTML = '<div class="meaning" style="color:#55558e;font-style:italic">No definition found for this word.</div>';
}

function renderDefinitionHTML(vocab) {
  const phonetic = vocab.phonetic ? `<p class="phonetic">${vocab.phonetic}</p>` : '';
  const meanings = vocab.meanings.map(m => {
    const posTag  = m.pos ? `<span class="pos-tag">${m.pos}</span>` : '';
    const example = m.example ? `<p class="def-example">"${m.example}"</p>` : '';
    return `<div class="meaning">${posTag}${m.def}${example}</div>`;
  }).join('');
  const source = `<p class="def-source">Source: <a href="${vocab.sourceUrl}" target="_blank">${vocab.source === 'wikipedia' ? 'Wikipedia' : 'Free Dictionary'}</a></p>`;
  return phonetic + meanings + source;
}

// ── Storage: History ───────────────────────────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem('hangman-history') || '[]'); }
  catch (_) { return []; }
}

function saveHistory(word, wordHint, wrongs) {
  const history = getHistory();
  if (history.length && history[0].word === word && history[0].date === new Date().toLocaleDateString()) return;
  history.unshift({ word, hint: wordHint, wrongCount: wrongs, date: new Date().toLocaleDateString() });
  localStorage.setItem('hangman-history', JSON.stringify(history.slice(0, 100)));
}

function renderHistory() {
  const list    = document.getElementById('history-list');
  const history = getHistory();
  if (!history.length) {
    list.innerHTML = '<p class="empty-state">No games played yet.<br/><span>Finish a game to see it here.</span></p>';
    return;
  }
  list.innerHTML = history.map(e => {
    const hint = e.hint ? `<p class="item-hint">Hint: ${e.hint}</p>` : '';
    return `
      <div class="history-item">
        <div class="item-header">
          <span class="item-word">${e.word}</span>
          <span class="item-badge badge-wrong">${e.wrongCount} wrong</span>
        </div>
        ${hint}
        <p class="item-source">${e.date}</p>
      </div>`;
  }).join('');
}

// ── Storage: Vocabulary ────────────────────────────────────────────────────
function getVocab() {
  try { return JSON.parse(localStorage.getItem('hangman-vocab') || '{}'); }
  catch (_) { return {}; }
}

function getVocabEntry(word) {
  return getVocab()[word] ?? null;
}

function saveVocabEntry(vocab) {
  const store = getVocab();
  store[vocab.word] = vocab;
  localStorage.setItem('hangman-vocab', JSON.stringify(store));
}

function renderVocabulary() {
  const store   = getVocab();
  const words   = Object.keys(store).sort();
  const list    = document.getElementById('vocabulary-list');
  const countEl = document.getElementById('vocab-count');

  countEl.textContent = words.length;

  if (!words.length) {
    list.innerHTML = '<p class="empty-state">Your vocabulary is empty.<br/><span>Words you guess will appear here with their definitions.</span></p>';
    return;
  }

  list.innerHTML = words.map(w => {
    const v = store[w];
    const phonetic = v.phonetic ? `<p class="item-phonetic">${v.phonetic}</p>` : '';
    const defs = v.meanings.map(m => {
      const posTag  = m.pos ? `<span class="pos-tag">${m.pos}</span>` : '';
      const example = m.example ? ` <em style="font-size:.8rem;color:#55558e">"${m.example}"</em>` : '';
      return `<p class="item-def">${posTag}${m.def}${example}</p>`;
    }).join('');
    const source = `<p class="item-source"><a href="${v.sourceUrl}" target="_blank">${v.source === 'wikipedia' ? 'Wikipedia' : 'Free Dictionary'}</a> · ${v.dateAdded}</p>`;
    return `
      <div class="vocab-item">
        <div class="item-header">
          <span class="item-word">${v.word}</span>
          <span class="item-badge badge-date">${v.dateAdded}</span>
        </div>
        ${phonetic}${defs}${source}
      </div>`;
  }).join('');
}

// ── Game flow ──────────────────────────────────────────────────────────────
function startGame() {
  const wordInput = document.getElementById('word-input');
  const hintInput = document.getElementById('hint-input');
  const errEl     = document.getElementById('setup-error');

  const raw = wordInput.value.trim().toLowerCase();
  if (!raw) { errEl.textContent = 'Please enter a word.'; return; }
  if (!/^[a-z ]+$/.test(raw)) { errEl.textContent = 'Only letters and spaces, please.'; return; }
  errEl.textContent = '';

  secretWord      = raw;
  hint            = hintInput.value.trim();
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
document.getElementById('word-input').addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });
document.getElementById('ready-btn').addEventListener('click', beginGuessing);
document.getElementById('play-again-btn').addEventListener('click', () => showScreen('setup-screen'));
document.getElementById('see-vocab-btn').addEventListener('click', () => {
  switchToTab('vocabulary');
});

document.addEventListener('keydown', e => {
  const ch = e.key.toLowerCase();
  if (/^[a-z]$/.test(ch) && document.getElementById('game-screen').classList.contains('active')) {
    handleGuess(ch);
  }
});
