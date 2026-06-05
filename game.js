'use strict';

// ══════════════════════════════════════════════════════════
//  CANVAS DRAWING  (shared by solo + multiplayer)
// ══════════════════════════════════════════════════════════

const soloCanvas = document.getElementById('hangman-canvas');
const soloCtx    = soloCanvas.getContext('2d');
const mpCanvas   = document.getElementById('mp-hangman-canvas');
const mpCtx      = mpCanvas.getContext('2d');

// Active drawing context — swapped per canvas
let dc = soloCtx;

function withCtx(ctx, fn) { const p = dc; dc = ctx; fn(); dc = p; }

function line(x1, y1, x2, y2) {
  dc.beginPath(); dc.moveTo(x1, y1); dc.lineTo(x2, y2); dc.stroke();
}

function _draw(n, won = false) {
  dc.clearRect(0, 0, 200, 250);
  dc.lineCap = 'round'; dc.lineJoin = 'round';

  if (won) _drawWinBg();

  const galGrad = dc.createLinearGradient(60, 240, 60, 20);
  galGrad.addColorStop(0, '#ff9f43'); galGrad.addColorStop(1, '#ff6348');
  dc.strokeStyle = galGrad; dc.lineWidth = 5;
  line(20,240,180,240); line(60,240,60,20); line(60,20,140,20);
  dc.strokeStyle = '#ffd32a'; dc.lineWidth = 3;
  line(140, 20, 140, 50);

  if (n === 0) { if (won) _drawWinFg(); return; }

  const dead = n >= 6;
  if (n >= 12) _drawCape();
  if (n >= 7)  _drawPartyHat();

  if (n >= 1) {
    dc.fillStyle   = dead ? '#c0bedd' : '#ffcba4';
    dc.strokeStyle = dead ? '#9090b8' : '#e8a87c';
    dc.lineWidth = 2;
    dc.beginPath(); dc.arc(140, 70, 20, 0, Math.PI * 2); dc.fill(); dc.stroke();

    if (dead) {
      dc.strokeStyle = '#ff4757'; dc.lineWidth = 2.5;
      line(129,61,137,69); line(137,61,129,69);
      line(143,61,151,69); line(151,61,143,69);
      dc.strokeStyle = '#9090b8'; dc.lineWidth = 2;
      dc.beginPath();
      dc.moveTo(132,79); dc.lineTo(136,76); dc.lineTo(140,79); dc.lineTo(144,76); dc.lineTo(148,79);
      dc.stroke();
    } else {
      dc.fillStyle = '#6c5ce7';
      dc.beginPath(); dc.arc(133,65,3,0,Math.PI*2); dc.fill();
      dc.beginPath(); dc.arc(147,65,3,0,Math.PI*2); dc.fill();
      dc.strokeStyle = '#6c5ce7'; dc.lineWidth = 2;
      dc.beginPath(); dc.arc(140,74,5,0.3,Math.PI-0.3); dc.stroke();
    }
  }

  if (n >= 8)  _drawSunglasses();
  dc.strokeStyle = '#fffffe'; dc.lineWidth = 3;
  if (n >= 2) line(140,90,140,160);
  if (n >= 3) line(140,110,110,145);
  if (n >= 4) line(140,110,170,145);
  if (n >= 5) line(140,160,110,200);
  if (n >= 6) line(140,160,170,200);
  if (n >= 11) _drawBowTie();
  if (n >= 9)  _drawBalloon();
  if (n >= 10) _drawIceCream();
  if (won) _drawWinFg();
}

function drawHangman(n, won = false)   { withCtx(soloCtx, () => _draw(n, won)); }
function mpDrawHangman(n, won = false) { withCtx(mpCtx,   () => _draw(n, won)); }

