// Main Application - Orchestrates all game components

class BrainMazeGame extends EventEmitter {
    constructor() {
        super();
        this.gameEngine = null;
        this.levelManager = null;
        this.uiManager = null;
        this.audioManager = null;
        
        this.gameRunning = false;
        this.currentLevelData = null;
        
        this.init();
    }
    
    init() {
        // Initialize all managers
        this.gameEngine = new GameEngine();
        this.levelManager = new LevelManager();
        this.uiManager = new UIManager();
        this.audioManager = new AudioManager();
        
        // Make audio manager globally available
        window.audioManager = this.audioManager;
        
        this.setupEventHandlers();
        this.startGame();
    }
    
    setupEventHandlers() {
        // UI Manager Events
        this.uiManager.on('playerLoggedIn', (playerData) => {
            this.handlePlayerLogin(playerData);
        });
        
        this.uiManager.on('blockClicked', (position) => {
            this.handleBlockClick(position);
        });
        
        this.uiManager.on('playerMoveRequested', (direction) => {
            this.handlePlayerMove(direction);
        });
        
        this.uiManager.on('itemUseRequested', (itemType) => {
            this.handleItemUse(itemType);
        });
        
        this.uiManager.on('hintRequested', () => {
            this.handleHintRequest();
        });
        
        this.uiManager.on('nextLevelRequested', () => {
            this.loadNextLevel();
        });
        
        this.uiManager.on('retryRequested', () => {
            this.retryLevel();
        });
        
        this.uiManager.on('volumeChanged', (type, value) => {
            this.audioManager.setVolume(type, value);
        });
        
        this.uiManager.on('gameShared', (shareData) => {
            this.handleGameShare(shareData);
        });
        
        // Game Engine Events
        this.gameEngine.on('levelGenerated', (levelData) => {
            this.handleLevelGenerated(levelData);
        });
        
        this.gameEngine.on('blockSelectionChanged', (selectedBlocks) => {
            this.handleBlockSelectionChanged(selectedBlocks);
        });
        
        this.gameEngine.on('blocksEliminated', (count, type) => {
            this.handleBlocksEliminated(count, type);
        });
        
        this.gameEngine.on('eliminationFailed', () => {
            this.audioManager.playSound('click');
        });
        
        this.gameEngine.on('playerMoved', (position) => {
            this.handlePlayerMoved(position);
        });
        
        this.gameEngine.on('levelComplete', (stats) => {
            this.handleLevelComplete(stats);
        });
        
        this.gameEngine.on('gameOver', (data) => {
            this.handleGameOver(data);
        });
        
        this.gameEngine.on('itemCollected', (itemType) => {
            this.handleItemCollected(itemType);
        });
        
        this.gameEngine.on('itemsUpdated', (items) => {
            this.uiManager.updateItems(items);
        });
        
        this.gameEngine.on('itemUsed', (itemType, data) => {
            this.handleItemUsed(itemType, data);
        });
        
        this.gameEngine.on('itemUseFailed', (itemType, reason) => {
            showToast(`无法使用${this.getItemName(itemType)}: ${reason}`, 'error');
        });
        
        this.gameEngine.on('pathOpened', (path) => {
            this.handlePathOpened(path);
        });
        
        this.gameEngine.on('scoreUpdated', (score) => {
            this.uiManager.updatePlayerScore(score);
        });
        
        this.gameEngine.on('movesMade', (moves) => {
            this.checkLevelRestrictions(moves);
        });
        
        this.gameEngine.on('timeUpdated', (time) => {
            this.checkTimeRestrictions(time);
        });
        
        // Level Manager Events
        this.levelManager.on('levelChanged', (level) => {
            this.uiManager.updatePlayerLevel(level);
        });
        
        this.levelManager.on('levelUnlocked', (level) => {
            showToast(`解锁新关卡: 第${level}关`, 'success');
        });
    }
    
    startGame() {
        // Load the current level
        const currentLevel = this.gameEngine.getGameState().currentLevel;
        this.levelManager.setCurrentLevel(currentLevel);
        this.loadLevel(currentLevel);
    }
    
    handlePlayerLogin(playerData) {
        this.audioManager.playBGM();
        showToast(`欢迎, ${playerData.name}!`, 'success');
        
        // Start the first level
        this.gameEngine.startGame();
    }
    
    loadLevel(level) {
        this.currentLevelData = this.levelManager.getLevelConfig(level);
        
        if (!this.currentLevelData) {
            console.error('Level data not found for level:', level);
            return;
        }
        
        // Apply level configuration to game engine
        this.gameEngine.generateLevel(level);
        this.gameRunning = true;
        
        // Show level intro if needed
        if (level === 1 || level % 5 === 1) {
            this.showLevelIntro();
        }
    }
    
