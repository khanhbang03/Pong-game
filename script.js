// Simple Pong game
// Left paddle: player (mouse & Up/Down keys)
// Right paddle: basic AI

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const leftScoreEl = document.getElementById('leftScore');
const rightScoreEl = document.getElementById('rightScore');

const W = canvas.width;
const H = canvas.height;

// Game settings
const paddleWidth = 12;
const paddleHeight = 90;
const paddleSpeed = 6;         // keyboard move speed
const aiSpeedBase = 4.2;      // base AI speed, scales slightly with ball speed
const ballRadius = 8;
const initialBallSpeed = 5;
const ballSpeedIncrease = 0.3; // after each paddle hit

// Game state
let leftPaddle = { x: 12, y: (H - paddleHeight) / 2, width: paddleWidth, height: paddleHeight };
let rightPaddle = { x: W - paddleWidth - 12, y: (H - paddleHeight) / 2, width: paddleWidth, height: paddleHeight };

let ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, speed: initialBallSpeed, radius: ballRadius };

let leftScore = 0;
let rightScore = 0;

let keys = { ArrowUp: false, ArrowDown: false };
let mouseActive = false;

let running = true;

// Initialize ball with random direction (to left or right)
function launchBall(direction = null) {
  ball.x = W / 2;
  ball.y = H / 2;
  ball.speed = initialBallSpeed;

  const angleRange = (Math.PI / 3); // up to +/- 60 degrees
  let angle = (Math.random() * angleRange) - (angleRange / 2);
  // If direction not specified, random left or right
  const dir = direction === null ? (Math.random() < 0.5 ? -1 : 1) : direction;
  ball.vx = Math.cos(angle) * ball.speed * dir;
  ball.vy = Math.sin(angle) * ball.speed;
}

// Utility clamp
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

// Draw functions
function drawRect(x, y, w, h, color = '#fff') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function drawCircle(x, y, r, color = '#fff') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function drawNet() {
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  const step = 14;
  const dashH = 8;
  for (let y = 0; y < H; y += step) {
    ctx.fillRect((W / 2) - 1, y, 2, dashH);
  }
}

// Update loop
function update() {
  if (!running) return;

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collisions (top / bottom)
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy = -ball.vy;
  } else if (ball.y + ball.radius >= H) {
    ball.y = H - ball.radius;
    ball.vy = -ball.vy;
  }

  // Paddle collisions
  // Left paddle
  if (ball.vx < 0 &&
      ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
      ball.x - ball.radius >= leftPaddle.x &&
      ball.y >= leftPaddle.y &&
      ball.y <= leftPaddle.y + leftPaddle.height) {

    // Compute hit position: -1 (top) to 1 (bottom)
    const relativeIntersectY = (ball.y - (leftPaddle.y + leftPaddle.height / 2));
    const normalized = relativeIntersectY / (leftPaddle.height / 2);
    const maxBounceAngle = (5 * Math.PI) / 12; // 75 degrees
    const bounceAngle = normalized * maxBounceAngle;

    // Set ball direction to the right
    ball.speed += ballSpeedIncrease;
    const dir = 1;
    ball.vx = Math.cos(bounceAngle) * ball.speed * dir;
    ball.vy = Math.sin(bounceAngle) * ball.speed;
    // Nudge ball out of paddle to avoid sticking
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius + 0.5;
  }

  // Right paddle
  if (ball.vx > 0 &&
      ball.x + ball.radius >= rightPaddle.x &&
      ball.x + ball.radius <= rightPaddle.x + rightPaddle.width &&
      ball.y >= rightPaddle.y &&
      ball.y <= rightPaddle.y + rightPaddle.height) {

    const relativeIntersectY = (ball.y - (rightPaddle.y + rightPaddle.height / 2));
    const normalized = relativeIntersectY / (rightPaddle.height / 2);
    const maxBounceAngle = (5 * Math.PI) / 12;
    const bounceAngle = normalized * maxBounceAngle;

    ball.speed += ballSpeedIncrease;
    const dir = -1;
    ball.vx = Math.cos(bounceAngle) * ball.speed * dir;
    ball.vy = Math.sin(bounceAngle) * ball.speed;
    ball.x = rightPaddle.x - ball.radius - 0.5;
  }

  // Score detection
  if (ball.x - ball.radius <= 0) {
    // Right player scores
    rightScore++;
    rightScoreEl.textContent = rightScore;
    running = false;
    setTimeout(() => { launchBall(1); running = true; }, 800);
  } else if (ball.x + ball.radius >= W) {
    // Left player scores
    leftScore++;
    leftScoreEl.textContent = leftScore;
    running = false;
    setTimeout(() => { launchBall(-1); running = true; }, 800);
  }

  // Player keyboard movement
  if (keys.ArrowUp) {
    leftPaddle.y -= paddleSpeed;
  } else if (keys.ArrowDown) {
    leftPaddle.y += paddleSpeed;
  }
  leftPaddle.y = clamp(leftPaddle.y, 0, H - leftPaddle.height);

  // AI movement: simple follow with speed limit
  const aiSpeed = aiSpeedBase + (ball.speed * 0.2);
  const rightCenter = rightPaddle.y + rightPaddle.height / 2;
  if (ball.y < rightCenter - 8) {
    rightPaddle.y -= aiSpeed;
  } else if (ball.y > rightCenter + 8) {
    rightPaddle.y += aiSpeed;
  }
  rightPaddle.y = clamp(rightPaddle.y, 0, H - rightPaddle.height);
}

// Render loop
function render() {
  ctx.clearRect(0, 0, W, H);

  // Background
  // draw net
  drawNet();

  // Paddles
  drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, '#7dd3fc');
  drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, '#fca5a5');

  // Ball
  drawCircle(ball.x, ball.y, ball.radius, '#fef3c7');
}

// Main animate
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

// Input handlers
window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
    keys[e.code] = true;
    e.preventDefault();
  }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
    keys[e.code] = false;
    e.preventDefault();
  }
});

// Mouse move on canvas controls paddle center
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  // set paddle so its center follows mouse
  leftPaddle.y = clamp(y - leftPaddle.height / 2, 0, H - leftPaddle.height);
  mouseActive = true;
});

// Pause / resume on click
canvas.addEventListener('click', () => {
  running = !running;
  // If resumed and ball has zero velocity due to start stage, relaunch
  if (running && Math.abs(ball.vx) < 0.001 && Math.abs(ball.vy) < 0.001) {
    launchBall();
  }
});

// Touch support (map touch to mouse)
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const y = e.touches[0].clientY - rect.top;
  leftPaddle.y = clamp(y - leftPaddle.height / 2, 0, H - leftPaddle.height);
}, { passive: false });

// Initialize
launchBall();
requestAnimationFrame(loop);