// ── Drawing helpers ────────────────────────────────────────────────────────
function _drawPartyHat() {
  dc.fillStyle = '#ff4757';
  dc.beginPath(); dc.moveTo(122,52); dc.lineTo(152,19); dc.lineTo(160,52); dc.closePath(); dc.fill();
  dc.strokeStyle = '#ffd32a'; dc.lineWidth = 2; line(133,30,156,30);
  dc.strokeStyle = '#2ed573'; line(128,39,157,39);
  dc.fillStyle = '#c0392b'; dc.strokeStyle = '#ffd32a'; dc.lineWidth = 2;
  dc.beginPath(); dc.ellipse(141,52,21,6,0,0,Math.PI*2); dc.fill(); dc.stroke();
  dc.fillStyle = '#ffd32a'; dc.beginPath(); dc.arc(152,19,6,0,Math.PI*2); dc.fill();
  dc.fillStyle = '#ff4757'; dc.beginPath(); dc.arc(152,19,3,0,Math.PI*2); dc.fill();
}
function _drawSunglasses() {
  dc.fillStyle = 'rgba(116,185,255,0.42)'; dc.strokeStyle = '#74b9ff'; dc.lineWidth = 2.5;
  dc.beginPath(); dc.arc(130,65,9,0,Math.PI*2); dc.fill(); dc.stroke();
  dc.beginPath(); dc.arc(150,65,9,0,Math.PI*2); dc.fill(); dc.stroke();
  dc.lineWidth = 2; line(139,64,141,64); line(121,66,113,70); line(159,66,167,70);
  dc.fillStyle = 'rgba(255,255,255,0.5)';
  dc.beginPath(); dc.arc(126,61,3,0,Math.PI*2); dc.fill();
  dc.beginPath(); dc.arc(146,61,3,0,Math.PI*2); dc.fill();
}
function _drawBalloon() {
  dc.strokeStyle = '#ffd32a'; dc.lineWidth = 1.5;
  dc.beginPath(); dc.moveTo(110,145); dc.bezierCurveTo(105,135,95,125,88,113); dc.stroke();
  dc.fillStyle = '#ff4757'; dc.strokeStyle = '#c0392b'; dc.lineWidth = 1.5;
  dc.beginPath(); dc.ellipse(88,100,14,17,-0.15,0,Math.PI*2); dc.fill(); dc.stroke();
  dc.fillStyle = '#c0392b';
  dc.beginPath(); dc.moveTo(88,117); dc.lineTo(84,122); dc.lineTo(92,122); dc.closePath(); dc.fill();
  dc.fillStyle = 'rgba(255,255,255,0.45)';
  dc.beginPath(); dc.ellipse(82,93,4,6,-0.5,0,Math.PI*2); dc.fill();
}
function _drawIceCream() {
  dc.fillStyle = '#fd9644'; dc.strokeStyle = '#e67e22'; dc.lineWidth = 1.5;
  dc.beginPath(); dc.moveTo(175,143); dc.lineTo(169,167); dc.lineTo(193,167); dc.closePath(); dc.fill(); dc.stroke();
  dc.fillStyle = '#fd79a8'; dc.strokeStyle = '#e84393'; dc.lineWidth = 1.5;
  dc.beginPath(); dc.arc(183,136,12,0,Math.PI*2); dc.fill(); dc.stroke();
  dc.strokeStyle = 'rgba(255,255,255,0.35)'; dc.lineWidth = 1.5;
  dc.beginPath(); dc.arc(183,136,7,Math.PI*1.2,Math.PI*2.2); dc.stroke();
  dc.fillStyle = 'rgba(255,255,255,0.5)';
  dc.beginPath(); dc.ellipse(178,131,4,3,-0.4,0,Math.PI*2); dc.fill();
}
function _drawBowTie() {
  const cx=140,cy=92;
  dc.fillStyle='#26d0ce'; dc.strokeStyle='#1a9e99'; dc.lineWidth=1.5;
  dc.beginPath(); dc.moveTo(cx-13,cy-6); dc.lineTo(cx,cy); dc.lineTo(cx-13,cy+6); dc.closePath(); dc.fill(); dc.stroke();
  dc.beginPath(); dc.moveTo(cx+13,cy-6); dc.lineTo(cx,cy); dc.lineTo(cx+13,cy+6); dc.closePath(); dc.fill(); dc.stroke();
  dc.fillStyle='#148a87'; dc.beginPath(); dc.ellipse(cx,cy,5,7,0,0,Math.PI*2); dc.fill(); dc.stroke();
}
function _drawCape() {
  const g = dc.createLinearGradient(95,105,185,215);
  g.addColorStop(0,'#a29bfe'); g.addColorStop(1,'#6c5ce7');
  dc.fillStyle=g; dc.strokeStyle='#6c5ce7'; dc.lineWidth=2;
  dc.beginPath();
  dc.moveTo(125,95); dc.bezierCurveTo(108,135,88,175,93,215);
  dc.bezierCurveTo(115,220,162,222,185,215); dc.bezierCurveTo(190,178,172,135,155,95);
  dc.closePath(); dc.fill(); dc.stroke();
}
function _drawWinBg() {
  [[15,45,'#ff4757'],[32,95,'#ffd32a'],[183,62,'#2ed573'],
   [170,158,'#74b9ff'],[18,188,'#fd79a8'],[190,200,'#a29bfe'],
   [10,130,'#26d0ce'],[190,108,'#fd9644'],[160,32,'#fd79a8']
  ].forEach(([x,y,c]) => {
    dc.fillStyle=c; dc.save(); dc.translate(x,y); dc.rotate(0.5); dc.fillRect(-5,-2,10,4); dc.restore();
  });
}
function _drawWinFg() {
  [[32,234,'#ff4757'],[100,234,'#2ed573'],[165,234,'#ffd32a']].forEach(([x,y,c]) => _drawFlower(x,y,c));
  [[174,38,'#ffd32a'],[23,72,'#fd79a8'],[183,140,'#74b9ff']].forEach(([x,y,c]) => _drawStar(x,y,c));
  _drawBird(50,13); _drawBird(72,9);
  dc.fillStyle='#ffd32a'; dc.font='bold 9px sans-serif'; dc.textAlign='center';
  dc.fillText('🎉 YOU WIN! 🎉',100,17);
}
function _drawFlower(cx,cy,color) {
  dc.fillStyle=color;
  for(let a=0;a<Math.PI*2;a+=Math.PI/3){
    dc.beginPath(); dc.ellipse(cx+Math.cos(a)*6,cy+Math.sin(a)*6,4,2.5,a,0,Math.PI*2); dc.fill();
  }
  dc.fillStyle='#fff8b0'; dc.beginPath(); dc.arc(cx,cy,4.5,0,Math.PI*2); dc.fill();
}
function _drawStar(cx,cy,color) {
  dc.fillStyle=color; dc.beginPath();
  for(let i=0;i<10;i++){
    const a=(i*Math.PI/5)-Math.PI/2, r=i%2===0?7:3;
    i===0?dc.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):dc.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
  }
  dc.closePath(); dc.fill();
}
function _drawBird(x,y) {
  dc.strokeStyle='#fffffe'; dc.lineWidth=1.5; dc.beginPath();
  dc.arc(x-4,y,4,Math.PI,0); dc.arc(x+4,y,4,Math.PI,0); dc.stroke();
}

