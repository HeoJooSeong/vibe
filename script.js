const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const scoreElement = document.querySelector('#score');
const startButton = document.querySelector('#start-button');
const message = document.querySelector('#game-message');
const messageTitle = document.querySelector('#message-title');
const messageText = document.querySelector('#message-text');

const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;
const GAME_SPEED = 135;
const DIRECTIONS = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameTimer;
let gameState = 'ready';

function resetGame() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = DIRECTIONS.right;
  nextDirection = direction;
  score = 0;
  food = createFood();
  scoreElement.textContent = score;
  draw();
}

function createFood() {
  const available = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!snake?.some((segment) => segment.x === x && segment.y === y)) available.push({ x, y });
    }
  }
  return available[Math.floor(Math.random() * available.length)];
}

function draw() {
  context.fillStyle = '#b8d893';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  snake.forEach((segment, index) => drawSnakeSegment(segment, index === 0));
}

function drawGrid() {
  context.strokeStyle = 'rgba(66, 112, 61, .09)';
  context.lineWidth = 1;
  for (let i = 1; i < GRID_SIZE; i += 1) {
    const position = i * CELL_SIZE;
    context.beginPath(); context.moveTo(position, 0); context.lineTo(position, canvas.height); context.stroke();
    context.beginPath(); context.moveTo(0, position); context.lineTo(canvas.width, position); context.stroke();
  }
}

function drawSnakeSegment(segment, isHead) {
  const padding = 2.5;
  const x = segment.x * CELL_SIZE + padding;
  const y = segment.y * CELL_SIZE + padding;
  context.fillStyle = isHead ? '#2e6845' : '#4f8b54';
  roundRect(context, x, y, CELL_SIZE - padding * 2, CELL_SIZE - padding * 2, 6);
  context.fill();
  if (isHead) {
    context.fillStyle = '#f8f5dc';
    const eyeX = direction.x < 0 ? x + 5 : direction.x > 0 ? x + CELL_SIZE - 7 : x + 6;
    const eyeY = direction.y < 0 ? y + 6 : direction.y > 0 ? y + CELL_SIZE - 7 : y + 6;
    context.beginPath(); context.arc(eyeX, eyeY, 2, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(direction.x === 0 ? x + CELL_SIZE - 7 : eyeX, direction.y === 0 ? y + CELL_SIZE - 7 : eyeY, 2, 0, Math.PI * 2); context.fill();
  }
}

function drawFood() {
  const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = food.y * CELL_SIZE + CELL_SIZE / 2 + 2;
  context.fillStyle = '#e8a849';
  context.beginPath(); context.arc(centerX, centerY, 7, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#6b974e';
  context.beginPath(); context.ellipse(centerX + 4, centerY - 7, 5, 2.5, -.5, 0, Math.PI * 2); context.fill();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y); ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius); ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius); ctx.closePath();
}

function tick() {
  direction = nextDirection;
  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };
  const hitWall = newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;
  const ateFood = newHead.x === food.x && newHead.y === food.y;
  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((segment) => segment.x === newHead.x && segment.y === newHead.y);
  if (hitWall || hitSelf) return endGame();

  snake.unshift(newHead);
  if (ateFood) {
    score += 1;
    scoreElement.textContent = score;
    food = createFood();
  } else snake.pop();
  draw();
}

function startGame() {
  if (gameState === 'running') return;
  resetGame();
  gameState = 'running';
  startButton.textContent = '다시 시작';
  message.classList.add('hidden');
  gameTimer = window.setInterval(tick, GAME_SPEED);
}

function endGame() {
  window.clearInterval(gameTimer);
  gameState = 'over';
  messageTitle.textContent = '게임 오버';
  messageText.textContent = `${score}점을 기록했어요. 다시 도전해보세요!`;
  message.classList.remove('hidden');
  startButton.textContent = '다시 시작';
}

function setDirection(directionName) {
  if (gameState !== 'running') return;
  const requested = DIRECTIONS[directionName];
  if (requested.x + direction.x === 0 && requested.y + direction.y === 0) return;
  nextDirection = requested;
}

const keyDirections = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
window.addEventListener('keydown', (event) => {
  const requested = keyDirections[event.key];
  if (!requested) return;
  event.preventDefault();
  setDirection(requested);
});
document.querySelectorAll('[data-direction]').forEach((button) => button.addEventListener('click', () => setDirection(button.dataset.direction)));
startButton.addEventListener('click', startGame);

resetGame();
