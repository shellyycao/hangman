'use strict';
const express     = require('express');
const http        = require('http');
const { Server }  = require('socket.io');
const path        = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server);

app.use(express.static(path.join(__dirname)));

// ── In-memory room store ───────────────────────────────────────────────────
const rooms = new Map();

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Socket events ──────────────────────────────────────────────────────────
io.on('connection', socket => {

  // Create a new room
  socket.on('create-room', ({ name }) => {
    let code;
    do { code = genCode(); } while (rooms.has(code));

    const player = { id: socket.id, name: name.trim().slice(0, 20), number: 1 };
    rooms.set(code, {
      code,
      hostId:       socket.id,
      players:      [player],
      state:        'lobby',
      round:        0,
      wordEntries:  {},
      pendingCount: 0,
      wordQueue:    [],
      wordIdx:      0,
      guessState:   null,
      roundScores:  {},
      totalScores:  { [socket.id]: 0 },
    });

    socket.join(code);
    socket.emit('room-created', { code, player });
  });

  // Join existing room
  socket.on('join-room', ({ code, name }) => {
    const room = rooms.get(code);
    if (!room)                   return socket.emit('room-error', 'Room not found.');
    if (room.state !== 'lobby')  return socket.emit('room-error', 'Game already in progress.');
    if (room.players.length >= 8) return socket.emit('room-error', 'Room is full (max 8 players).');

    const player = { id: socket.id, name: name.trim().slice(0, 20), number: room.players.length + 1 };
    room.players.push(player);
    room.totalScores[socket.id] = 0;

    socket.join(code);
    socket.emit('room-joined', { code, player, players: room.players });
    socket.to(code).emit('player-joined', { players: room.players });
  });

  // Host starts the round
  socket.on('start-round', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 2) return socket.emit('room-error', 'Need at least 2 players to start.');
    beginWordEntry(code);
  });

  // Player submits their secret word
  socket.on('submit-word', ({ code, word, hint }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'word-entry') return;
    if (room.wordEntries[socket.id]) return; // already submitted

    room.wordEntries[socket.id] = { word: word.toLowerCase().trim(), hint: (hint || '').trim() };
    room.pendingCount++;
    socket.emit('word-accepted');
    io.to(code).emit('submit-progress', { done: room.pendingCount, total: room.players.length });

    if (room.pendingCount === room.players.length) beginGuessing(code);
  });

  // Player guesses a letter (turn-based)
  socket.on('guess-letter', ({ code, letter }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'guessing') return;
    const gs = room.guessState;
    if (!gs || gs.done) return;

    const guessers = room.players.filter(p => p.id !== gs.setterId);
    if (!guessers.length) return;
    if (guessers[gs.guesserIdx].id !== socket.id) return;
    if (gs.guessed.has(letter)) return;

    gs.guessed.add(letter);
    const correct = gs.word.includes(letter);
    if (!correct) gs.wrongCount++;

    // Advance to next guesser
    gs.guesserIdx = (gs.guesserIdx + 1) % guessers.length;
    const next = guessers[gs.guesserIdx];

    const allRevealed = gs.word.split('').every(c => c === ' ' || gs.guessed.has(c));

    if (allRevealed) {
      gs.done = true;
      const bonus = gs.wrongCount <= 2;
      room.roundScores[socket.id] = (room.roundScores[socket.id] || 0) + 1 + (bonus ? 1 : 0);
      room.totalScores[socket.id] = (room.totalScores[socket.id] || 0) + 1 + (bonus ? 1 : 0);
      io.to(code).emit('word-solved', {
        word:        gs.word,
        guessed:     [...gs.guessed],
        guesserName: socket.id === socket.id ? room.players.find(p => p.id === socket.id)?.name : '?',
        winnerId:    socket.id,
        wrongCount:  gs.wrongCount,
        bonus,
      });
      setTimeout(() => advanceWord(code), 3000);

    } else if (gs.wrongCount >= 6) {
      gs.done = true;
      room.roundScores[gs.setterId] = (room.roundScores[gs.setterId] || 0) + 1;
      room.totalScores[gs.setterId] = (room.totalScores[gs.setterId] || 0) + 1;
      io.to(code).emit('word-failed', {
        word:       gs.word,
        guessed:    [...gs.guessed],
        setterId:   gs.setterId,
        setterName: gs.setterName,
      });
      setTimeout(() => advanceWord(code), 3000);

    } else {
      io.to(code).emit('guess-update', {
        letter, correct,
        wrongCount:       gs.wrongCount,
        guessed:          [...gs.guessed],
        nextGuesserId:    next.id,
        nextGuesserName:  next.name,
      });
    }
  });

  // Host starts another round
  socket.on('next-round', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;
    beginWordEntry(code);
  });

  // Host ends the session
  socket.on('end-room', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;
    closeRoom(code);
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    for (const [code, room] of rooms) {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx === -1) continue;
      room.players.splice(idx, 1);
      delete room.totalScores[socket.id];
      if (room.players.length === 0) {
        rooms.delete(code);
      } else {
        if (room.hostId === socket.id) room.hostId = room.players[0].id;
        io.to(code).emit('player-left', { players: room.players, hostId: room.hostId });
      }
    }
  });
});