// ══════════════════════════════════════════════════════════
//  SHARED UTILITIES
// ══════════════════════════════════════════════════════════

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function switchToTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
  if (name === 'vocabulary') renderVocabulary();
  if (name === 'history')    renderHistory();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchToTab(btn.dataset.tab));
});

function buildKeyboard(containerId, onGuess) {
  const kb = document.getElementById(containerId);
  kb.innerHTML = '';
  for (let i = 97; i <= 122; i++) {
    const ch  = String.fromCharCode(i);
    const btn = document.createElement('button');
    btn.className = 'key-btn'; btn.textContent = ch; btn.dataset.letter = ch;
    btn.addEventListener('click', () => onGuess(ch));
    kb.appendChild(btn);
  }
}

function updateKeyboard(containerId, guessedSet, word) {
  document.querySelectorAll(`#${containerId} .key-btn`).forEach(btn => {
    const ch = btn.dataset.letter;
    if (guessedSet.has(ch)) {
      btn.disabled = true;
      btn.classList.add(word.includes(ch) ? 'correct' : 'wrong');
    }
  });
}

function renderWordDisplay(containerId, word, guessedSet, revealMiss = false) {
  document.getElementById(containerId).innerHTML = word.split('').map(ch => {
    if (ch === ' ')          return '<div class="letter-box space"></div>';
    if (guessedSet.has(ch))  return `<div class="letter-box revealed">${ch}</div>`;
    if (revealMiss)          return `<div class="letter-box reveal-miss">${ch}</div>`;
    return '<div class="letter-box"></div>';
  }).join('');
}

