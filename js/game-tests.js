// JavaScript Unit Tests for Brain Maze City Game

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }
    
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    async runAllTests() {
        console.log('🧪 Running Brain Maze City Tests...\n');
        
        for (const test of this.tests) {
            try {
                await test.testFunction();
                this.results.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.results.failed++;
                console.error(`❌ ${test.name}: ${error.message}`);
            }
            this.results.total++;
        }
        
        this.printSummary();
    }
    
    printSummary() {
        console.log('\n📊 Test Summary:');
        console.log(`Total: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    }
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }
    
    assertNotNull(value, message) {
        if (value === null || value === undefined) {
            throw new Error(message || 'Value should not be null/undefined');
        }
    }
}

// Create test runner instance
const testRunner = new TestRunner();

// Test Utility Functions
testRunner.test('Random number generation', () => {
    for (let i = 0; i < 100; i++) {
        const num = random(1, 10);
        testRunner.assert(num >= 1 && num <= 10, `Random number ${num} not in range 1-10`);
    }
});

testRunner.test('Array shuffle maintains length', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    testRunner.assertEqual(shuffled.length, original.length, 'Shuffled array length mismatch');
    testRunner.assert(original.every(item => shuffled.includes(item)), 'Shuffled array missing elements');
});

testRunner.test('Storage operations', () => {
    const testData = { level: 5, score: 1000 };
    
    Storage.set('test', testData);
    const retrieved = Storage.get('test');
    
    testRunner.assertEqual(retrieved.level, testData.level, 'Retrieved level mismatch');
    testRunner.assertEqual(retrieved.score, testData.score, 'Retrieved score mismatch');
    
    Storage.remove('test');
    const removed = Storage.get('test');
    testRunner.assertEqual(removed, null, 'Data not properly removed');
});

// Test Block Generation
testRunner.test('Block type generation respects maximum types', () => {
    for (let i = 0; i < 50; i++) {
        const blockType = getRandomBlockType();
        const validTypes = Object.keys(BLOCK_COLORS);
        testRunner.assert(validTypes.includes(blockType), `Invalid block type: ${blockType}`);
    }
});

testRunner.test('Balanced block generation', () => {
    const gridSize = 8;
    const blocks = generateBalancedBlocks(gridSize, 3);
    
    testRunner.assertEqual(blocks.length, gridSize * gridSize, 'Incorrect number of blocks generated');
    
    // Count blocks by type
    const typeCounts = {};
    blocks.forEach(block => {
        typeCounts[block.type] = (typeCounts[block.type] || 0) + 1;
    });
    
    // Verify no more than 3 types used (as requested)
    const typeCount = Object.keys(typeCounts).length;
    testRunner.assert(typeCount <= 3, `Too many block types: ${typeCount}`);
    
    // Verify counts are reasonable for elimination
    Object.values(typeCounts).forEach(count => {
        testRunner.assert(count >= 3, `Type count too low for elimination: ${count}`);
    });
});

// Test Pathfinding
testRunner.test('Path finding with clear path', () => {
    const grid = Array(5).fill().map(() => Array(5).fill({ blocked: false }));
    const path = findPath(grid, { x: 0, y: 0 }, { x: 4, y: 4 });
    
    testRunner.assert(path.length > 0, 'No path found when clear path exists');
    testRunner.assertEqual(path[0].x, 0, 'Path start incorrect');
    testRunner.assertEqual(path[0].y, 0, 'Path start incorrect');
    testRunner.assertEqual(path[path.length - 1].x, 4, 'Path end incorrect');
    testRunner.assertEqual(path[path.length - 1].y, 4, 'Path end incorrect');
});

testRunner.test('Path finding with blocked path', () => {
    const grid = Array(3).fill().map(() => Array(3).fill({ blocked: true }));
    grid[0][0].blocked = false; // Start
    grid[2][2].blocked = false; // End
    
    const path = findPath(grid, { x: 0, y: 0 }, { x: 2, y: 2 });
    testRunner.assertEqual(path.length, 0, 'Path found when none should exist');
});

// Test Game Engine
testRunner.test('GameEngine initialization', () => {
    const engine = new GameEngine();
    
    testRunner.assertNotNull(engine.gameState, 'Game state not initialized');
    testRunner.assertEqual(engine.gameState.currentLevel, 1, 'Initial level incorrect');
    testRunner.assertEqual(engine.gameState.moves, 0, 'Initial moves incorrect');
    testRunner.assertEqual(engine.gameState.consecutiveFailures, 0, 'Initial failures incorrect');
    testRunner.assertEqual(engine.gameState.maxFailures, 3, 'Max failures incorrect');
});

testRunner.test('Game state persistence', () => {
    const engine = new GameEngine();
    engine.gameState.currentLevel = 5;
    engine.gameState.score = 2500;
    
    engine.saveGameState();
    
    const newEngine = new GameEngine();
    testRunner.assertEqual(newEngine.gameState.currentLevel, 5, 'Level not persisted');
    testRunner.assertEqual(newEngine.gameState.score, 2500, 'Score not persisted');
});

// Test API Client
testRunner.test('API Client initialization', async () => {
    const api = new APIClient();
    
    testRunner.assertNotNull(api.endpoints, 'API endpoints not defined');
    testRunner.assertNotNull(api.mockData, 'Mock data not initialized');
    testRunner.assert(typeof api.loginWithGoogle === 'function', 'Google login method missing');
    testRunner.assert(typeof api.loginWithWeChat === 'function', 'WeChat login method missing');
});

testRunner.test('Mock Google login', async () => {
    const api = new APIClient();
    const response = await api.loginWithGoogle();
    
    testRunner.assertEqual(response.success, true, 'Google login failed');
    testRunner.assertNotNull(response.token, 'No auth token returned');
    testRunner.assertNotNull(response.user, 'No user data returned');
    testRunner.assertEqual(response.user.provider, 'google', 'Wrong provider');
});

testRunner.test('Mock WeChat login', async () => {
    const api = new APIClient();
    const response = await api.loginWithWeChat();
    
    testRunner.assertEqual(response.success, true, 'WeChat login failed');
    testRunner.assertNotNull(response.token, 'No auth token returned');
    testRunner.assertNotNull(response.user, 'No user data returned');
    testRunner.assertEqual(response.user.provider, 'wechat', 'Wrong provider');
});

testRunner.test('Leaderboard retrieval', async () => {
    const api = new APIClient();
    const response = await api.getTopRanks(5);
    
    testRunner.assertEqual(response.success, true, 'Leaderboard retrieval failed');
    testRunner.assertNotNull(response.data, 'No leaderboard data');
    testRunner.assert(response.data.length <= 5, 'Too many leaderboard entries returned');
    
    if (response.data.length > 0) {
        const first = response.data[0];
        testRunner.assertNotNull(first.name, 'First entry missing name');
        testRunner.assertNotNull(first.score, 'First entry missing score');
        testRunner.assertEqual(first.rank, 1, 'First entry rank incorrect');
    }
});

// Test Level Manager
testRunner.test('Level Manager initialization', () => {
    const levelManager = new LevelManager();
    
    testRunner.assertNotNull(levelManager.difficultySettings, 'Difficulty settings missing');
    testRunner.assertEqual(levelManager.currentLevel, 1, 'Initial level incorrect');
    testRunner.assert(levelManager.maxLevel > 0, 'Max level not set');
});

// Test UI Manager
testRunner.test('UI Manager initialization', () => {
    // Mock DOM elements for testing
    global.document = {
        getElementById: () => ({ addEventListener: () => {} }),
        querySelectorAll: () => [],
        addEventListener: () => {}
    };
    
    const uiManager = new UIManager();
    
    testRunner.assertNotNull(uiManager.apiClient, 'API client not initialized');
    testRunner.assertNotNull(uiManager.playerData, 'Player data not initialized');
    testRunner.assertEqual(uiManager.currentScreen, 'loading', 'Initial screen incorrect');
});

// Run all tests when script loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            testRunner.runAllTests();
        }, 1000);
    });
} else {
    // For Node.js environment
    testRunner.runAllTests();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestRunner, testRunner };
}