// ===========================
// Constants & Configuration
// ===========================

const CONFIG = {
    CANVAS_SIZE: 400,
    GRID_SIZE: 20,
    CELL_SIZE: 20, // 400 / 20 = 20
    INITIAL_SPEED: 150, // milliseconds per frame
    POINTS_PER_FOOD: 10,
    POINTS_PER_LEVEL: 50, // Level up every 50 points
    SPEED_INCREASE_PER_LEVEL: 10, // Speed increases by 10ms per level
    COLORS: {
        snake: '#4CAF50',
        food: '#f44336',
        background: '#f5f5f5',
        grid: '#e0e0e0'
    }
};

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Arrow key codes
const KEYS = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32 // For pause toggle
};

// ===========================
// Game State
// ===========================

const gameState = {
    snake: [],
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    food: { x: 0, y: 0 },
    score: 0,
    highScore: 0,
    level: 1,
    currentSpeed: 150,
    isRunning: false,
    isPaused: false,
    gameLoopId: null
};

// ===========================
// Canvas Context
// ===========================

let canvas;
let ctx;

// ===========================
// Initialization Functions
// ===========================

function initializeGame() {
    // Reset snake to 3 segments starting at center-left
    gameState.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    // Reset direction
    gameState.direction = DIRECTIONS.RIGHT;
    gameState.nextDirection = DIRECTIONS.RIGHT;

    // Reset score and level
    gameState.score = 0;
    gameState.level = 1;
    updateScoreDisplay();
    updateLevelDisplay();

    // Get selected difficulty
    const difficultySelect = document.getElementById('difficulty');
    gameState.currentSpeed = parseInt(difficultySelect.value);

    // Load high score
    gameState.highScore = loadHighScore();
    document.getElementById('high-score').textContent = gameState.highScore;

    // Generate first food
    gameState.food = generateFood();

    // Reset running and pause state
    gameState.isRunning = false;
    gameState.isPaused = false;

    // Initial render
    render();
}

function loadHighScore() {
    try {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
        console.warn('Could not load high score:', e);
        return 0;
    }
}

function saveHighScore() {
    try {
        localStorage.setItem('snakeHighScore', gameState.highScore.toString());
    } catch (e) {
        console.warn('Could not save high score:', e);
    }
}

// ===========================
// Snake Movement & Controls
// ===========================

function moveSnake() {
    // Update direction from buffer
    gameState.direction = gameState.nextDirection;

    // Calculate new head position
    const head = gameState.snake[0];
    const newHead = {
        x: head.x + gameState.direction.x,
        y: head.y + gameState.direction.y
    };

    // Add new head to front
    gameState.snake.unshift(newHead);

    // Check if food eaten
    if (checkFoodCollision(newHead)) {
        // Snake grows (keep tail)
        updateScore(CONFIG.POINTS_PER_FOOD);
        gameState.food = generateFood();
    } else {
        // Remove tail (snake moves without growing)
        gameState.snake.pop();
    }
}

function handleKeyPress(event) {
    // Handle spacebar for pause toggle
    if (event.keyCode === KEYS.SPACE) {
        event.preventDefault();
        if (gameState.isRunning) {
            togglePause();
        }
        return;
    }

    // Prevent default arrow key scrolling
    if ([KEYS.LEFT, KEYS.UP, KEYS.RIGHT, KEYS.DOWN].includes(event.keyCode)) {
        event.preventDefault();
    }

    // Don't process direction changes if game is paused or not running
    if (!gameState.isRunning || gameState.isPaused) {
        return;
    }

    let newDirection;

    // Map arrow keys to directions
    switch (event.keyCode) {
        case KEYS.LEFT:
            newDirection = DIRECTIONS.LEFT;
            break;
        case KEYS.UP:
            newDirection = DIRECTIONS.UP;
            break;
        case KEYS.RIGHT:
            newDirection = DIRECTIONS.RIGHT;
            break;
        case KEYS.DOWN:
            newDirection = DIRECTIONS.DOWN;
            break;
        default:
            return; // Ignore other keys
    }

    // Prevent 180-degree turns
    if (!isOppositeDirection(newDirection, gameState.direction)) {
        gameState.nextDirection = newDirection;
    }
}

function isOppositeDirection(newDir, currentDir) {
    return newDir.x === -currentDir.x && newDir.y === -currentDir.y;
}

// ===========================
// Food Generation
// ===========================

function generateFood() {
    let foodPosition;

    // Keep generating until food is not on snake
    do {
        foodPosition = {
            x: Math.floor(Math.random() * CONFIG.GRID_SIZE),
            y: Math.floor(Math.random() * CONFIG.GRID_SIZE)
        };
    } while (isFoodOnSnake(foodPosition));

    return foodPosition;
}

function isFoodOnSnake(position) {
    return gameState.snake.some(segment =>
        segment.x === position.x && segment.y === position.y
    );
}

// ===========================
// Collision Detection
// ===========================

function checkWallCollision(head) {
    return head.x < 0 ||
           head.x >= CONFIG.GRID_SIZE ||
           head.y < 0 ||
           head.y >= CONFIG.GRID_SIZE;
}

