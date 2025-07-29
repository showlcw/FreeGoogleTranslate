// Level Manager - Handle level progression and difficulty

class LevelManager extends EventEmitter {
    constructor() {
        super();
        this.levelData = [];
        this.currentLevel = 1;
        this.maxLevel = 100; // Can be expanded
        this.difficultySettings = this.initializeDifficultySettings();
        
        this.init();
    }
    
    init() {
        this.generateLevelData();
    }
    
    initializeDifficultySettings() {
        return {
            // Levels 1-5: Tutorial
            tutorial: {
                levelRange: [1, 5],
                gridSize: 8,
                cellSize: 40,
                blockedPercentage: 0.6,
                lockedBlocks: 0,
                hiddenItems: 1,
                timeLimit: null, // No time limit
                moveLimit: null, // No move limit
                specialFeatures: ['basic_elimination']
            },
            
            // Levels 6-20: Intermediate
            intermediate: {
                levelRange: [6, 20],
                gridSize: 9,
                cellSize: 35,
                blockedPercentage: 0.7,
                lockedBlocks: [1, 3], // 1-3 locked blocks
                hiddenItems: [1, 2],
                timeLimit: [300, 180], // 5-3 minutes
                moveLimit: [50, 30],
                specialFeatures: ['locked_blocks', 'time_pressure']
            },
            
            // Levels 21+: Advanced
            advanced: {
                levelRange: [21, 100],
                gridSize: 10,
                cellSize: 32,
                blockedPercentage: 0.8,
                lockedBlocks: [2, 5],
                hiddenItems: [2, 4],
                timeLimit: [240, 120], // 4-2 minutes
                moveLimit: [40, 20],
                specialFeatures: ['procedural_generation', 'dynamic_difficulty', 'complex_layouts']
            }
        };
    }
    
    generateLevelData() {
        for (let level = 1; level <= this.maxLevel; level++) {
            const levelConfig = this.generateLevelConfig(level);
            this.levelData[level] = levelConfig;
        }
    }
    
    generateLevelConfig(level) {
        const difficulty = this.getDifficultyForLevel(level);
        const settings = this.difficultySettings[difficulty];
        
        const config = {
            level,
            difficulty,
            gridSize: settings.gridSize,
            cellSize: settings.cellSize,
            layout: this.generateLayout(level, settings),
            objectives: this.generateObjectives(level, settings),
            restrictions: this.generateRestrictions(level, settings),
            rewards: this.generateRewards(level),
            story: this.generateStoryText(level)
        };
        
        return config;
    }
    
    getDifficultyForLevel(level) {
        if (level <= 5) return 'tutorial';
        if (level <= 20) return 'intermediate';
        return 'advanced';
    }
    
    generateLayout(level, settings) {
        const layout = {
            gridSize: settings.gridSize,
            blockedCells: [],
            lockedCells: [],
            hiddenItems: [],
            specialCells: [],
            startPosition: { x: 0, y: 0 },
            exitPosition: { x: settings.gridSize - 1, y: settings.gridSize - 1 }
        };
        
        // Generate blocked cells pattern
        if (level <= 5) {
            layout.blockedCells = this.generateTutorialLayout(level, settings.gridSize);
        } else if (level <= 20) {
            layout.blockedCells = this.generateIntermediateLayout(level, settings.gridSize);
        } else {
            layout.blockedCells = this.generateAdvancedLayout(level, settings.gridSize);
        }
        
        // Add locked blocks
        if (settings.lockedBlocks) {
            const lockedCount = Array.isArray(settings.lockedBlocks) 
                ? random(settings.lockedBlocks[0], settings.lockedBlocks[1])
                : settings.lockedBlocks;
            layout.lockedCells = this.generateLockedBlocks(lockedCount, settings.gridSize, layout.blockedCells);
        }
        
        // Add hidden items
        const hiddenCount = Array.isArray(settings.hiddenItems)
            ? random(settings.hiddenItems[0], settings.hiddenItems[1])
            : settings.hiddenItems;
        layout.hiddenItems = this.generateHiddenItems(hiddenCount, settings.gridSize, layout.blockedCells);
        
        return layout;
    }
    
