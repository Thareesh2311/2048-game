
const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restart");
const darkBtn = document.getElementById("darkToggle");

const moveSound = document.getElementById("moveSound");
const mergeSound = document.getElementById("mergeSound");
const winSound = document.getElementById("winSound");

const board = Array(16).fill(0);
let score = 0;
let selectedIndex = null;
let gameWon = false;

let bestScore = localStorage.getItem("bestScore") || 0;
bestEl.textContent = bestScore;

/* ---------- INIT ---------- */
function init() {
  grid.innerHTML = "";
  board.fill(0);
  score = 0;
  selectedIndex = null;
  gameWon = false;
  messageEl.textContent = "";

  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.addEventListener("click", () => selectTile(i));
    grid.appendChild(cell);
  }

  addNumber();
  addNumber();
  update();
}

/* ---------- ADD TILE ---------- */
function addNumber() {
  const empty = board.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
  if (!empty.length) return;

  const index = empty[Math.floor(Math.random() * empty.length)];
  board[index] = Math.random() < 0.9 ? 2 : 4;
  selectedIndex = index;
}

/* ---------- UI ---------- */
function update() {
  [...grid.children].forEach((cell, i) => {
    cell.textContent = board[i] || "";
    cell.dataset.value = board[i];
    cell.classList.toggle("selected", i === selectedIndex);
    cell.classList.remove("merge");
  });

  scoreEl.textContent = score;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    bestEl.textContent = bestScore;
  }
}

/* ---------- SELECT ---------- */
function selectTile(index) {
  if (board[index]) {
    selectedIndex = index;
    update();
  }
}

/* ---------- MOVE ---------- */
function moveSelected(dir) {
  if (selectedIndex === null) return;

  const r = Math.floor(selectedIndex / 4);
  const c = selectedIndex % 4;

  let dr = 0, dc = 0;
  if (dir === "left") dc = -1;
  if (dir === "right") dc = 1;
  if (dir === "up") dr = -1;
  if (dir === "down") dr = 1;

  let nr = r + dr, nc = c + dc;
  let moved = false;

  while (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
    const next = nr * 4 + nc;

    if (board[next] === 0) {
      board[next] = board[selectedIndex];
      board[selectedIndex] = 0;
      selectedIndex = next;
      moved = true;
      moveSound.play();
    }
    else if (board[next] === board[selectedIndex]) {
      board[next] *= 2;
      score += board[next];
      board[selectedIndex] = 0;
      selectedIndex = null;
      moved = true;
      mergeSound.play();

      if (board[next] === 2048 && !gameWon) {
        gameWon = true;
        messageEl.textContent = "🎉 You reached 2048!";
        winSound.play();
      }
      break;
    }
    else break;

    nr += dr;
    nc += dc;
  }

  if (moved) {
    addNumber();
    if (isGameOver()) messageEl.textContent = "💀 Game Over!";
  }

  update();
}

/* ---------- GAME OVER ---------- */
function isGameOver() {
  for (let i = 0; i < 16; i++) {
    const r = Math.floor(i / 4);
    const c = i % 4;
    if (board[i] === 0) return false;
    if (c < 3 && board[i] === board[i + 1]) return false;
    if (r < 3 && board[i] === board[i + 4]) return false;
  }
  return true;
}

/* ---------- EVENTS ---------- */
document.addEventListener("keydown", e => {
  if (e.key.includes("Arrow")) moveSelected(e.key.replace("Arrow", "").toLowerCase());
});

restartBtn.onclick = init;
darkBtn.onclick = () => document.body.classList.toggle("dark");

/* ---------- MOBILE SWIPE ---------- */
let startX, startY;
document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});
document.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy))
    dx > 0 ? moveSelected("right") : moveSelected("left");
  else
    dy > 0 ? moveSelected("down") : moveSelected("up");
});

init();
