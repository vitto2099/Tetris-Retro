const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
ctx.scale(30, 30);
const ROWS = 20;
const COLUMNS = 10;
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}
function createPiece(type) {
  switch (type) {
    case 'T': return [[0,1,0],[1,1,1]];
    case 'O': return [[2,2],[2,2]];
    case 'L': return [[0,3,0],[0,3,0],[0,3,3]];
    case 'J': return [[0,4,0],[0,4,0],[4,4,0]];
    case 'I': return [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]];
    case 'S': return [[0,6,6],[6,6,0],[0,0,0]];
    case 'Z': return [[7,7,0],[0,7,7],[0,0,0]];
    default: return [[0]];
  }
}
function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}
function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}
function draw() {
  ctx.fillStyle = "#306230";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = "#9bbc0f";
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}
function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}
function arenaSweep() {
  let rowCount = 1;
  for (let y = arena.length - 1; y >= 0; y--) {
    if (arena[y].every(value => value !== 0)) {
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      y++;
      player.score += rowCount * 10;
      rowCount *= 2;
    }
  }
}
function updateScore() {
  document.getElementById("score").innerText = "Score: " + player.score;
}
function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    updateScore();
    playerReset();
  }
  dropCounter = 0;
}
function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}
function playerReset() {
  const pieces = 'TOLJISZ';
  const type = pieces[Math.floor(Math.random() * pieces.length)];
  player.matrix = createPiece(type);
  player.pos.y = 0;
  player.pos.x = Math.floor(COLUMNS / 2) - Math.floor(player.matrix[0].length / 2);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) playerDrop();
  draw();
  requestAnimationFrame(update);
}
document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") playerMove(-1);
  else if (event.key === "ArrowRight") playerMove(1);
  else if (event.key === "ArrowDown") playerDrop();
  else if (event.key === " ") playerRotate(1);
});
const arena = createMatrix(COLUMNS, ROWS);
const player = { pos: { x: 0, y: 0 }, matrix: null, score: 0 };
function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  playerReset();
  updateScore();
  lastTime = performance.now();
  update();
}
document.getElementById("start-button").addEventListener("click", startGame);
