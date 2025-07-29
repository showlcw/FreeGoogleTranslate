// Game Engine - Core game logic and state management

class GameEngine extends EventEmitter {
    constructor() {
        super();
        this.gameState = {
            currentLevel: 1,
            score: 0,
            moves: 0,
            timeElapsed: 0,
            gameStarted: false,
            gameEnded: false,
            selectedBlocks: [],
            playerPosition: { x: 0, y: 0 },
            items: {
                keys: 1,
                bombs: 2,
                hints: 3
            }
        };
        
        this.grid = [];
        this.gridSize = 8;
        this.cellSize = 40;
        this.gameTimer = null;
        this.moveHistory = [];
        
        this.init();
    }
    
    init() {
        this.loadGameState();
        this.setupEventHandlers();
    }
    
    loadGameState() {
        const savedState = Storage.get('gameState');
        if (savedState) {
            this.gameState = { ...this.gameState, ...savedState };
        }
    }
    
    saveGameState() {
        Storage.set('gameState', {
            currentLevel: this.gameState.currentLevel,
            score: this.gameState.score,
            items: this.gameState.items
        });
    }
    
    setupEventHandlers() {
        // Level progression
        this.on('levelComplete', () => {
            this.gameState.currentLevel++;
            this.saveGameState();
            this.emit('gameStateChanged');
        });
        
        // Score updates
        this.on('blocksEliminated', (count, type) => {
            const points = this.calculatePoints(count, type);
            this.gameState.score += points;
            this.emit('scoreUpdated', this.gameState.score);
        });
    }
    
    generateLevel(level = this.gameState.currentLevel) {
        // Determine grid size based on level
        if (level <= 5) {
            this.gridSize = 8;
            this.cellSize = 40;
        } else if (level <= 20) {
            this.gridSize = 9;
            this.cellSize = 35;
        } else {
            this.gridSize = 10;
            this.cellSize = 32;
        }
        
        this.grid = this.createGrid();
        this.placeSpecialItems(level);
        this.setPlayerStartPosition();
        this.setExitPosition();
        
        this.emit('levelGenerated', {
            grid: this.grid,
            gridSize: this.gridSize,
            cellSize: this.cellSize,
            playerPosition: this.gameState.playerPosition
        });
    }
    
    createGrid() {
        const grid = [];
        
        for (let y = 0; y < this.gridSize; y++) {
            const row = [];
            for (let x = 0; x < this.gridSize; x++) {
                const blockType = getRandomBlockType();
                const blockIcon = getRandomBlockIcon(blockType);
                
                row.push({
                    x,
                    y,
                    type: blockType,
                    icon: blockIcon,
                    blocked: true,
                    selected: false,
                    locked: false,
                    hasHiddenItem: false,
                    hiddenItemType: null,
                    isPath: false,
                    isExit: false
                });
            }
            grid.push(row);
        }
        
        return grid;
    }
    
    placeSpecialItems(level) {
        const specialItemCount = Math.min(3, Math.floor(level / 3));
        const positions = this.getRandomPositions(specialItemCount);
        
        positions.forEach((pos, index) => {
            const block = this.grid[pos.y][pos.x];
            block.hasHiddenItem = true;
            
            // Randomly assign hidden item types
            const itemTypes = ['key', 'bomb', 'hint'];
            block.hiddenItemType = itemTypes[index % itemTypes.length];
        });
        
        // Add locked blocks for higher levels
        if (level > 5) {
            const lockedCount = Math.floor(level / 5);
            const lockedPositions = this.getRandomPositions(lockedCount);
            
            lockedPositions.forEach(pos => {
                this.grid[pos.y][pos.x].locked = true;
            });
        }
    }
    
    getRandomPositions(count) {
        const positions = [];
        const used = new Set();
        
        while (positions.length < count) {
            const x = random(1, this.gridSize - 2);
            const y = random(1, this.gridSize - 2);
            const key = `${x},${y}`;
            
            if (!used.has(key)) {
                positions.push({ x, y });
                used.add(key);
            }
        }
        
        return positions;
    }
    
    setPlayerStartPosition() {
        this.gameState.playerPosition = { x: 0, y: 0 };
        this.grid[0][0].blocked = false;
        this.grid[0][0].isPath = true;
    }
    
    setExitPosition() {
        const exitX = this.gridSize - 1;
        const exitY = this.gridSize - 1;
        this.grid[exitY][exitX].isExit = true;
    }
    
