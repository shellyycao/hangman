const WORDS = [
  { word: "javascript", hint: "A popular programming language for the web" },
  { word: "hangman", hint: "The game you are playing right now" },
  { word: "elephant", hint: "The largest land animal" },
  { word: "astronaut", hint: "Someone who travels to space" },
  { word: "pizza", hint: "A beloved Italian dish with toppings" },
  { word: "keyboard", hint: "You type on this" },
  { word: "ocean", hint: "A vast body of salt water" },
  { word: "volcano", hint: "A mountain that can erupt with lava" },
  { word: "library", hint: "A place full of books to borrow" },
  { word: "thunder", hint: "The loud sound during a storm" },
  { word: "penguin", hint: "A flightless bird from Antarctica" },
  { word: "pyramid", hint: "An ancient Egyptian structure" },
  { word: "diamond", hint: "The hardest natural material" },
  { word: "guitar", hint: "A stringed musical instrument" },
  { word: "butterfly", hint: "An insect with colorful wings" },
  { word: "compass", hint: "A tool for finding direction" },
  { word: "dolphin", hint: "An intelligent marine mammal" },
  { word: "lantern", hint: "A portable light source" },
  { word: "cactus", hint: "A desert plant that stores water" },
  { word: "microscope", hint: "Used to see very tiny things" },
];

const MAX_WRONG = 6;

let word = "";
let hint = "";
let guessed = new Set();
let wrongCount = 0;
let gameOver = false;

const canvas = document.getElementById("hangman-canvas");
const ctx = canvas.getContext("2d");

function drawGallows() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#e94560";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  // Base
  line(20, 240, 180, 240);
  // Pole
  line(60, 240, 60, 20);
  // Top beam
  line(60, 20, 140, 20);
  // Rope
  line(140, 20, 140, 50);
}

function drawPart(n) {
  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 3;
  ctx.fillStyle = "#eee";

  switch (n) {
    case 1: // Head
      ctx.beginPath();
      ctx.arc(140, 70, 20, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 2: // Body
      line(140, 90, 140, 160);
      break;
    case 3: // Left arm
      line(140, 110, 110, 145);
      break;
    case 4: // Right arm
      line(140, 110, 170, 145);
      break;
    case 5: // Left leg
      line(140, 160, 110, 200);
      break;
    case 6: // Right leg
      line(140, 160, 170, 200);
      break;
  }
}

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function renderCanvas() {
  drawGallows();
  for (let i = 1; i <= wrongCount; i++) drawPart(i);
}

function renderWord() {
  const display = document.getElementById("word-display");
  display.innerHTML = word
    .split("")
    .map((ch) => {
      if (ch === " ") return `<div class="letter-box space"></div>`;
      const revealed = guessed.has(ch) ? ch : "";
      return `<div class="letter-box">${revealed}</div>`;
    })
    .join("");
}

function renderKeyboard() {
  const kb = document.getElementById("keyboard");
  kb.innerHTML = "";
  for (let i = 97; i <= 122; i++) {
    const ch = String.fromCharCode(i);
    const btn = document.createElement("button");
    btn.textContent = ch;
    btn.className = "key-btn";
    btn.dataset.letter = ch;
    if (guessed.has(ch)) {
      btn.disabled = true;
      btn.classList.add(word.includes(ch) ? "correct" : "wrong");
    }
    btn.addEventListener("click", () => guess(ch));
    kb.appendChild(btn);
  }
}

function renderUsed() {
  const sorted = [...guessed].sort();
  document.getElementById("used-letters").textContent = sorted.join("  ") || "—";
}

function setMessage(text, win = false) {
  const el = document.getElementById("message");
  el.textContent = text;
  el.className = "message" + (win ? " win" : "");
}

function checkWin() {
  return word.split("").every((ch) => ch === " " || guessed.has(ch));
}

function guess(ch) {
  if (gameOver || guessed.has(ch)) return;
  guessed.add(ch);

  if (!word.includes(ch)) {
    wrongCount++;
  }

  renderCanvas();
  renderWord();
  renderKeyboard();
  renderUsed();
  document.getElementById("wrong-count").textContent = wrongCount;

  if (checkWin()) {
    gameOver = true;
    setMessage("You won! 🎉", true);
    disableKeyboard();
  } else if (wrongCount >= MAX_WRONG) {
    gameOver = true;
    setMessage(`Game over! The word was: ${word.toUpperCase()}`);
    revealWord();
    disableKeyboard();
  }
}

function disableKeyboard() {
  document.querySelectorAll(".key-btn").forEach((b) => (b.disabled = true));
}

function revealWord() {
  const display = document.getElementById("word-display");
  display.innerHTML = word
    .split("")
    .map((ch) => {
      if (ch === " ") return `<div class="letter-box space"></div>`;
      const missed = !guessed.has(ch);
      return `<div class="letter-box" style="${missed ? "color:#e94560" : ""}">${ch}</div>`;
    })
    .join("");
}

function startGame() {
  const entry = WORDS[Math.floor(Math.random() * WORDS.length)];
  word = entry.word;
  hint = entry.hint;
  guessed = new Set();
  wrongCount = 0;
  gameOver = false;

  document.getElementById("wrong-count").textContent = 0;
  document.getElementById("hint").textContent = `Hint: ${hint}`;
  setMessage("");
  renderCanvas();
  renderWord();
  renderKeyboard();
  renderUsed();
}

document.getElementById("new-game-btn").addEventListener("click", startGame);

document.addEventListener("keydown", (e) => {
  const ch = e.key.toLowerCase();
  if (/^[a-z]$/.test(ch)) guess(ch);
});

startGame();
