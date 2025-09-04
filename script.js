class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 游戏状态
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // 蛇的初始状态
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        
        // 食物
        this.food = { x: 15, y: 15 };
        
        // 游戏设置
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.speed = 5;
        this.difficulty = 'medium';
        
        // 触屏控制
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDistance = 30;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
        this.generateFood();
        this.draw();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.resetButton = document.getElementById('resetButton');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 触屏控制
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // 按钮控制
        this.startButton.addEventListener('click', () => this.startGame());
        this.pauseButton.addEventListener('click', () => this.togglePause());
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        // 设置控制
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            this.speedValue.textContent = this.speed;
        });
        
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.applyDifficulty();
        });
        
        // 防止页面滚动
        document.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning && e.code === 'Space') {
            if (this.gameOver) {
                this.resetGame();
            } else {
                this.startGame();
            }
            return;
        }
        
        if (e.code === 'Space') {
            this.togglePause();
            return;
        }
        
        if (this.gamePaused || !this.gameRunning) return;
        
        switch(e.code) {
            case 'ArrowUp':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        
        if (!this.gameRunning) {
            if (!this.gameOver) {
                this.startGame();
            }
            return;
        }
        
        if (this.gamePaused) return;
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
            return;
        }
        
        if (absDeltaX > absDeltaY) {
            // 水平滑动
            if (deltaX > 0 && this.direction.x === 0) {
                this.nextDirection = { x: 1, y: 0 }; // 右
            } else if (deltaX < 0 && this.direction.x === 0) {
                this.nextDirection = { x: -1, y: 0 }; // 左
            }
        } else {
            // 垂直滑动
            if (deltaY > 0 && this.direction.y === 0) {
                this.nextDirection = { x: 0, y: 1 }; // 下
            } else if (deltaY < 0 && this.direction.y === 0) {
                this.nextDirection = { x: 0, y: -1 }; // 上
            }
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.hideOverlay();
        this.pauseButton.disabled = false;
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseButton.textContent = this.gamePaused ? '继续' : '暂停';
        
        if (this.gamePaused) {
            this.showOverlay('游戏暂停', '按空格键继续游戏');
        } else {
            this.hideOverlay();
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.generateFood();
        this.updateDisplay();
        this.pauseButton.textContent = '暂停';
        this.pauseButton.disabled = true;
        this.showOverlay('游戏开始', '按空格键开始游戏');
        this.draw();
    }
    
    applyDifficulty() {
        switch(this.difficulty) {
            case 'easy':
                this.speedSlider.value = 3;
                this.speed = 3;
                break;
            case 'medium':
                this.speedSlider.value = 5;
                this.speed = 5;
                break;
            case 'hard':
                this.speedSlider.value = 8;
                this.speed = 8;
                break;
        }
        this.speedValue.textContent = this.speed;
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        this.update();
        this.draw();
        
        const gameSpeed = Math.max(50, 200 - (this.speed - 1) * 15);
        setTimeout(() => this.gameLoop(), gameSpeed);
    }
    
    update() {
        // 更新方向
        this.direction = { ...this.nextDirection };
        
        if (this.direction.x === 0 && this.direction.y === 0) return;
        
        // 移动蛇头
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 检查边界碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // 检查自身碰撞
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.endGame();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += this.getScoreIncrement();
            this.generateFood();
            this.updateDisplay();
            this.updateHighScore();
        } else {
            this.snake.pop();
        }
    }
    
    getScoreIncrement() {
        switch(this.difficulty) {
            case 'easy': return 5;
            case 'medium': return 10;
            case 'hard': return 15;
            default: return 10;
        }
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制蛇
        this.drawSnake();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // 绘制食物（苹果样式）
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2 - 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 添加高光效果
        this.ctx.fillStyle = '#fc8181';
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2 - 3, y + this.gridSize/2 - 3, 3, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#38a169';
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
                
                // 蛇头的眼睛
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x + 4, y + 4, 3, 3);
                this.ctx.fillRect(x + this.gridSize - 7, y + 4, 3, 3);
                
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(x + 5, y + 5, 1, 1);
                this.ctx.fillRect(x + this.gridSize - 6, y + 5, 1, 1);
            } else {
                // 蛇身
                const intensity = Math.max(0.3, 1 - (index * 0.05));
                this.ctx.fillStyle = `rgba(72, 187, 120, ${intensity})`;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            }
        });
    }
    
    endGame() {
        this.gameOver = true;
        this.gameRunning = false;
        this.pauseButton.disabled = true;
        this.pauseButton.textContent = '暂停';
        this.updateHighScore();
        this.updateLeaderboard();
        this.showOverlay('游戏结束', `最终得分: ${this.score}\n按空格键重新开始`);
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
    }
    
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
            this.updateDisplay();
        }
    }
    
    updateLeaderboard() {
        let scores = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
        scores.push(this.score);
        scores.sort((a, b) => b - a);
        scores = scores.slice(0, 3);
        localStorage.setItem('snakeLeaderboard', JSON.stringify(scores));
        
        const leaderboard = document.getElementById('leaderboard');
        const items = leaderboard.querySelectorAll('.leaderboard-item .score');
        
        items.forEach((item, index) => {
            item.textContent = scores[index] || 0;
        });
    }
    
    showOverlay(title, message) {
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;
        this.gameOverlay.classList.remove('hidden');
        
        if (this.gameOver) {
            this.startButton.textContent = '重新开始';
            this.startButton.onclick = () => this.resetGame();
        } else {
            this.startButton.textContent = '开始游戏';
            this.startButton.onclick = () => this.startGame();
        }
    }
    
    hideOverlay() {
        this.gameOverlay.classList.add('hidden');
    }
    
    loadLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
        const leaderboard = document.getElementById('leaderboard');
        const items = leaderboard.querySelectorAll('.leaderboard-item .score');
        
        items.forEach((item, index) => {
            item.textContent = scores[index] || 0;
        });
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    game.loadLeaderboard();
});