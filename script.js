const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const menu = document.getElementById("menu");
let intervalId;
let currentTetromino;
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;

highScoreDisplay.innerText = highScore;

class Tetromino {
    constructor(shape, x, y) {
        this.shape = shape;
        this.x = x;
        this.y = y;
        this.blocks = [];
        this.createBlocks();
    }

    createBlocks() {
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    const block = document.createElement("div");
                    block.classList.add("block");
                    block.style.left = (this.x + col) * 30 + "px";
                    block.style.top = (this.y + row) * 30 + "px";
                    gameBoard.appendChild(block);
                    this.blocks.push(block);
                }
            }
        }
    }

    canMoveDown() {
        for (let row = this.shape.length - 1; row >= 0; row--) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    const nextY = this.y + row + 1;
                    const nextX = this.x + col;
                    if (nextY === 20 || gameBoard.querySelector(`.fixed[style="left: ${nextX * 30}px; top: ${nextY * 30}px;"]`)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    moveDown() {
        if (this.canMoveDown()) {
            this.y++;
            this.updatePosition();
        } else {
            this.fixTetromino();
            clearRows();
            createNewTetromino();
        }
    }

    canMoveLeft() {
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    const nextX = this.x + col - 1;
                    const nextY = this.y + row;
                    if (nextX < 0 || gameBoard.querySelector(`.fixed[style="left: ${nextX * 30}px; top: ${nextY * 30}px;"]`)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    moveLeft() {
        if (this.canMoveLeft()) {
            this.x--;
            this.updatePosition();
        }
    }

    canMoveRight() {
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = this.shape[row].length - 1; col >= 0; col--) {
                if (this.shape[row][col]) {
                    const nextX = this.x + col + 1;
                    const nextY = this.y + row;
                    if (nextX === 10 || gameBoard.querySelector(`.fixed[style="left: ${nextX * 30}px; top: ${nextY * 30}px;"]`)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    moveRight() {
        if (this.canMoveRight()) {
            this.x++;
            this.updatePosition();
        }
    }

    updatePosition() {
        let blockIndex = 0;
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col]) {
                    this.blocks[blockIndex].style.left = (this.x + col) * 30 + "px";
                    this.blocks[blockIndex].style.top = (this.y + row) * 30 + "px";
                    blockIndex++;
                }
            }
        }
    }

    fixTetromino() {
        this.blocks.forEach(block => {
            block.classList.add("fixed");
        });
    }

    canRotateClockwise() {
        const newShape = this.rotate90Clockwise(this.shape);
        for (let row = 0; row < newShape.length; row++) {
            for (let col = 0; col < newShape[row].length; col++) {
                if (newShape[row][col]) {
                    const nextX = this.x + col;
                    const nextY = this.y + row;
                    if (
                        nextX < 0 ||
                        nextX >= 10 ||
                        nextY >= 20 ||
                        gameBoard.querySelector(`.fixed[style="left: ${nextX * 30}px; top: ${nextY * 30}px;"]`)
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    rotateClockwise() {
        if (this.canRotateClockwise()) {
            this.shape = this.rotate90Clockwise(this.shape);
            this.updatePosition();
        }
    }

    rotate90Clockwise(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotatedShape = [];

        for (let col = 0; col < cols; col++) {
            rotatedShape[col] = [];
            for (let row = 0; row < rows; row++) {
                rotatedShape[col][rows - row - 1] = shape[row][col];
            }
        }

        return rotatedShape;
    }
}

function createNewTetromino() {
    const tetrominoShapes = [
        [[1], [1], [1], [1]],
        [[1, 1], [1, 1]],
        [[0, 1, 0], [1, 1, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 1, 0], [0, 1, 1]],
        [[1, 0, 0], [1, 1, 1]],
        [[0, 0, 1], [1, 1, 1]]
    ];

    const randomIndex = Math.floor(Math.random() * tetrominoShapes.length);
    const randomShape = tetrominoShapes[randomIndex];
    const randomX = Math.floor(Math.random() * (10 - randomShape[0].length + 1));

    // Check if the new tetromino can be created at the top row
    for (let col = 0; col < randomShape[0].length; col++) {
        if (gameBoard.querySelector(`.fixed[style="left: ${(randomX + col) * 30}px; top: 0px;"]`)) {
            // Game over condition: Tetromino cannot be created at the top row
            gameOver();
            return;
        }
    }

    if (intervalId) {
        clearInterval(intervalId);
    }

    currentTetromino = new Tetromino(randomShape, randomX, 0);
    intervalId = setInterval(() => {
        currentTetromino.moveDown();
    }, 1000);
}

function gameOver() {
    clearInterval(intervalId);
    document.getElementById("game-over").style.display = "block";
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.innerText = highScore;
    }
}

function clearRows() {
    for (let y = 19; y >= 0; y--) {
        let isFullRow = true;
        for (let x = 0; x < 10; x++) {
            if (!gameBoard.querySelector(`.fixed[style="left: ${x * 30}px; top: ${y * 30}px;"]`)) {
                isFullRow = false;
                break;
            }
        }
        if (isFullRow) {
            score += 10;
            scoreDisplay.innerText = score;
            document.querySelectorAll(`.fixed[style*="top: ${y * 30}px;"]`).forEach(block => block.remove());

            document.querySelectorAll('.fixed').forEach(block => {
                const blockTop = parseInt(block.style.top);
                if (blockTop < y * 30) {
                    block.style.top = blockTop + 30 + 'px';
                }
            });
            y++; // Recheck the same row after blocks above have moved down
        }
    }
}

function startGame() {
    score = 0;
    scoreDisplay.innerText = score;
    gameBoard.innerHTML = ''; // Clear the game board
    document.getElementById("game-over").style.display = "none";
    createNewTetromino();
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

document.addEventListener("keydown", (event) => {
    if (currentTetromino) {
        if (event.key === "a" || event.key === "A") {
            currentTetromino.moveLeft();
        } else if (event.key === "d" || event.key === "D") {
            currentTetromino.moveRight();
        } else if (event.key === "s" || event.key === "S") {
            currentTetromino.moveDown();
        } else if (event.key === "w" || event.key === "W") {
            // Rotate the tetromino clockwise
            currentTetromino.rotateClockwise();
        }
    }
});