// ══════════════════════════════════════════════════════════
//  STORAGE: History & Vocabulary
// ══════════════════════════════════════════════════════════

function getHistory() {
  try { return JSON.parse(localStorage.getItem('hangman-history') || '[]'); } catch { return []; }
}
function saveHistory(word, wordHint, wrongs) {
  const h = getHistory();
  if (h.length && h[0].word === word && h[0].date === new Date().toLocaleDateString()) return;
  h.unshift({ word, hint: wordHint, wrongCount: wrongs, date: new Date().toLocaleDateString() });
  localStorage.setItem('hangman-history', JSON.stringify(h.slice(0, 100)));
}
function renderHistory() {
  const list = document.getElementById('history-list');
  const h    = getHistory();
  if (!h.length) { list.innerHTML = '<p class="empty-state">No games played yet.<br/><span>Finish a solo game to see it here.</span></p>'; return; }
  list.innerHTML = h.map(e => `
    <div class="history-item">
      <div class="item-header">
        <span class="item-word">${e.word}</span>
        <span class="item-badge badge-wrong">${e.wrongCount} wrong</span>
      </div>
      ${e.hint ? `<p class="item-hint">Hint: ${e.hint}</p>` : ''}
      <p class="item-source">${e.date}</p>
    </div>`).join('');
}

function getVocab() {
  try { return JSON.parse(localStorage.getItem('hangman-vocab') || '{}'); } catch { return {}; }
}
function getVocabEntry(word) { return getVocab()[word] ?? null; }
function saveVocabEntry(v) {
  const s = getVocab(); s[v.word] = v;
  localStorage.setItem('hangman-vocab', JSON.stringify(s));
}
function renderVocabulary() {
  const store = getVocab(); const words = Object.keys(store).sort();
  document.getElementById('vocab-count').textContent = words.length;
  const list = document.getElementById('vocabulary-list');
  if (!words.length) { list.innerHTML = '<p class="empty-state">Your vocabulary is empty.<br/><span>Words you guess will appear here with definitions.</span></p>'; return; }
  list.innerHTML = words.map(w => {
    const v = store[w];
    const ph = v.phonetic ? `<p class="item-phonetic">${v.phonetic}</p>` : '';
    const defs = v.meanings.map(m => {
      const posTag  = m.pos ? `<span class="pos-tag">${m.pos}</span>` : '';
      const example = m.example ? ` <em style="font-size:.8rem;color:#55558e">"${m.example}"</em>` : '';
      return `<p class="item-def">${posTag}${m.def}${example}</p>`;
    }).join('');
    return `<div class="vocab-item">
      <div class="item-header">
        <span class="item-word">${v.word}</span>
        <span class="item-badge badge-date">${v.dateAdded}</span>
      </div>
      ${ph}${defs}
      <p class="item-source"><a href="${v.sourceUrl}" target="_blank">${v.source === 'wikipedia' ? 'Wikipedia' : 'Free Dictionary'}</a> · ${v.dateAdded}</p>
    </div>`;
  }).join('');
}