    selectBlock(x, y) {
        if (!this.isValidSelection(x, y)) {
            return false;
        }
        
        const block = this.grid[y][x];
        
        // Toggle selection
        if (block.selected) {
            this.deselectBlock(x, y);
        } else {
            // Check if we can add more selections
            if (this.gameState.selectedBlocks.length >= 3) {
                // Deselect the first block
                const firstSelected = this.gameState.selectedBlocks[0];
                this.deselectBlock(firstSelected.x, firstSelected.y);
            }
            
            block.selected = true;
            this.gameState.selectedBlocks.push({ x, y });
        }
        
        this.emit('blockSelectionChanged', this.gameState.selectedBlocks);
        
        // Check for elimination
        if (this.gameState.selectedBlocks.length === 3) {
            setTimeout(() => this.checkElimination(), 100);
        }
        
        return true;
    }
    
    deselectBlock(x, y) {
        const block = this.grid[y][x];
        block.selected = false;
        
        this.gameState.selectedBlocks = this.gameState.selectedBlocks.filter(
            pos => !(pos.x === x && pos.y === y)
        );
    }
    
    isValidSelection(x, y) {
        if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
            return false;
        }
        
        const block = this.grid[y][x];
        return !block.isPath && !block.isExit && block.blocked && !block.locked;
    }
    
    checkElimination() {
        if (this.gameState.selectedBlocks.length !== 3) {
            return false;
        }
        
        const blocks = this.gameState.selectedBlocks.map(pos => 
            this.grid[pos.y][pos.x]
        );
        
        // Check if all three blocks have the same type
        const firstType = blocks[0].type;
        const canEliminate = blocks.every(block => block.type === firstType);
        
        if (canEliminate) {
            this.eliminateBlocks();
            return true;
        } else {
            // Reset selections if no match
            this.clearSelections();
            this.emit('eliminationFailed');
            return false;
        }
    }
    
    eliminateBlocks() {
        const blocksToEliminate = [...this.gameState.selectedBlocks];
        let hiddenItemsFound = [];
        
        // Process elimination
        blocksToEliminate.forEach(pos => {
            const block = this.grid[pos.y][pos.x];
            
            // Check for hidden items
            if (block.hasHiddenItem) {
                hiddenItemsFound.push({
                    type: block.hiddenItemType,
                    position: pos
                });
                this.collectHiddenItem(block.hiddenItemType);
            }
            
            // Clear the block
            block.blocked = false;
            block.selected = false;
            block.isPath = true;
            block.hasHiddenItem = false;
            block.hiddenItemType = null;
        });
        
        // Clear selections
        this.gameState.selectedBlocks = [];
        this.gameState.moves++;
        
        // Emit events
        this.emit('blocksEliminated', blocksToEliminate.length, blocks[0].type);
        this.emit('movesMade', this.gameState.moves);
        
        if (hiddenItemsFound.length > 0) {
            this.emit('hiddenItemsFound', hiddenItemsFound);
        }
        
        // Check win condition
        this.checkWinCondition();
    }
    
    collectHiddenItem(itemType) {
        switch (itemType) {
            case 'key':
                this.gameState.items.keys++;
                break;
            case 'bomb':
                this.gameState.items.bombs++;
                break;
            case 'hint':
                this.gameState.items.hints++;
                break;
        }
        
        this.emit('itemCollected', itemType);
        this.emit('itemsUpdated', this.gameState.items);
    }
    
    clearSelections() {
        this.gameState.selectedBlocks.forEach(pos => {
            this.grid[pos.y][pos.x].selected = false;
        });
        this.gameState.selectedBlocks = [];
        this.emit('blockSelectionChanged', []);
    }
    
    useItem(itemType) {
        if (this.gameState.items[itemType] <= 0) {
            this.emit('itemUseFailed', itemType, 'No items remaining');
            return false;
        }
        
        switch (itemType) {
            case 'keys':
                return this.useKey();
            case 'bombs':
                return this.useBomb();
            case 'hints':
                return this.useHint();
            default:
                return false;
        }
    }
    
    useKey() {
        // Find locked blocks
        const lockedBlocks = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x].locked) {
                    lockedBlocks.push({ x, y });
                }
            }
        }
        
        if (lockedBlocks.length === 0) {
            this.emit('itemUseFailed', 'key', 'No locked blocks to unlock');
            return false;
        }
        
        // Unlock the first locked block
        const target = lockedBlocks[0];
        this.grid[target.y][target.x].locked = false;
        
        this.gameState.items.keys--;
        this.emit('itemUsed', 'key', target);
        this.emit('itemsUpdated', this.gameState.items);
        
        return true;
    }
    
    useBomb() {
        // For simplicity, bomb eliminates a 3x3 area around the center of selected blocks
        if (this.gameState.selectedBlocks.length === 0) {
            this.emit('itemUseFailed', 'bomb', 'No area selected');
            return false;
        }
        
        // Use the first selected block as center
        const center = this.gameState.selectedBlocks[0];
        const eliminatedBlocks = [];
        
        // 3x3 area around center
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const x = center.x + dx;
                const y = center.y + dy;
                
                if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                    const block = this.grid[y][x];
                    if (block.blocked && !block.isExit) {
                        block.blocked = false;
                        block.isPath = true;
                        block.selected = false;
                        eliminatedBlocks.push({ x, y });
                    }
                }
            }
        }
        
        this.clearSelections();
        this.gameState.items.bombs--;
        this.gameState.moves++;
        
        this.emit('itemUsed', 'bomb', { center, eliminatedBlocks });
        this.emit('itemsUpdated', this.gameState.items);
        this.emit('movesMade', this.gameState.moves);
        
        this.checkWinCondition();
        return true;
    }
    
    useHint() {
        // Find the best move (simple heuristic)
        const bestMove = this.findBestMove();
        
        if (!bestMove) {
            this.emit('itemUseFailed', 'hint', 'No good moves available');
            return false;
        }
        
        this.gameState.items.hints--;
        this.emit('itemUsed', 'hint', bestMove);
        this.emit('itemsUpdated', this.gameState.items);
        
        return true;
    }
    
    findBestMove() {
        // Simple heuristic: find three blocks of the same type that creates path toward exit
        const typeGroups = {};
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const block = this.grid[y][x];
                if (this.isValidSelection(x, y)) {
                    if (!typeGroups[block.type]) {
                        typeGroups[block.type] = [];
                    }
                    typeGroups[block.type].push({ x, y });
                }
            }
        }
        
        // Find a type with at least 3 blocks
        for (const type in typeGroups) {
            if (typeGroups[type].length >= 3) {
                return typeGroups[type].slice(0, 3);
            }
        }
        
        return null;
    }
    
    movePlayer(direction) {
        const { x, y } = this.gameState.playerPosition;
        let newX = x;
        let newY = y;
        
        switch (direction) {
            case 'up':
                newY = Math.max(0, y - 1);
                break;
            case 'down':
                newY = Math.min(this.gridSize - 1, y + 1);
                break;
            case 'left':
                newX = Math.max(0, x - 1);
                break;
            case 'right':
                newX = Math.min(this.gridSize - 1, x + 1);
                break;
        }
        
        // Check if the new position is valid (not blocked)
        if (!this.grid[newY][newX].blocked) {
            this.gameState.playerPosition = { x: newX, y: newY };
            this.emit('playerMoved', this.gameState.playerPosition);
            
            // Check if player reached exit
            if (this.grid[newY][newX].isExit) {
                this.completeLevel();
            }
            
            return true;
        }
        
        return false;
    }
    
    checkWinCondition() {
        // Check if there's a clear path from player to exit
        const path = findPath(
            this.grid,
            this.gameState.playerPosition,
            { x: this.gridSize - 1, y: this.gridSize - 1 }
        );
        
        if (path.length > 0) {
            this.emit('pathOpened', path);
        }
    }
    
    completeLevel() {
        this.gameState.gameEnded = true;
        
        const levelStats = {
            level: this.gameState.currentLevel,
            moves: this.gameState.moves,
            score: this.gameState.score,
            timeElapsed: this.gameState.timeElapsed
        };
        
        this.emit('levelComplete', levelStats);
        this.saveGameState();
    }
    
    calculatePoints(blockCount, blockType) {
        const basePoints = 10;
        const typeMultiplier = {
            fruit: 1,
            animal: 1.2,
            shape: 1.1
        };
        
        return Math.floor(basePoints * blockCount * (typeMultiplier[blockType] || 1));
    }
    
    startGame() {
        this.gameState.gameStarted = true;
        this.gameState.gameEnded = false;
        this.gameState.moves = 0;
        this.gameState.timeElapsed = 0;
        
        // Start timer
        this.gameTimer = setInterval(() => {
            this.gameState.timeElapsed++;
            this.emit('timeUpdated', this.gameState.timeElapsed);
        }, 1000);
        
        this.generateLevel();
        this.emit('gameStarted');
    }
    
    resetLevel() {
        this.clearSelections();
        this.gameState.moves = 0;
        this.gameState.timeElapsed = 0;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.generateLevel();
        this.startGame();
    }
    
    getGameState() {
        return { ...this.gameState };
    }
    
    getGrid() {
        return this.grid;
    }
}