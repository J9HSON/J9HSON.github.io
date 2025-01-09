const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let direction = {x: 0, y: 0};
let score = 0;
let gameSpeed = 100;

function gameLoop() {
  update();
  draw();
  setTimeout(gameLoop, gameSpeed);
}

function update() {
  const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
  
  // 边界检测
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    resetGame();
    return;
  }
  
  // 自身碰撞检测
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    resetGame();
    return;
  }
  
  snake.unshift(head);
  
  // 吃食物
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById('score').textContent = score;
    placeFood();
    if (gameSpeed > 50) gameSpeed -= 2;
  } else {
    snake.pop();
  }
}

function draw() {
  // 清空画布
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制网格线
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
  
  // 绘制蛇
  snake.forEach((segment, index) => {
    drawMechanicalSegment(segment.x, segment.y, index === 0);
  });
  
  // 绘制食物
  drawMechanicalFood(food.x, food.y);
}

function drawMechanicalSegment(x, y, isHead) {
  const size = gridSize;
  const padding = 2;
  
  // 主体
  ctx.fillStyle = isHead ? '#00ff00' : '#00cc00';
  ctx.beginPath();
  ctx.roundRect(
    x * size + padding,
    y * size + padding,
    size - padding * 2,
    size - padding * 2,
    4
  );
  ctx.fill();
  
  // 边框
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // 机械细节
  if (isHead) {
    // 绘制眼睛
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(
      x * size + size * 0.3,
      y * size + size * 0.3,
      2,
      0,
      Math.PI * 2
    );
    ctx.arc(
      x * size + size * 0.7,
      y * size + size * 0.3,
      2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function drawMechanicalFood(x, y) {
  const size = gridSize;
  const padding = 4;
  
  // 主体
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.roundRect(
    x * size + padding,
    y * size + padding,
    size - padding * 2,
    size - padding * 2,
    6
  );
  ctx.fill();
  
  // 边框
  ctx.strokeStyle = '#ff8888';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 闪烁效果
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(Math.sin(Date.now() / 200)) * 0.5})`;
  ctx.fillRect(
    x * size + padding + 2,
    y * size + padding + 2,
    size - padding * 2 - 4,
    size - padding * 2 - 4
  );
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
  
  // 确保食物不会生成在蛇身上
  while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  }
}

function resetGame() {
  snake = [{x: 10, y: 10}];
  direction = {x: 0, y: 0};
  score = 0;
  gameSpeed = 100;
  document.getElementById('score').textContent = score;
  placeFood();
}

// 键盘控制
window.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowUp':
      if (direction.y === 0) direction = {x: 0, y: -1};
      break;
    case 'ArrowDown':
      if (direction.y === 0) direction = {x: 0, y: 1};
      break;
    case 'ArrowLeft':
      if (direction.x === 0) direction = {x: -1, y: 0};
      break;
    case 'ArrowRight':
      if (direction.x === 0) direction = {x: 1, y: 0};
      break;
  }
});

// 移动端触摸控制
const controls = document.querySelectorAll('.control');
controls.forEach(control => {
  control.addEventListener('click', () => {
    const directionMap = {
      'up': {x: 0, y: -1},
      'down': {x: 0, y: 1},
      'left': {x: -1, y: 0},
      'right': {x: 1, y: 0}
    };
    
    const dir = directionMap[control.classList[1]];
    if ((dir.x !== 0 && direction.x === 0) || 
        (dir.y !== 0 && direction.y === 0)) {
      direction = dir;
    }
  });
});

// 触摸屏手势控制
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const touchEndX = e.touches[0].clientX;
  const touchEndY = e.touches[0].clientY;
  
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // 水平滑动
    if (dx > 0 && direction.x === 0) {
      direction = {x: 1, y: 0}; // 向右
    } else if (dx < 0 && direction.x === 0) {
      direction = {x: -1, y: 0}; // 向左
    }
  } else {
    // 垂直滑动
    if (dy > 0 && direction.y === 0) {
      direction = {x: 0, y: 1}; // 向下
    } else if (dy < 0 && direction.y === 0) {
      direction = {x: 0, y: -1}; // 向上
    }
  }
}, { passive: false });

placeFood();
gameLoop();
