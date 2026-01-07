const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverElement = document.getElementById('game-over');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{
    x: 10,
    y: 10
}];
let food = {
    x: 15,
    y: 15
};
let dx = 0;
let dy = 0;
let score = 0;
let gameRunning = false;
let gameStarted = false;

// Sound effects using Web Audio API
function playSound(frequency, duration) {
    const audioContext = new(window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function drawGame() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#0f0';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }

    // Draw food
    ctx.fillStyle = '#f00';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function updateGame() {
    if (!gameRunning) return;

    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = `Score: ${score}`;
        playSound(800, 0.1); // Eat sound
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Ensure food doesn't spawn on snake
    for (let segment of snake) {
        if (food.x === segment.x && food.y === segment.y) {
            generateFood();
            return;
        }
    }
}

function gameOver() {
    gameRunning = false;
    playSound(200, 0.5); // Game over sound
    gameOverElement.style.display = 'block';
}

function resetGame() {
    snake = [{
        x: 10,
        y: 10
    }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameRunning = false;
    gameStarted = false;
    startScreen.style.display = 'block';
    gameOverElement.style.display = 'none';
    generateFood();
}

document.addEventListener('keydown', (e) => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        dx = 1; // Start moving right
        dy = 0;
        startScreen.style.display = 'none';
        return;
    }
    if (!gameRunning && e.code === 'Space') {
        resetGame();
        return;
    }
    if (!gameRunning) return;

    const key = e.code;
    if (key === 'ArrowUp' || key === 'KeyW') {
        if (dy === 0) {
            dx = 0;
            dy = -1;
        }
    } else if (key === 'ArrowDown' || key === 'KeyS') {
        if (dy === 0) {
            dx = 0;
            dy = 1;
        }
    } else if (key === 'ArrowLeft' || key === 'KeyA') {
        if (dx === 0) {
            dx = -1;
            dy = 0;
        }
    } else if (key === 'ArrowRight' || key === 'KeyD') {
        if (dx === 0) {
            dx = 1;
            dy = 0;
        }
    }
});

function gameLoop() {
    updateGame();
    drawGame();
}

setInterval(gameLoop, 100); // Game speed
generateFood();