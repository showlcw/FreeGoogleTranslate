// Utility functions

// Random number generator
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Array shuffle
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Animation frame helper
function animate(callback, duration = 1000) {
    const start = performance.now();
    
    function frame(time) {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        
        callback(progress);
        
        if (progress < 1) {
            requestAnimationFrame(frame);
        }
    }
    
    requestAnimationFrame(frame);
}

// Local storage helpers
const Storage = {
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    }
};

// Event emitter
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    
    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(...args));
    }
}

// Toast notifications
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, duration);
}

// Screen transition helpers
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}

// Element creation helper
function createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
}

// Touch/click event helper for mobile compatibility
function addTouchClickEvent(element, callback) {
    let touchStartTime = 0;
    
    element.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
    });
    
    element.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touchEndTime = Date.now();
        if (touchEndTime - touchStartTime < 500) { // Quick tap
            callback(e);
        }
    });
    
    element.addEventListener('click', callback);
}

// Grid position helpers
function gridToPixel(gridX, gridY, cellSize) {
    return {
        x: gridX * (cellSize + 2) + 10, // 2px gap + 10px padding
        y: gridY * (cellSize + 2) + 10
    };
}

function pixelToGrid(x, y, cellSize) {
    return {
        gridX: Math.floor((x - 10) / (cellSize + 2)),
        gridY: Math.floor((y - 10) / (cellSize + 2))
    };
}

// Color helpers - Ensure maximum 6 block types as per requirements
const BLOCK_COLORS = {
    fruit: ['🍎', '🍌', '🍇', '🍊', '🍓', '🥝'],
    animal: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
    shape: ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'],
    nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌾'],
    space: ['⭐', '🌙', '☀️', '🌟', '💫', '🌈'],
    gems: ['💎', '💍', '🔮', '💖', '✨', '🎭']
};

// Maximum 6 block types for any level as per design requirements
const MAX_BLOCK_TYPES = 6;

function getRandomBlockType() {
    const types = Object.keys(BLOCK_COLORS);
    return types[random(0, Math.min(types.length - 1, MAX_BLOCK_TYPES - 1))];
}

function getRandomBlockIcon(type) {
    const icons = BLOCK_COLORS[type];
    return icons[random(0, icons.length - 1)];
}

// Generate blocks ensuring counts are multiples of 3
function generateBalancedBlocks(gridSize, maxTypes = 4) {
    const totalBlocks = gridSize * gridSize;
    const types = Object.keys(BLOCK_COLORS).slice(0, Math.min(maxTypes, MAX_BLOCK_TYPES));
    const blocksPerType = Math.floor(totalBlocks / types.length);
    const remainder = totalBlocks % types.length;
    
    const blocks = [];
    
    types.forEach((type, index) => {
        const count = blocksPerType + (index < remainder ? 1 : 0);
        // Ensure count is multiple of 3 by adjusting if needed
        const adjustedCount = Math.floor(count / 3) * 3;
        
        for (let i = 0; i < adjustedCount; i++) {
            blocks.push({
                type: type,
                icon: getRandomBlockIcon(type)
            });
        }
    });
    
    // Fill remaining spaces with random blocks to reach total
    while (blocks.length < totalBlocks) {
        const randomType = types[random(0, types.length - 1)];
        blocks.push({
            type: randomType,
            icon: getRandomBlockIcon(randomType)
        });
    }
    
    return shuffle(blocks);
}

// Path finding algorithm (simple A*)
function findPath(grid, start, end) {
    const rows = grid.length;
    const cols = grid[0].length;
    
    // Check if start and end are valid
    if (!isValidPosition(start.x, start.y, rows, cols) || 
        !isValidPosition(end.x, end.y, rows, cols)) {
        return [];
    }
    
    const openSet = [{...start, f: 0, g: 0, h: 0, parent: null}];
    const closedSet = [];
    
    while (openSet.length > 0) {
        // Find node with lowest f score
        let current = openSet[0];
        let currentIndex = 0;
        
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < current.f) {
                current = openSet[i];
                currentIndex = i;
            }
        }
        
        // Move current from open to closed
        openSet.splice(currentIndex, 1);
        closedSet.push(current);
        
        // Check if we reached the end
        if (current.x === end.x && current.y === end.y) {
            const path = [];
            let pathNode = current;
            while (pathNode) {
                path.unshift({x: pathNode.x, y: pathNode.y});
                pathNode = pathNode.parent;
            }
            return path;
        }
        
        // Get neighbors
        const neighbors = [
            {x: current.x + 1, y: current.y},
            {x: current.x - 1, y: current.y},
            {x: current.x, y: current.y + 1},
            {x: current.x, y: current.y - 1}
        ];
        
        for (const neighbor of neighbors) {
            // Skip if out of bounds or blocked
            if (!isValidPosition(neighbor.x, neighbor.y, rows, cols) ||
                grid[neighbor.y][neighbor.x].blocked ||
                closedSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                continue;
            }
            
            const g = current.g + 1;
            const h = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y);
            const f = g + h;
            
            // Skip if this path is worse than an existing one
            const existingNode = openSet.find(node => node.x === neighbor.x && node.y === neighbor.y);
            if (existingNode && existingNode.f <= f) {
                continue;
            }
            
            openSet.push({
                x: neighbor.x,
                y: neighbor.y,
                f, g, h,
                parent: current
            });
        }
    }
    
    return []; // No path found
}

function isValidPosition(x, y, rows, cols) {
    return x >= 0 && x < cols && y >= 0 && y < rows;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        random,
        shuffle,
        deepClone,
        debounce,
        animate,
        Storage,
        EventEmitter,
        showToast,
        showScreen,
        createElement,
        addTouchClickEvent,
        gridToPixel,
        pixelToGrid,
        BLOCK_COLORS,
        getRandomBlockType,
        getRandomBlockIcon,
        findPath
    };
}