    showLevelIntro() {
        if (this.currentLevelData && this.currentLevelData.story) {
            showToast(this.currentLevelData.story, 'success', 4000);
        }
    }
    
    handleLevelGenerated(levelData) {
        this.uiManager.generateMaze(levelData);
        this.uiManager.updateItems(this.gameEngine.getGameState().items);
    }
    
    handleBlockClick(position) {
        if (!this.gameRunning) return;
        
        this.audioManager.playBlockClick();
        const success = this.gameEngine.selectBlock(position.x, position.y);
        
        if (success) {
            this.updateBlockDisplay(position.x, position.y);
        }
    }
    
    handleBlockSelectionChanged(selectedBlocks) {
        // Update UI to show selected blocks
        document.querySelectorAll('.maze-block.selected').forEach(block => {
            block.classList.remove('selected');
        });
        
        selectedBlocks.forEach(pos => {
            const block = document.querySelector(`[data-x="${pos.x}"][data-y="${pos.y}"]`);
            if (block) {
                block.classList.add('selected');
            }
        });
    }
    
    handleBlocksEliminated(count, type) {
        this.audioManager.playBlockElimination();
        
        // Update maze display
        const grid = this.gameEngine.getGrid();
        this.updateMazeDisplay(grid);
        
        // Show elimination effect
        this.uiManager.showBlockElimination(this.gameEngine.getGameState().selectedBlocks);
        
        showToast(`消除了 ${count} 个${this.getBlockTypeName(type)}方块!`, 'success', 1500);
    }
    
    handlePlayerMove(direction) {
        if (!this.gameRunning) return;
        
        const success = this.gameEngine.movePlayer(direction);
        if (success) {
            this.audioManager.playPlayerMove();
        }
    }
    
    handlePlayerMoved(position) {
        this.uiManager.updateCharacterPosition(position, this.gameEngine.cellSize);
    }
    
    handleItemUse(itemType) {
        if (!this.gameRunning) return;
        
        const success = this.gameEngine.useItem(itemType);
        if (success) {
            // Audio is handled in handleItemUsed
        }
    }
    
    handleItemUsed(itemType, data) {
        switch (itemType) {
            case 'key':
                this.audioManager.playKeyUse();
                showToast('解锁了锁定方块!', 'success');
                this.updateBlockDisplay(data.x, data.y);
                break;
            case 'bomb':
                this.audioManager.playBombUse();
                showToast('炸弹爆炸!', 'success');
                this.updateMazeDisplay(this.gameEngine.getGrid());
                break;
            case 'hint':
                this.audioManager.playHintUse();
                this.uiManager.highlightHint(data);
                break;
        }
    }
    
    handleItemCollected(itemType) {
        this.audioManager.playItemCollected();
        showToast(`获得了 ${this.getItemName(itemType)}!`, 'success');
    }
    
    handleHintRequest() {
        if (!this.gameRunning) return;
        
        this.gameEngine.useItem('hints');
    }
    
    handleLevelComplete(stats) {
        this.gameRunning = false;
        this.audioManager.playLevelComplete();
        
        // Update level manager
        this.levelManager.unlockLevel(stats.level + 1);
        this.levelManager.setCurrentLevel(stats.level + 1);
        
        // Show completion modal
        this.uiManager.showGameOverModal(true, stats);
        
        // Save progress
        this.saveGameProgress(stats);
        
        // Sync with backend
        this.uiManager.syncGameProgress(stats);
        
        showToast(`第${stats.level}关完成! 得分: ${stats.score}`, 'success', 3000);
    }
    
    handleGameOver(data) {
        this.gameRunning = false;
        this.audioManager.playLevelFailed();
        
        let reasonText = '';
        switch (data.reason) {
            case 'consecutive_failures':
                reasonText = '连续失败3次';
                break;
            case 'time_limit':
                reasonText = '时间到了';
                break;
            case 'move_limit':
                reasonText = '步数用完了';
                break;
            default:
                reasonText = '游戏结束';
        }
        
        showToast(`关卡失败: ${reasonText}`, 'error');
        
        this.uiManager.showGameOverModal(false, { 
            level: data.level,
            reason: reasonText,
            moves: data.moves,
            score: data.score
        });
    }
    
    handlePathOpened(path) {
        showToast('道路已打通! 快跑向出口!', 'success', 2000);
        
        // Optionally highlight the path
        this.highlightPath(path);
    }
    
    highlightPath(path) {
        // Briefly highlight the discovered path
        path.forEach((pos, index) => {
            setTimeout(() => {
                const block = document.querySelector(`[data-x="${pos.x}"][data-y="${pos.y}"]`);
                if (block) {
                    block.classList.add('path-highlight');
                    setTimeout(() => block.classList.remove('path-highlight'), 500);
                }
            }, index * 100);
        });
    }
    
