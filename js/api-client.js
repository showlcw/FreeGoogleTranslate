// API Client - Handle backend communication and authentication

class APIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = Storage.get('authToken');
        this.user = Storage.get('currentUser');
        
        // Mock API endpoints
        this.endpoints = {
            login: '/api/login',
            rankUpdate: '/api/rank/update',
            rankTop: '/api/rank/top',
            userProfile: '/api/user/profile',
            gameState: '/api/game/state',
            achievements: '/api/achievements'
        };
        
        this.init();
    }
    
    init() {
        // Initialize mock server responses
        this.setupMockResponses();
    }
    
    setupMockResponses() {
        // Mock data for development
        this.mockData = {
            leaderboard: [
                { rank: 1, name: '迷宫大师', score: 15420, level: 25, avatar: '👑' },
                { rank: 2, name: '方块消除王', score: 13890, level: 22, avatar: '🏆' },
                { rank: 3, name: '脑洞专家', score: 12350, level: 20, avatar: '🧠' },
                { rank: 4, name: '路径探索者', score: 11200, level: 18, avatar: '🗺️' },
                { rank: 5, name: '智慧玩家', score: 10150, level: 16, avatar: '💡' },
                { rank: 6, name: '策略高手', score: 9800, level: 15, avatar: '🎯' },
                { rank: 7, name: '迷宫新星', score: 8900, level: 14, avatar: '⭐' },
                { rank: 8, name: '思考者', score: 8200, level: 12, avatar: '🤔' },
                { rank: 9, name: '挑战者', score: 7500, level: 11, avatar: '⚡' },
                { rank: 10, name: '初学者', score: 6800, level: 10, avatar: '🌱' }
            ],
            userProfiles: {
                'google_123': {
                    id: 'google_123',
                    name: '迷宫探险家',
                    email: 'player@gmail.com',
                    avatar: '🧗‍♂️',
                    provider: 'google',
                    level: 8,
                    totalScore: 5200,
                    gamesPlayed: 15,
                    achievements: ['first_win', 'level_5', 'perfect_game']
                },
                'wechat_456': {
                    id: 'wechat_456',
                    name: '方块大师',
                    avatar: '🎮',
                    provider: 'wechat',
                    level: 12,
                    totalScore: 8900,
                    gamesPlayed: 28,
                    achievements: ['first_win', 'level_5', 'level_10', 'speed_run']
                }
            }
        };
    }
    
    // Authentication methods
    async loginWithGoogle() {
        try {
            // Simulate Google OAuth flow
            await this.simulateAsyncDelay(1500);
            
            const userData = {
                id: 'google_' + Date.now(),
                name: '谷歌用户' + Math.floor(Math.random() * 1000),
                email: 'user@gmail.com',
                avatar: '🧗‍♂️',
                provider: 'google'
            };
            
            const authResponse = {
                success: true,
                token: 'jwt_token_' + Date.now(),
                user: userData,
                message: '谷歌登录成功'
            };
            
            this.saveAuthData(authResponse);
            return authResponse;
            
        } catch (error) {
            throw new Error('谷歌登录失败: ' + error.message);
        }
    }
    
    async loginWithWeChat() {
        try {
            // Simulate WeChat OAuth flow
            await this.simulateAsyncDelay(2000);
            
            const userData = {
                id: 'wechat_' + Date.now(),
                name: '微信用户' + Math.floor(Math.random() * 1000),
                avatar: '🎮',
                provider: 'wechat'
            };
            
            const authResponse = {
                success: true,
                token: 'jwt_token_' + Date.now(),
                user: userData,
                message: '微信登录成功'
            };
            
            this.saveAuthData(authResponse);
            return authResponse;
            
        } catch (error) {
            throw new Error('微信登录失败: ' + error.message);
        }
    }
    
    saveAuthData(authResponse) {
        this.token = authResponse.token;
        this.user = authResponse.user;
        
        Storage.set('authToken', this.token);
        Storage.set('currentUser', this.user);
    }
    
    logout() {
        this.token = null;
        this.user = null;
        
        Storage.remove('authToken');
        Storage.remove('currentUser');
    }
    
    isAuthenticated() {
        return !!(this.token && this.user);
    }
    
    getCurrentUser() {
        return this.user;
    }
    
    // API call methods
    async updateRank(gameData) {
        try {
            await this.simulateAsyncDelay(800);
            
            if (!this.isAuthenticated()) {
                throw new Error('未登录');
            }
            
            // Simulate updating leaderboard
            const userRank = {
                userId: this.user.id,
                name: this.user.name,
                score: gameData.score,
                level: gameData.level,
                moves: gameData.moves,
                timeElapsed: gameData.timeElapsed,
                timestamp: Date.now()
            };
            
            // Update local leaderboard
            const leaderboard = Storage.get('leaderboard', []);
            leaderboard.push(userRank);
            leaderboard.sort((a, b) => b.score - a.score);
            Storage.set('leaderboard', leaderboard.slice(0, 50)); // Keep top 50
            
            return {
                success: true,
                rank: leaderboard.findIndex(entry => entry.userId === this.user.id) + 1,
                message: '排名更新成功'
            };
            
        } catch (error) {
            throw new Error('排名更新失败: ' + error.message);
        }
    }
    
    async getTopRanks(limit = 10) {
        try {
            await this.simulateAsyncDelay(500);
            
            // Get local leaderboard first
            const localLeaderboard = Storage.get('leaderboard', []);
            
            // Merge with mock data for demonstration
            const combinedLeaderboard = [
                ...localLeaderboard,
                ...this.mockData.leaderboard
            ];
            
            // Remove duplicates and sort
            const uniqueLeaderboard = combinedLeaderboard
                .filter((item, index, arr) => 
                    arr.findIndex(x => x.name === item.name) === index
                )
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
            
            // Add rank numbers
            uniqueLeaderboard.forEach((item, index) => {
                item.rank = index + 1;
            });
            
            return {
                success: true,
                data: uniqueLeaderboard,
                timestamp: Date.now()
            };
            
        } catch (error) {
            throw new Error('获取排行榜失败: ' + error.message);
        }
    }
    
    async syncGameState(gameState) {
        try {
            await this.simulateAsyncDelay(600);
            
            if (!this.isAuthenticated()) {
                return { success: false, message: '未登录，使用本地存储' };
            }
            
            // Simulate cloud sync
            const syncData = {
                userId: this.user.id,
                gameState: gameState,
                timestamp: Date.now()
            };
            
            Storage.set('cloudGameState', syncData);
            
            return {
                success: true,
                message: '游戏数据同步成功'
            };
            
        } catch (error) {
            throw new Error('数据同步失败: ' + error.message);
        }
    }
    
    async loadGameState() {
        try {
            await this.simulateAsyncDelay(400);
            
            if (!this.isAuthenticated()) {
                return { success: false, message: '未登录，使用本地数据' };
            }
            
            const cloudData = Storage.get('cloudGameState');
            
            if (cloudData && cloudData.userId === this.user.id) {
                return {
                    success: true,
                    data: cloudData.gameState,
                    message: '云端数据加载成功'
                };
            }
            
            return {
                success: false,
                message: '无云端数据，使用本地数据'
            };
            
        } catch (error) {
            throw new Error('加载游戏数据失败: ' + error.message);
        }
    }
    
    async getUserAchievements() {
        try {
            await this.simulateAsyncDelay(300);
            
            if (!this.isAuthenticated()) {
                throw new Error('未登录');
            }
            
            // Mock achievements data
            const achievements = [
                { id: 'first_win', name: '初次胜利', description: '完成第一关', unlocked: true },
                { id: 'level_5', name: '小试牛刀', description: '完成第5关', unlocked: true },
                { id: 'level_10', name: '渐入佳境', description: '完成第10关', unlocked: false },
                { id: 'perfect_game', name: '完美通关', description: '不使用道具通关', unlocked: true },
                { id: 'speed_run', name: '速度之星', description: '60秒内通关', unlocked: false },
                { id: 'master_player', name: '迷宫大师', description: '完成第20关', unlocked: false }
            ];
            
            return {
                success: true,
                data: achievements
            };
            
        } catch (error) {
            throw new Error('获取成就失败: ' + error.message);
        }
    }
    
    // Helper methods
    async simulateAsyncDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
    
    // Real HTTP methods (for future backend integration)
    async makeRequest(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '请求失败');
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
    
    async get(endpoint) {
        return this.makeRequest(endpoint, { method: 'GET' });
    }
    
    async post(endpoint, data) {
        return this.makeRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async put(endpoint, data) {
        return this.makeRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    async delete(endpoint) {
        return this.makeRequest(endpoint, { method: 'DELETE' });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}