// ── Server-side flow helpers ───────────────────────────────────────────────
function beginWordEntry(code) {
  const room = rooms.get(code);
  room.state        = 'word-entry';
  room.wordEntries  = {};
  room.pendingCount = 0;
  room.roundScores  = {};
  room.round++;
  io.to(code).emit('begin-word-entry', { round: room.round, playerCount: room.players.length });
}

function beginGuessing(code) {
  const room   = rooms.get(code);
  room.state   = 'guessing';
  room.wordQueue = room.players
    .filter(p => room.wordEntries[p.id])
    .map(p => ({ setterId: p.id, setterName: p.name, ...room.wordEntries[p.id] }));
  room.wordIdx = 0;
  serveNextWord(code);
}

function serveNextWord(code) {
  const room = rooms.get(code);
  if (room.wordIdx >= room.wordQueue.length) { finishRound(code); return; }

  const entry    = room.wordQueue[room.wordIdx];
  const guessers = room.players.filter(p => p.id !== entry.setterId);
  room.guessState = {
    word: entry.word, hint: entry.hint,
    setterId: entry.setterId, setterName: entry.setterName,
    guessed: new Set(), wrongCount: 0, done: false, guesserIdx: 0,
  };
  io.to(code).emit('new-word', {
    wordMask:         entry.word.split('').map(c => c === ' ' ? ' ' : '_').join(''),
    wordLen:          entry.word.length,
    hint:             entry.hint,
    setterId:         entry.setterId,
    setterName:       entry.setterName,
    wordIndex:        room.wordIdx + 1,
    totalWords:       room.wordQueue.length,
    firstGuesserId:   guessers[0]?.id   ?? null,
    firstGuesserName: guessers[0]?.name ?? '?',
  });
}

function advanceWord(code) {
  const room = rooms.get(code);
  room.wordIdx++;
  serveNextWord(code);
}

function finishRound(code) {
  const room = rooms.get(code);
  room.state  = 'round-summary';
  const summary = room.players.map(p => ({
    id:         p.id,
    name:       p.name,
    number:     p.number,
    roundPts:   room.roundScores[p.id]  || 0,
    totalPts:   room.totalScores[p.id]  || 0,
  })).sort((a, b) => b.totalPts - a.totalPts);
  io.to(code).emit('round-complete', { round: room.round, summary, hostId: room.hostId });
}

function closeRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  const final = room.players.map(p => ({
    id: p.id, name: p.name, number: p.number,
    totalPts: room.totalScores[p.id] || 0,
  })).sort((a, b) => b.totalPts - a.totalPts);
  io.to(code).emit('room-closed', { final });
  rooms.delete(code);
}

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎮  Hangman server running!\n    Local:   http://localhost:${PORT}\n    Network: http://<your-ip>:${PORT}\n`);
});