// ── Dictionary fetch ───────────────────────────────────────────────────────
async function fetchAndCacheDefinition(word) {
  const box = document.getElementById('definition-box');
  const cached = getVocabEntry(word);
  if (cached) { box.innerHTML = renderDefHTML(cached); return; }

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (res.ok) {
      const data  = await res.json();
      const entry = data[0];
      const vocab = {
        word,
        phonetic:  entry.phonetic || (entry.phonetics?.find(p => p.text)?.text ?? ''),
        meanings:  entry.meanings.slice(0, 3).map(m => ({
          pos: m.partOfSpeech,
          def: m.definitions[0]?.definition ?? '',
          example: m.definitions[0]?.example ?? '',
        })),
        source:    'dictionary',
        sourceUrl: entry.sourceUrls?.[0] ?? 'https://dictionaryapi.dev',
        dateAdded: new Date().toLocaleDateString(),
      };
      saveVocabEntry(vocab);
      box.innerHTML = renderDefHTML(vocab);
      return;
    }
  } catch (_) {}

  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.extract) {
        const pageUrl = data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(word)}`;
        const vocab = { word, phonetic: '', meanings: [{ pos: '', def: data.extract, example: '' }], source: 'wikipedia', sourceUrl: pageUrl, dateAdded: new Date().toLocaleDateString() };
        saveVocabEntry(vocab);
        box.innerHTML = renderDefHTML(vocab);
        return;
      }
    }
  } catch (_) {}

  box.innerHTML = '<div class="meaning" style="color:#55558e;font-style:italic">No definition found.</div>';
}

function renderDefHTML(v) {
  const ph = v.phonetic ? `<p class="phonetic">${v.phonetic}</p>` : '';
  const ms = v.meanings.map(m =>
    `<div class="meaning">${m.pos ? `<span class="pos-tag">${m.pos}</span>` : ''}${m.def}${m.example ? `<p class="def-example">"${m.example}"</p>` : ''}</div>`
  ).join('');
  return ph + ms + `<p class="def-source">Source: <a href="${v.sourceUrl}" target="_blank">${v.source === 'wikipedia' ? 'Wikipedia' : 'Free Dictionary'}</a></p>`;
}

// ══════════════════════════════════════════════════════════
//  SOLO GAME
// ══════════════════════════════════════════════════════════

let soloWord = '', soloHint = '', soloGuessed = new Set(), soloWrong = 0, soloOver = false;

document.getElementById('solo-btn').addEventListener('click', () => showScreen('setup-screen'));
document.getElementById('back-to-home').addEventListener('click', () => showScreen('home-screen'));
document.getElementById('start-btn').addEventListener('click', startSoloGame);
document.getElementById('word-input').addEventListener('keydown', e => { if (e.key === 'Enter') startSoloGame(); });
document.getElementById('ready-btn').addEventListener('click', beginSoloGuessing);
document.getElementById('play-again-btn').addEventListener('click', () => showScreen('home-screen'));
document.getElementById('see-vocab-btn').addEventListener('click', () => switchToTab('vocabulary'));

function startSoloGame() {
  const wi = document.getElementById('word-input');
  const hi = document.getElementById('hint-input');
  const er = document.getElementById('setup-error');
  const raw = wi.value.trim().toLowerCase();
  if (!raw) { er.textContent = 'Please enter a word.'; return; }
  if (!/^[a-z ]+$/.test(raw)) { er.textContent = 'Only letters and spaces, please.'; return; }
  er.textContent = ''; soloWord = raw; soloHint = hi.value.trim();
  wi.value = ''; hi.value = '';
  showScreen('handoff-screen');
}

function beginSoloGuessing() {
  soloGuessed = new Set(); soloWrong = 0; soloOver = false;
  document.getElementById('wrong-count').textContent = 0;
  document.getElementById('hint-display').textContent = soloHint ? `Hint: ${soloHint}` : '';
  drawHangman(0);
  renderWordDisplay('word-display', soloWord, soloGuessed);
  buildKeyboard('keyboard', soloGuess);
  showScreen('game-screen');
}

function soloGuess(ch) {
  if (soloOver || soloGuessed.has(ch)) return;
  soloGuessed.add(ch);
  if (!soloWord.includes(ch)) soloWrong++;
  drawHangman(Math.min(soloWrong, 12));
  renderWordDisplay('word-display', soloWord, soloGuessed);
  updateKeyboard('keyboard', soloGuessed, soloWord);
  document.getElementById('wrong-count').textContent = soloWrong;

  if (soloWord.split('').every(c => c === ' ' || soloGuessed.has(c))) {
    soloOver = true; endSoloGame();
  }
}

function endSoloGame() {
  document.querySelectorAll('#keyboard .key-btn').forEach(b => (b.disabled = true));
  drawHangman(Math.min(soloWrong, 12), true);
  setTimeout(() => {
    const banner = document.getElementById('result-banner');
    banner.className = 'result-banner win';
    banner.textContent = soloWrong === 0 ? 'Perfect! Zero wrong guesses! 🎉' : 'You got it! 🎉';
    document.getElementById('result-word').textContent = soloWord.toUpperCase();
    document.getElementById('wrong-summary').textContent =
      soloWrong === 0 ? 'Flawless!' : `${soloWrong} wrong guess${soloWrong === 1 ? '' : 'es'}.`;
    saveHistory(soloWord, soloHint, soloWrong);
    showScreen('result-screen');
    fetchAndCacheDefinition(soloWord);
  }, 700);
}

document.addEventListener('keydown', e => {
  const ch = e.key.toLowerCase();
  if (/^[a-z]$/.test(ch) && document.getElementById('game-screen').classList.contains('active')) soloGuess(ch);
});

// ══════════════════════════════════════════════════════════
//  MULTIPLAYER
// ══════════════════════════════════════════════════════════

let socket        = null;
let myId          = null;
let myName        = '';
let myNumber      = 0;
let roomCode      = '';
let amHost        = false;
let mpGuessed     = new Set();
let mpWrong       = 0;
let mpWord        = '';
let mpSetterId    = '';
let mpCurrentGuesserId = '';
let mpRound       = 0;

// Lazy-load socket.io only when entering multiplayer
function initSocket(cb) {
  if (socket) { cb(); return; }
  const s = document.createElement('script');
  s.src = '/socket.io/socket.io.js';
  s.onload = () => {
    socket = window.io();
    attachSocketEvents();
    cb();
  };
  s.onerror = () => {
    document.getElementById('mp-lobby-error').textContent =
      'Cannot reach server. Start it with: npm start';
  };
  document.head.appendChild(s);
}

document.getElementById('mp-btn').addEventListener('click', () => {
  initSocket(() => showScreen('mp-lobby-screen'));
});
document.getElementById('mp-back-btn').addEventListener('click', () => showScreen('home-screen'));

document.getElementById('create-room-btn').addEventListener('click', () => {
  const name = document.getElementById('mp-name').value.trim();
  if (!name) { document.getElementById('mp-lobby-error').textContent = 'Enter your name.'; return; }
  document.getElementById('mp-lobby-error').textContent = '';
  myName = name;
  socket.emit('create-room', { name });
});

document.getElementById('join-room-btn').addEventListener('click', () => {
  const name = document.getElementById('mp-name').value.trim();
  const code = document.getElementById('room-code-input').value.trim().toUpperCase();
  if (!name) { document.getElementById('mp-lobby-error').textContent = 'Enter your name.'; return; }
  if (code.length !== 6) { document.getElementById('mp-lobby-error').textContent = 'Enter a valid 6-character room code.'; return; }
  document.getElementById('mp-lobby-error').textContent = '';
  myName = name;
  socket.emit('join-room', { code, name });
});

document.getElementById('start-round-btn').addEventListener('click', () => {
  socket.emit('start-round', { code: roomCode });
});

document.getElementById('mp-submit-word-btn').addEventListener('click', submitMpWord);
document.getElementById('mp-word-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitMpWord(); });

document.getElementById('next-round-btn').addEventListener('click', () => {
  socket.emit('next-round', { code: roomCode });
});
document.getElementById('end-room-btn').addEventListener('click', () => {
  socket.emit('end-room', { code: roomCode });
});
document.getElementById('final-home-btn').addEventListener('click', () => showScreen('home-screen'));

function submitMpWord() {
  const w = document.getElementById('mp-word-input').value.trim();
  const h = document.getElementById('mp-hint-input').value.trim();
  if (!w) { document.getElementById('mp-entry-error').textContent = 'Enter a word.'; return; }
  if (!/^[a-zA-Z ]+$/.test(w)) { document.getElementById('mp-entry-error').textContent = 'Letters only, please.'; return; }
  document.getElementById('mp-entry-error').textContent = '';
  document.getElementById('mp-word-input').value = '';
  document.getElementById('mp-hint-input').value = '';
  socket.emit('submit-word', { code: roomCode, word: w, hint: h });
}

function renderMpPlayers(players, hostId) {
  document.getElementById('mp-players-list').innerHTML = players.map(p => `
    <div class="player-chip${p.id === hostId ? ' host' : ''}">
      <span class="player-num">${p.number}</span>
      ${p.name}${p.id === hostId ? ' 👑' : ''}
    </div>`).join('');
}

// ── Socket event handlers ──────────────────────────────────────────────────
function attachSocketEvents() {

  socket.on('room-created', ({ code, player }) => {
    roomCode = code; myId = player.id; myNumber = player.number; amHost = true;
    document.getElementById('rc-display').textContent = code;
    renderMpPlayers([player], player.id);
    document.getElementById('mp-room-status').textContent = 'Waiting for players to join…';
    document.getElementById('start-round-btn').style.display = 'block';
    showScreen('mp-room-screen');
  });

  socket.on('room-joined', ({ code, player, players }) => {
    roomCode = code; myId = player.id; myNumber = player.number; amHost = false;
    document.getElementById('rc-display').textContent = code;
    renderMpPlayers(players, players[0]?.id);
    document.getElementById('mp-room-status').textContent = 'Waiting for host to start…';
    document.getElementById('start-round-btn').style.display = 'none';
    showScreen('mp-room-screen');
  });

  socket.on('player-joined', ({ players }) => {
    renderMpPlayers(players, players[0]?.id);
  });

  socket.on('player-left', ({ players, hostId }) => {
    amHost = hostId === myId;
    renderMpPlayers(players, hostId);
    document.getElementById('start-round-btn').style.display = amHost ? 'block' : 'none';
  });

  socket.on('room-error', msg => {
    document.getElementById('mp-lobby-error').textContent = msg;
  });

  socket.on('begin-word-entry', ({ round, playerCount }) => {
    mpRound = round;
    document.getElementById('mp-round-num').textContent = round;
    document.getElementById('mp-entry-error').textContent = '';
    showScreen('mp-entry-screen');
  });

  socket.on('word-accepted', () => {
    document.getElementById('mp-wait-msg').textContent = 'Waiting for other players to submit…';
    showScreen('mp-wait-screen');
  });

  socket.on('submit-progress', ({ done, total }) => {
    const pct = (done / total) * 100;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-label').textContent = `${done} of ${total} submitted`;
  });

  socket.on('new-word', ({ wordMask, hint, setterId, setterName, wordIndex, totalWords, firstGuesserId, firstGuesserName }) => {
    mpGuessed = new Set(); mpWrong = 0;
    mpWord = wordMask; mpSetterId = setterId; mpCurrentGuesserId = firstGuesserId;

    document.getElementById('mp-meta-word').textContent    = `Word ${wordIndex} of ${totalWords}`;
    document.getElementById('mp-setter-name-display').textContent = setterName;
    document.getElementById('mp-round-display').textContent = mpRound;
    document.getElementById('mp-wrong-count').textContent  = 0;
    document.getElementById('mp-hint-display').textContent = hint ? `Hint: ${hint}` : '';
    document.getElementById('mp-word-display').innerHTML = wordMask.split('').map(c =>
      c === ' ' ? '<div class="letter-box space"></div>' : '<div class="letter-box"></div>'
    ).join('');

    mpDrawHangman(0);
    buildMpKeyboard();
    setTurnIndicator(firstGuesserId, firstGuesserName);
    showScreen('mp-guess-screen');
  });

  socket.on('guess-update', ({ letter, correct, wrongCount, guessed, nextGuesserId, nextGuesserName }) => {
    mpGuessed = new Set(guessed); mpWrong = wrongCount; mpCurrentGuesserId = nextGuesserId;
    document.getElementById('mp-wrong-count').textContent = wrongCount;
    mpDrawHangman(wrongCount);
    renderWordDisplay('mp-word-display', mpWord, mpGuessed);
    updateMpKeyboard();
    setTurnIndicator(nextGuesserId, nextGuesserName);
  });

  socket.on('word-solved', ({ word, guessed, guesserName, winnerId, wrongCount, bonus }) => {
    mpGuessed = new Set(guessed); mpWrong = wrongCount;
    document.getElementById('mp-wrong-count').textContent = wrongCount;
    renderWordDisplay('mp-word-display', word, mpGuessed);
    updateMpKeyboard();
    mpDrawHangman(wrongCount, true);
    const ti = document.getElementById('mp-turn-indicator');
    ti.className = 'turn-indicator your-turn';
    ti.textContent = winnerId === myId
      ? `You guessed it! 🎉${bonus ? ' Bonus point!' : ''}`
      : `${guesserName} guessed it!${bonus ? ' Bonus!' : ''}`;
    document.querySelectorAll('#mp-keyboard .key-btn').forEach(b => (b.disabled = true));
  });

  socket.on('word-failed', ({ word, guessed, setterName }) => {
    mpGuessed = new Set(guessed);
    renderWordDisplay('mp-word-display', word, mpGuessed, true);
    updateMpKeyboard();
    mpDrawHangman(6);
    const ti = document.getElementById('mp-turn-indicator');
    ti.className = 'turn-indicator setter';
    ti.textContent = `Nobody guessed it! ${setterId === myId ? 'You get a point! 💪' : `${setterName} gets the point.`}`;
    document.querySelectorAll('#mp-keyboard .key-btn').forEach(b => (b.disabled = true));
  });

  socket.on('round-complete', ({ round, summary, hostId }) => {
    amHost = hostId === myId;
    document.getElementById('summary-round').textContent = round;
    renderSummaryTable(summary);
    document.getElementById('summary-host-note').style.display = amHost ? 'block' : 'none';
    document.getElementById('summary-actions').style.display   = amHost ? 'flex' : 'none';
    document.getElementById('summary-wait-msg').style.display  = amHost ? 'none' : 'block';
    showScreen('mp-summary-screen');
  });

  socket.on('room-closed', ({ final }) => {
    renderFinalTable(final);
    showScreen('mp-final-screen');
  });
}

// ── MP keyboard helpers ────────────────────────────────────────────────────
function buildMpKeyboard() {
  buildKeyboard('mp-keyboard', (ch) => {
    if (myId === mpSetterId) return;           // setter can't guess
    if (myId !== mpCurrentGuesserId) return;   // not your turn
    socket.emit('guess-letter', { code: roomCode, letter: ch });
  });
}

function updateMpKeyboard() {
  document.querySelectorAll('#mp-keyboard .key-btn').forEach(btn => {
    const ch = btn.dataset.letter;
    if (mpGuessed.has(ch)) {
      btn.disabled = true;
      btn.classList.add(mpWord.includes(ch) ? 'correct' : 'wrong');
    }
  });
  // Dim keyboard entirely if not your turn or you're the setter
  const isMyTurn = myId === mpCurrentGuesserId && myId !== mpSetterId;
  document.querySelectorAll('#mp-keyboard .key-btn').forEach(btn => {
    if (!btn.disabled) btn.classList.toggle('inactive', !isMyTurn);
  });
}

function setTurnIndicator(guesserId, guesserName) {
  const ti = document.getElementById('mp-turn-indicator');
  if (myId === mpSetterId) {
    ti.className = 'turn-indicator setter';
    ti.textContent = 'You set this word — watch the guesses!';
  } else if (myId === guesserId) {
    ti.className = 'turn-indicator your-turn';
    ti.textContent = 'Your turn! Pick a letter.';
  } else {
    ti.className = 'turn-indicator waiting';
    ti.textContent = `Waiting for ${guesserName}…`;
  }
}

// ── Summary tables ─────────────────────────────────────────────────────────
function rankMedal(i) {
  return ['🥇','🥈','🥉'][i] ?? `${i+1}.`;
}

function renderSummaryTable(summary) {
  const t = document.getElementById('summary-table');
  t.innerHTML = `<table class="summary-table">
    <thead><tr><th></th><th>Player</th><th>Round +pts</th><th>Total</th></tr></thead>
    <tbody>${summary.map((p,i) => `
      <tr class="${i===0?'rank-1':i===1?'rank-2':''}">
        <td><span class="rank-medal">${rankMedal(i)}</span></td>
        <td>${p.name}${p.id === myId ? ' (you)' : ''}</td>
        <td><span class="pts-round">+${p.roundPts}</span></td>
        <td><span class="pts-badge">${p.totalPts}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function renderFinalTable(final) {
  const t = document.getElementById('final-table');
  t.innerHTML = `<table class="summary-table">
    <thead><tr><th></th><th>Player</th><th>Total Points</th></tr></thead>
    <tbody>${final.map((p,i) => `
      <tr class="${i===0?'rank-1':i===1?'rank-2':''}">
        <td><span class="rank-medal">${rankMedal(i)}</span></td>
        <td>${p.name}${p.id === myId ? ' (you)' : ''}</td>
        <td><span class="pts-badge">${p.totalPts}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}
