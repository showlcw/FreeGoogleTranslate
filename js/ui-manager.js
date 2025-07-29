// UI Manager - Handle all UI interactions and updates

class UIManager extends EventEmitter {
    constructor() {
        super();
        this.currentScreen = 'loading';
        this.playerData = {
            name: '玩家',
            avatar: '👤',
            level: 1,
            score: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupEventHandlers();
        this.loadPlayerData();
        this.showLoadingScreen();
    }
    
    setupEventHandlers() {
        // Login screen
        document.getElementById('google-login')?.addEventListener('click', () => this.handleLogin('google'));
        document.getElementById('wechat-login')?.addEventListener('click', () => this.handleLogin('wechat'));
        
        // Game screen
        document.getElementById('leaderboard-btn')?.addEventListener('click', () => this.showLeaderboard());
        document.getElementById('hint-btn')?.addEventListener('click', () => this.emit('hintRequested'));
        document.getElementById('settings-btn')?.addEventListener('click', () => this.showSettings());
        
        // Power-up buttons
        document.getElementById('key-item')?.addEventListener('click', () => this.handleItemUse('keys'));
        document.getElementById('bomb-item')?.addEventListener('click', () => this.handleItemUse('bombs'));
        document.getElementById('hint-item')?.addEventListener('click', () => this.handleItemUse('hints'));
        
        // Leaderboard screen
        document.getElementById('leaderboard-back')?.addEventListener('click', () => this.showGameScreen());
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLeaderboardTab(e.target.dataset.tab));
        });
        
        // Settings screen
        document.getElementById('settings-back')?.addEventListener('click', () => this.showGameScreen());
        document.getElementById('bgm-volume')?.addEventListener('input', (e) => this.handleVolumeChange('bgm', e.target.value));
        document.getElementById('sfx-volume')?.addEventListener('input', (e) => this.handleVolumeChange('sfx', e.target.value));
        document.getElementById('submit-feedback')?.addEventListener('click', () => this.handleFeedbackSubmit());
        
        // Game over modal
        document.getElementById('next-level-btn')?.addEventListener('click', () => this.emit('nextLevelRequested'));
        document.getElementById('retry-btn')?.addEventListener('click', () => this.emit('retryRequested'));
        document.getElementById('share-btn')?.addEventListener('click', () => this.handleShare());
        
        // Maze interaction
        this.setupMazeInteraction();
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
    
    setupMazeInteraction() {
        const mazeContainer = document.getElementById('maze-container');
        if (!mazeContainer) return;
        
        // Use event delegation for dynamically created blocks
        mazeContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('maze-block')) {
                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);
                this.emit('blockClicked', { x, y });
            }
        });
        
        // Touch events for mobile
        mazeContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('maze-block')) {
                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);
                this.emit('blockClicked', { x, y });
            }
        });
    }
    
    showLoadingScreen() {
        this.currentScreen = 'loading';
        showScreen('loading-screen');
        
        // Simulate loading
        const progressBar = document.getElementById('loading-progress');
        let progress = 0;
        
        const loadingInterval = setInterval(() => {
            progress += 5;
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => this.showLoginScreen(), 500);
            }
        }, 100);
    }
    
    showLoginScreen() {
        this.currentScreen = 'login';
        showScreen('login-screen');
    }
    
    showGameScreen() {
        this.currentScreen = 'game';
        showScreen('game-screen');
        this.updateGameUI();
    }
    
    showLeaderboard() {
        this.currentScreen = 'leaderboard';
        showScreen('leaderboard-screen');
        this.loadLeaderboardData();
    }
    
    showSettings() {
        this.currentScreen = 'settings';
        showScreen('settings-screen');
        this.loadSettingsData();
    }
    
    handleLogin(provider) {
        // Simulate login process
        showToast(`正在使用${provider === 'google' ? '谷歌' : '微信'}登录...`, 'success');
        
        setTimeout(() => {
            this.playerData.name = `${provider === 'google' ? 'Google' : '微信'}用户`;
            this.playerData.avatar = provider === 'google' ? '🔍' : '💬';
            this.savePlayerData();
            this.showGameScreen();
            this.emit('playerLoggedIn', this.playerData);
        }, 1500);
    }
    
    updateGameUI() {
        // Update player info
        const playerName = document.getElementById('player-name');
        const playerAvatar = document.getElementById('player-avatar');
        const currentLevel = document.getElementById('current-level');
        
        if (playerName) playerName.textContent = this.playerData.name;
        if (playerAvatar) playerAvatar.textContent = this.playerData.avatar;
        if (currentLevel) currentLevel.textContent = this.playerData.level;
    }
    
    generateMaze(levelData) {
        const mazeContainer = document.getElementById('maze-container');
        if (!mazeContainer) return;
        
        // Clear existing maze
        mazeContainer.innerHTML = '';
        
        // Set grid class based on size
        mazeContainer.className = `maze-container maze-${levelData.gridSize}x${levelData.gridSize}`;
        
        // Generate maze blocks
        for (let y = 0; y < levelData.gridSize; y++) {
            for (let x = 0; x < levelData.gridSize; x++) {
                const block = this.createMazeBlock(x, y, levelData.grid[y][x]);
                mazeContainer.appendChild(block);
            }
        }
        
        // Position character
        this.updateCharacterPosition(levelData.playerPosition, levelData.cellSize);
    }
    
    createMazeBlock(x, y, blockData) {
        const block = createElement('div', 'maze-block');
        block.dataset.x = x;
        block.dataset.y = y;
        
        // Set block type class
        if (blockData.type) {
            block.classList.add(`block-${blockData.type}`);
        }
        
        // Set block state classes
        if (blockData.blocked) block.classList.add('blocked');
        if (blockData.locked) block.classList.add('locked');
        if (blockData.isPath) block.classList.add('path');
        if (blockData.isExit) block.classList.add('exit');
        if (blockData.selected) block.classList.add('selected');
        
        // Set block content
        if (blockData.isExit) {
            block.innerHTML = '🚪';
        } else if (blockData.locked) {
            block.innerHTML = '🔒';
        } else if (blockData.isPath) {
            block.innerHTML = '';
        } else if (blockData.icon) {
            block.innerHTML = blockData.icon;
        }
        
        // Add hidden item indicator
        if (blockData.hasHiddenItem) {
            block.classList.add('hidden-item');
        }
        
        return block;
    }
    
    updateMazeBlock(x, y, blockData) {
        const block = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (!block) return;
        
        // Update classes
        block.className = 'maze-block';
        if (blockData.type) block.classList.add(`block-${blockData.type}`);
        if (blockData.blocked) block.classList.add('blocked');
        if (blockData.locked) block.classList.add('locked');
        if (blockData.isPath) block.classList.add('path');
        if (blockData.isExit) block.classList.add('exit');
        if (blockData.selected) block.classList.add('selected');
        if (blockData.hasHiddenItem) block.classList.add('hidden-item');
        
        // Update content
        if (blockData.isExit) {
            block.innerHTML = '🚪';
        } else if (blockData.locked) {
            block.innerHTML = '🔒';
        } else if (blockData.isPath) {
            block.innerHTML = '';
        } else if (blockData.icon) {
            block.innerHTML = blockData.icon;
        }
    }
    
    updateCharacterPosition(position, cellSize) {
        const character = document.getElementById('character');
        if (!character) return;
        
        const pixelPos = gridToPixel(position.x, position.y, cellSize);
        character.style.left = `${pixelPos.x}px`;
        character.style.top = `${pixelPos.y}px`;
        
        // Add moving animation
        character.classList.add('moving');
        setTimeout(() => character.classList.remove('moving'), 500);
    }
    
    updateItems(items) {
        const keyCount = document.getElementById('key-count');
        const bombCount = document.getElementById('bomb-count');
        const hintCount = document.getElementById('hint-count');
        
        if (keyCount) keyCount.textContent = items.keys;
        if (bombCount) bombCount.textContent = items.bombs;
        if (hintCount) hintCount.textContent = items.hints;
        
        // Update button states
        const keyBtn = document.getElementById('key-item');
        const bombBtn = document.getElementById('bomb-item');
        const hintBtn = document.getElementById('hint-item');
        
        if (keyBtn) keyBtn.disabled = items.keys <= 0;
        if (bombBtn) bombBtn.disabled = items.bombs <= 0;
        if (hintBtn) hintBtn.disabled = items.hints <= 0;
    }
    
    showGameOverModal(success, data) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');
        const character = modal.querySelector('.game-over-character');
        
        if (success) {
            title.textContent = '通关成功！';
            message.textContent = `恭喜通过第${data.level}关！`;
            character.textContent = '🎉';
            character.className = 'game-over-character bounce';
        } else {
            title.textContent = '关卡失败';
            message.textContent = '再试一次吧！';
            character.textContent = '😔';
            character.className = 'game-over-character';
        }
        
        modal.classList.remove('hidden');
    }
    
    hideGameOverModal() {
        const modal = document.getElementById('game-over-modal');
        modal.classList.add('hidden');
    }
    
    handleItemUse(itemType) {
        this.emit('itemUseRequested', itemType);
    }
    
    handleKeydown(e) {
        if (this.currentScreen !== 'game') return;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.emit('playerMoveRequested', 'up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.emit('playerMoveRequested', 'down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.emit('playerMoveRequested', 'left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.emit('playerMoveRequested', 'right');
                break;
            case ' ':
                e.preventDefault();
                this.emit('hintRequested');
                break;
            case 'Escape':
                e.preventDefault();
                this.showSettings();
                break;
        }
    }
    
    showBlockElimination(blocks) {
        blocks.forEach(pos => {
            const block = document.querySelector(`[data-x="${pos.x}"][data-y="${pos.y}"]`);
            if (block) {
                // Create explosion effect
                const effect = createElement('div', 'elimination-effect explosion');
                effect.style.left = block.offsetLeft + 'px';
                effect.style.top = block.offsetTop + 'px';
                effect.innerHTML = '💥';
                
                block.parentElement.appendChild(effect);
                
                // Remove effect after animation
                setTimeout(() => {
                    if (effect.parentElement) {
                        effect.parentElement.removeChild(effect);
                    }
                }, 600);
            }
        });
    }
    
    highlightHint(blocks) {
        // Clear previous hints
        document.querySelectorAll('.maze-block.hint').forEach(block => {
            block.classList.remove('hint');
        });
        
        // Highlight suggested blocks
        blocks.forEach((pos, index) => {
            const block = document.querySelector(`[data-x="${pos.x}"][data-y="${pos.y}"]`);
            if (block) {
                block.classList.add('hint');
                setTimeout(() => block.classList.remove('hint'), 3000);
            }
        });
        
        showToast('提示：试试选择这些方块', 'success');
    }
    
    switchLeaderboardTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Load appropriate data
        this.loadLeaderboardData(tab);
    }
    
    loadLeaderboardData(tab = 'global') {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;
        
        // Mock leaderboard data
        const mockData = this.generateMockLeaderboard(tab);
        
        leaderboardList.innerHTML = '';
        
        mockData.forEach((player, index) => {
            const item = this.createLeaderboardItem(player, index + 1);
            leaderboardList.appendChild(item);
        });
    }
    
    generateMockLeaderboard(tab) {
        const names = ['超级玩家', '谜题大师', '通关达人', '方块专家', '迷宫探险家', '智慧挑战者', '游戏高手', '益智天才'];
        const avatars = ['🧠', '🎯', '🏆', '⭐', '🎮', '🔥', '💎', '🚀'];
        
        return Array.from({ length: 8 }, (_, i) => ({
            name: names[i],
            avatar: avatars[i],
            level: random(5, 50),
            score: random(1000, 50000)
        })).sort((a, b) => b.score - a.score);
    }
    
    createLeaderboardItem(player, rank) {
        const item = createElement('div', 'leaderboard-item');
        
        const rankEl = createElement('div', `rank-number ${this.getRankClass(rank)}`, rank.toString());
        const avatarEl = createElement('div', 'player-avatar-small', player.avatar);
        const statsEl = createElement('div', 'player-stats');
        
        statsEl.innerHTML = `
            <div class="player-name-small">${player.name}</div>
            <div class="player-level">最高关卡: ${player.level}</div>
        `;
        
        item.appendChild(rankEl);
        item.appendChild(avatarEl);
        item.appendChild(statsEl);
        
        return item;
    }
    
    getRankClass(rank) {
        switch (rank) {
            case 1: return 'first';
            case 2: return 'second';
            case 3: return 'third';
            default: return '';
        }
    }
    
    loadSettingsData() {
        const bgmVolume = document.getElementById('bgm-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        
        const settings = Storage.get('gameSettings', { bgmVolume: 70, sfxVolume: 80 });
        
        if (bgmVolume) bgmVolume.value = settings.bgmVolume;
        if (sfxVolume) sfxVolume.value = settings.sfxVolume;
    }
    
    handleVolumeChange(type, value) {
        const settings = Storage.get('gameSettings', {});
        settings[`${type}Volume`] = value;
        Storage.set('gameSettings', settings);
        
        this.emit('volumeChanged', type, value);
    }
    
    handleFeedbackSubmit() {
        const feedbackText = document.getElementById('feedback-text');
        if (!feedbackText || !feedbackText.value.trim()) {
            showToast('请输入反馈内容', 'error');
            return;
        }
        
        // Simulate feedback submission
        showToast('感谢您的反馈！', 'success');
        feedbackText.value = '';
        
        this.emit('feedbackSubmitted', feedbackText.value);
    }
    
    handleShare() {
        const shareData = {
            level: this.playerData.level,
            score: this.playerData.score,
            name: this.playerData.name
        };
        
        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: '脑洞迷城',
                text: `我在脑洞迷城中达到了第${shareData.level}关，得分${shareData.score}！快来挑战吧！`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            const shareText = `我在脑洞迷城中达到了第${shareData.level}关，得分${shareData.score}！快来挑战吧！ ${window.location.href}`;
            navigator.clipboard.writeText(shareText).then(() => {
                showToast('分享链接已复制到剪贴板', 'success');
            });
        }
        
        this.emit('gameShared', shareData);
    }
    
    loadPlayerData() {
        const saved = Storage.get('playerData');
        if (saved) {
            this.playerData = { ...this.playerData, ...saved };
        }
    }
    
    savePlayerData() {
        Storage.set('playerData', this.playerData);
    }
    
    updatePlayerLevel(level) {
        this.playerData.level = level;
        this.savePlayerData();
        this.updateGameUI();
    }
    
    updatePlayerScore(score) {
        this.playerData.score = score;
        this.savePlayerData();
    }
}