function checkSelfCollision(head) {
    // Check if head collides with body (skip first element - the head itself)
    return gameState.snake.slice(1).some(segment =>
        segment.x === head.x && segment.y === head.y
    );
}

function checkFoodCollision(head) {
    return head.x === gameState.food.x && head.y === gameState.food.y;
}

// ===========================
// Score Management
// ===========================

function updateScore(points) {
    const oldScore = gameState.score;
    gameState.score += points;
    updateScoreDisplay();

    // Check for level up (every 50 points)
    const oldLevel = Math.floor(oldScore / CONFIG.POINTS_PER_LEVEL) + 1;
    const newLevel = Math.floor(gameState.score / CONFIG.POINTS_PER_LEVEL) + 1;

    if (newLevel > oldLevel) {
        levelUp(newLevel);
    }

    // Check and update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHighScore();
        document.getElementById('high-score').textContent = gameState.highScore;
    }
}

function updateScoreDisplay() {
    document.getElementById('current-score').textContent = gameState.score;
}

function levelUp(newLevel) {
    gameState.level = newLevel;
    updateLevelDisplay();

    // Increase speed (decrease interval time) by 10ms per level
    // But make sure it doesn't go below 30ms
    const speedDecrease = (newLevel - 1) * CONFIG.SPEED_INCREASE_PER_LEVEL;
    const difficultySelect = document.getElementById('difficulty');
    const baseSpeed = parseInt(difficultySelect.value);
    gameState.currentSpeed = Math.max(30, baseSpeed - speedDecrease);

    // Restart game loop with new speed
    if (gameState.isRunning && !gameState.isPaused) {
        clearInterval(gameState.gameLoopId);
        gameState.gameLoopId = setInterval(gameLoop, gameState.currentSpeed);
    }
}

function updateLevelDisplay() {
    document.getElementById('current-level').textContent = gameState.level;
}

// ===========================
// Game Loop
// ===========================

function startGame() {
    if (gameState.isRunning) return;

    // Initialize game
    initializeGame();
    gameState.isRunning = true;

    // UI updates
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('pause-btn').style.display = 'inline-block';
    document.getElementById('pause-btn').textContent = '일시정지';
    document.getElementById('game-over-message').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'none';

    // Start game loop
    gameState.gameLoopId = setInterval(gameLoop, gameState.currentSpeed);
}

function gameLoop() {
    // Move snake
    moveSnake();

    // Get head position
    const head = gameState.snake[0];

    // Check collisions
    if (checkWallCollision(head) || checkSelfCollision(head)) {
        gameOver();
        return;
    }

    // Render
    render();
}

function gameOver() {
    gameState.isRunning = false;
    gameState.isPaused = false;
    clearInterval(gameState.gameLoopId);

    // UI updates
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-over-message').style.display = 'block';
    document.getElementById('restart-btn').style.display = 'inline-block';
    document.getElementById('pause-btn').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'block';
}

function togglePause() {
    if (!gameState.isRunning) return;

    gameState.isPaused = !gameState.isPaused;
    const pauseBtn = document.getElementById('pause-btn');

    if (gameState.isPaused) {
        // Pause the game
        clearInterval(gameState.gameLoopId);
        pauseBtn.textContent = '재개';
    } else {
        // Resume the game
        gameState.gameLoopId = setInterval(gameLoop, gameState.currentSpeed);
        pauseBtn.textContent = '일시정지';
    }
}

// ===========================
// Rendering
// ===========================

function render() {
    // Clear canvas
    ctx.fillStyle = CONFIG.COLORS.background;
    ctx.fillRect(0, 0, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);

    // Draw grid (optional)
    drawGrid();

    // Draw snake
    ctx.fillStyle = CONFIG.COLORS.snake;
    gameState.snake.forEach(segment => {
        ctx.fillRect(
            segment.x * CONFIG.CELL_SIZE,
            segment.y * CONFIG.CELL_SIZE,
            CONFIG.CELL_SIZE - 1, // -1 for gap between segments
            CONFIG.CELL_SIZE - 1
        );
    });

    // Draw food
    ctx.fillStyle = CONFIG.COLORS.food;
    ctx.fillRect(
        gameState.food.x * CONFIG.CELL_SIZE,
        gameState.food.y * CONFIG.CELL_SIZE,
        CONFIG.CELL_SIZE - 1,
        CONFIG.CELL_SIZE - 1
    );
}

function drawGrid() {
    ctx.strokeStyle = CONFIG.COLORS.grid;
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let i = 0; i <= CONFIG.GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CONFIG.CELL_SIZE, 0);
        ctx.lineTo(i * CONFIG.CELL_SIZE, CONFIG.CANVAS_SIZE);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let i = 0; i <= CONFIG.GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CONFIG.CELL_SIZE);
        ctx.lineTo(CONFIG.CANVAS_SIZE, i * CONFIG.CELL_SIZE);
        ctx.stroke();
    }
}

// ===========================
// Event Listeners & Initialization
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Get canvas and context
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Initialize game
    initializeGame();

    // Event listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.addEventListener('keydown', handleKeyPress);
});