    generateTutorialLayout(level, gridSize) {
        // Simple layouts for tutorial levels
        const patterns = [
            // Level 1: Simple straight path
            this.generateStraightPath(gridSize),
            // Level 2: L-shaped path
            this.generateLShapedPath(gridSize),
            // Level 3: Zigzag path
            this.generateZigzagPath(gridSize),
            // Level 4: Multiple paths
            this.generateMultiplePaths(gridSize),
            // Level 5: Complex but solvable
            this.generateComplexPath(gridSize)
        ];
        
        return patterns[(level - 1) % patterns.length];
    }
    
    generateIntermediateLayout(level, gridSize) {
        // More complex layouts with strategic placement
        const complexity = (level - 5) / 15; // 0 to 1
        const blockedCells = [];
        
        // Create maze-like structure
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                // Skip start and exit
                if ((x === 0 && y === 0) || (x === gridSize - 1 && y === gridSize - 1)) {
                    continue;
                }
                
                // Use noise function for natural-looking distribution
                const noise = this.perlinNoise(x * 0.3, y * 0.3, level * 0.1);
                const threshold = 0.3 + complexity * 0.4;
                
                if (noise > threshold) {
                    blockedCells.push({ x, y });
                }
            }
        }
        
        return blockedCells;
    }
    
    generateAdvancedLayout(level, gridSize) {
        // Procedurally generated complex layouts
        const seed = level * 12345; // Deterministic generation
        // Use simple seeded random if Math.seedrandom not available
        
        const blockedCells = [];
        const density = 0.7 + (level % 10) * 0.02; // Increase density periodically
        
        // Generate using cellular automata
        let grid = this.generateCellularAutomata(gridSize, density);
        
        // Ensure path exists
        grid = this.ensurePathExists(grid, gridSize);
        
        // Convert to blocked cells array
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (grid[y][x] === 1) {
                    blockedCells.push({ x, y });
                }
            }
        }
        
        return blockedCells;
    }
    
    generateStraightPath(gridSize) {
        const blockedCells = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                // Create path along main diagonal and adjacent cells
                if (Math.abs(x - y) > 1) {
                    blockedCells.push({ x, y });
                }
            }
        }
        return blockedCells;
    }
    
    generateLShapedPath(gridSize) {
        const blockedCells = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                // Create L-shaped path
                const onVerticalPath = x === 0 && y < gridSize - 1;
                const onHorizontalPath = y === gridSize - 1 && x < gridSize;
                
                if (!onVerticalPath && !onHorizontalPath) {
                    blockedCells.push({ x, y });
                }
            }
        }
        return blockedCells;
    }
    
    generateZigzagPath(gridSize) {
        const blockedCells = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                // Create zigzag pattern
                const onPath = (y % 2 === 0 && x <= y) || (y % 2 === 1 && x >= gridSize - 1 - y);
                
                if (!onPath) {
                    blockedCells.push({ x, y });
                }
            }
        }
        return blockedCells;
    }
    
    generateMultiplePaths(gridSize) {
        const blockedCells = [];
        const pathWidth = 2;
        
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                // Create multiple possible paths
                const onMainPath = Math.abs(x - y) < pathWidth;
                const onAltPath = Math.abs(x + y - gridSize + 1) < pathWidth;
                
                if (!onMainPath && !onAltPath) {
                    blockedCells.push({ x, y });
                }
            }
        }
        return blockedCells;
    }
    
    generateComplexPath(gridSize) {
        const blockedCells = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                // Complex pattern with multiple solutions
                const pattern = (x + y) % 3 !== 0 && (x * y) % 4 !== 0;
                
                if (pattern && !(x === 0 && y === 0) && !(x === gridSize - 1 && y === gridSize - 1)) {
                    blockedCells.push({ x, y });
                }
            }
        }
        return blockedCells;
    }
    
    generateLockedBlocks(count, gridSize, blockedCells) {
        const lockedCells = [];
        const availableBlocked = blockedCells.filter(cell => 
            !(cell.x === 0 && cell.y === 0) && 
            !(cell.x === gridSize - 1 && cell.y === gridSize - 1)
        );
        
        for (let i = 0; i < Math.min(count, availableBlocked.length); i++) {
            const randomIndex = random(0, availableBlocked.length - 1);
            lockedCells.push(availableBlocked.splice(randomIndex, 1)[0]);
        }
        
        return lockedCells;
    }
    
    generateHiddenItems(count, gridSize, blockedCells) {
        const hiddenItems = [];
        const itemTypes = ['key', 'bomb', 'hint'];
        const availableBlocked = blockedCells.filter(cell => 
            !(cell.x === 0 && cell.y === 0) && 
            !(cell.x === gridSize - 1 && cell.y === gridSize - 1)
        );
        
        for (let i = 0; i < Math.min(count, availableBlocked.length); i++) {
            const randomIndex = random(0, availableBlocked.length - 1);
            const position = availableBlocked.splice(randomIndex, 1)[0];
            const itemType = itemTypes[i % itemTypes.length];
            
            hiddenItems.push({
                position,
                type: itemType
            });
        }
        
        return hiddenItems;
    }
    
    generateObjectives(level, settings) {
        const objectives = {
            primary: 'Reach the exit',
            secondary: [],
            bonus: []
        };
        
        // Add move limit objective
        if (settings.moveLimit) {
            const moveLimit = Array.isArray(settings.moveLimit)
                ? settings.moveLimit[1] + random(0, settings.moveLimit[0] - settings.moveLimit[1])
                : settings.moveLimit;
            objectives.secondary.push(`Complete in ${moveLimit} moves or less`);
        }
        
        // Add time limit objective
        if (settings.timeLimit) {
            const timeLimit = Array.isArray(settings.timeLimit)
                ? settings.timeLimit[1] + random(0, settings.timeLimit[0] - settings.timeLimit[1])
                : settings.timeLimit;
            objectives.secondary.push(`Complete within ${timeLimit} seconds`);
        }
        
        // Add collection objectives
        if (level > 5) {
            objectives.bonus.push('Collect all hidden items');
        }
        
        if (level > 10) {
            objectives.bonus.push('Use minimal items');
        }
        
        return objectives;
    }
    
    generateRestrictions(level, settings) {
        const restrictions = {};
        
        if (settings.moveLimit) {
            restrictions.maxMoves = Array.isArray(settings.moveLimit)
                ? settings.moveLimit[1] + random(0, settings.moveLimit[0] - settings.moveLimit[1])
                : settings.moveLimit;
        }
        
        if (settings.timeLimit) {
            restrictions.timeLimit = Array.isArray(settings.timeLimit)
                ? settings.timeLimit[1] + random(0, settings.timeLimit[0] - settings.timeLimit[1])
                : settings.timeLimit;
        }
        
        return restrictions;
    }
    
    generateRewards(level) {
        const baseScore = 100;
        const multiplier = Math.floor(level / 5) + 1;
        
        return {
            score: baseScore * multiplier,
            items: {
                keys: level % 3 === 0 ? 1 : 0,
                bombs: level % 4 === 0 ? 1 : 0,
                hints: level % 2 === 0 ? 1 : 0
            },
            unlocks: this.getUnlocks(level)
        };
    }
    
    getUnlocks(level) {
        const unlocks = [];
        
        if (level === 5) unlocks.push('Locked blocks feature');
        if (level === 10) unlocks.push('Time limit challenges');
        if (level === 15) unlocks.push('Complex layouts');
        if (level === 20) unlocks.push('Procedural generation');
        if (level % 25 === 0) unlocks.push('New block types');
        
        return unlocks;
    }
    
    generateStoryText(level) {
        const storySegments = [
            "Welcome to Brain Maze City! Learn the basics of block elimination.",
            "The adventure begins. Master the art of creating paths.",
            "Mysterious locked blocks appear. Find keys to unlock them!",
            "Time pressure mounts. Can you think fast enough?",
            "The maze grows more complex. Strategy is key.",
            "Hidden treasures await discovery. Explore every corner.",
            "Bombs become available. Sometimes destruction creates opportunity.",
            "The city's secrets unfold. Ancient puzzles challenge your mind.",
            "Master level challenges await. Only the clever survive.",
            "Infinite possibilities. The maze adapts to your skill."
        ];
        
        const segmentIndex = Math.min(Math.floor((level - 1) / 5), storySegments.length - 1);
        return storySegments[segmentIndex];
    }
    
    // Simple Perlin noise implementation
    perlinNoise(x, y, z = 0) {
        // Simplified 2D noise for demonstration
        const random = (x, y) => {
            const a = 12.9898;
            const b = 78.233;
            const c = 43758.5453;
            const dt = a * x + b * y;
            const sn = dt % Math.PI;
            return (Math.sin(sn) * c) % 1;
        };
        
        const intX = Math.floor(x);
        const intY = Math.floor(y);
        const fracX = x - intX;
        const fracY = y - intY;
        
        const a = random(intX, intY);
        const b = random(intX + 1, intY);
        const c = random(intX, intY + 1);
        const d = random(intX + 1, intY + 1);
        
        const i1 = a * (1 - fracX) + b * fracX;
        const i2 = c * (1 - fracX) + d * fracX;
        
        return i1 * (1 - fracY) + i2 * fracY;
    }
    
    // Cellular automata for cave-like generation
    generateCellularAutomata(size, density) {
        let grid = [];
        
        // Initialize with random noise
        for (let y = 0; y < size; y++) {
            grid[y] = [];
            for (let x = 0; x < size; x++) {
                grid[y][x] = Math.random() < density ? 1 : 0;
            }
        }
        
        // Apply cellular automata rules
        for (let iteration = 0; iteration < 3; iteration++) {
            const newGrid = [];
            for (let y = 0; y < size; y++) {
                newGrid[y] = [];
                for (let x = 0; x < size; x++) {
                    const neighbors = this.countNeighbors(grid, x, y, size);
                    newGrid[y][x] = neighbors >= 4 ? 1 : 0;
                }
            }
            grid = newGrid;
        }
        
        return grid;
    }
    
    countNeighbors(grid, x, y, size) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx < 0 || nx >= size || ny < 0 || ny >= size) {
                    count++; // Treat out-of-bounds as walls
                } else {
                    count += grid[ny][nx];
                }
            }
        }
        return count;
    }
    
    ensurePathExists(grid, size) {
        // Simple path carving to ensure connectivity
        const start = { x: 0, y: 0 };
        const end = { x: size - 1, y: size - 1 };
        
        // Clear start and end
        grid[start.y][start.x] = 0;
        grid[end.y][end.x] = 0;
        
        // Create a simple path using A*
        const path = findPath(grid, start, end);
        
        if (path.length === 0) {
            // Force create a path
            this.carvePath(grid, start, end);
        }
        
        return grid;
    }
    
    carvePath(grid, start, end) {
        let current = { ...start };
        
        while (current.x !== end.x || current.y !== end.y) {
            grid[current.y][current.x] = 0;
            
            // Move towards end
            if (current.x < end.x) current.x++;
            else if (current.x > end.x) current.x--;
            else if (current.y < end.y) current.y++;
            else if (current.y > end.y) current.y--;
        }
        
        grid[end.y][end.x] = 0;
    }
    
    getLevelConfig(level) {
        return this.levelData[level] || null;
    }
    
    getNextLevel() {
        return Math.min(this.currentLevel + 1, this.maxLevel);
    }
    
    getPreviousLevel() {
        return Math.max(this.currentLevel - 1, 1);
    }
    
    setCurrentLevel(level) {
        if (level >= 1 && level <= this.maxLevel) {
            this.currentLevel = level;
            this.emit('levelChanged', level);
            return true;
        }
        return false;
    }
    
    isLevelUnlocked(level) {
        const unlockedLevel = Storage.get('unlockedLevel', 1);
        return level <= unlockedLevel;
    }
    
    unlockLevel(level) {
        const currentUnlocked = Storage.get('unlockedLevel', 1);
        if (level > currentUnlocked) {
            Storage.set('unlockedLevel', level);
            this.emit('levelUnlocked', level);
        }
    }
}