    loadNextLevel() {
        const nextLevel = this.levelManager.getNextLevel();
        this.uiManager.hideGameOverModal();
        
        if (this.levelManager.isLevelUnlocked(nextLevel)) {
            this.loadLevel(nextLevel);
            this.gameEngine.startGame();
        } else {
            showToast('已完成所有关卡!', 'success');
        }
    }
    
    retryLevel() {
        this.uiManager.hideGameOverModal();
        this.gameEngine.resetLevel();
        this.gameRunning = true;
    }
    
    updateBlockDisplay(x, y) {
        const grid = this.gameEngine.getGrid();
        const blockData = grid[y][x];
        this.uiManager.updateMazeBlock(x, y, blockData);
    }
    
    updateMazeDisplay(grid) {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                this.updateBlockDisplay(x, y);
            }
        }
    }
    
    checkLevelRestrictions(moves) {
        if (!this.currentLevelData || !this.currentLevelData.restrictions) return;
        
        const { maxMoves } = this.currentLevelData.restrictions;
        if (maxMoves && moves >= maxMoves) {
            this.handleLevelFailed('moves');
        } else if (maxMoves && moves >= maxMoves - 5) {
            showToast(`还剩 ${maxMoves - moves} 步!`, 'error');
        }
    }
    
    checkTimeRestrictions(time) {
        if (!this.currentLevelData || !this.currentLevelData.restrictions) return;
        
        const { timeLimit } = this.currentLevelData.restrictions;
        if (timeLimit && time >= timeLimit) {
            this.handleLevelFailed('time');
        } else if (timeLimit && time >= timeLimit - 30) {
            showToast(`还剩 ${timeLimit - time} 秒!`, 'error');
        }
    }
    
    handleLevelFailed(reason) {
        this.gameRunning = false;
        this.audioManager.playLevelFailed();
        
        const reasonText = reason === 'moves' ? '步数用完了' : '时间到了';
        showToast(`关卡失败: ${reasonText}`, 'error');
        
        this.uiManager.showGameOverModal(false, { 
            level: this.gameEngine.getGameState().currentLevel,
            reason: reasonText
        });
    }
    
    handleGameShare(shareData) {
        // Log share event for analytics
        console.log('Game shared:', shareData);
        
        // Give sharing reward
        const gameState = this.gameEngine.getGameState();
        gameState.items.hints += 1;
        this.gameEngine.emit('itemsUpdated', gameState.items);
        
        showToast('分享成功! 获得1个提示道具!', 'success');
    }
    
    saveGameProgress(stats) {
        const progressData = {
            level: stats.level,
            score: stats.score,
            totalMoves: stats.moves,
            totalTime: stats.timeElapsed,
            timestamp: Date.now()
        };
        
        // Save to leaderboard
        const leaderboard = Storage.get('leaderboard', []);
        leaderboard.push(progressData);
        leaderboard.sort((a, b) => b.score - a.score);
        Storage.set('leaderboard', leaderboard.slice(0, 10)); // Keep top 10
        
        // Save overall progress
        Storage.set('gameProgress', progressData);
    }
    
    // Utility methods
    getBlockTypeName(type) {
        const names = {
            fruit: '水果',
            animal: '动物',
            shape: '图形'
        };
        return names[type] || type;
    }
    
    getItemName(type) {
        const names = {
            key: '钥匙',
            keys: '钥匙',
            bomb: '炸弹',
            bombs: '炸弹',
            hint: '提示',
            hints: '提示'
        };
        return names[type] || type;
    }
    
    // Public API methods
    pauseGame() {
        this.gameRunning = false;
        this.audioManager.pauseBGM();
    }
    
    resumeGame() {
        this.gameRunning = true;
        this.audioManager.resumeBGM();
    }
    
    getGameStats() {
        return {
            gameState: this.gameEngine.getGameState(),
            currentLevel: this.levelManager.currentLevel,
            isGameRunning: this.gameRunning
        };
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for mobile device and add appropriate classes
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile');
    }
    
    // Prevent zooming on double tap for mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Initialize the game
    window.game = new BrainMazeGame();
    
    // Add keyboard shortcuts info for desktop
    if (window.innerWidth > 768) {
        showToast('键盘控制: WASD或方向键移动, 空格键提示, ESC设置', 'success', 5000);
    }
});

// Handle window resize
window.addEventListener('resize', debounce(() => {
    if (window.game) {
        // Refresh maze display for new screen size
        const gameState = window.game.gameEngine.getGameState();
        if (gameState.gameStarted) {
            window.game.updateMazeDisplay(window.game.gameEngine.getGrid());
        }
    }
}, 250));

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.game) {
        window.game.gameEngine.saveGameState();
    }
});

// Service worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}