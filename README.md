# 脑洞迷城 (Brain Maze City)

A pixel-style puzzle maze game featuring match-3 block elimination mechanics, built with HTML5, CSS3, and JavaScript.

## 🎮 Game Features

### Visual Style
- **Pixel Art Design**: Retro pixel art aesthetic with bright, cheerful colors
- **Color Palette**: Light blue, pale yellow, and light green theme
- **Responsive Design**: Works on desktop and mobile devices

### Gameplay Mechanics
- **Match-3 Elimination**: Clear paths by matching three identical blocks
- **Progressive Difficulty**: 
  - Levels 1-5: Tutorial with simple layouts
  - Levels 6-20: Intermediate with locked blocks and obstacles
  - Levels 21+: Advanced with procedural generation and AI difficulty adjustment
- **Special Items**:
  - 🔑 Key: Unlock locked blocks (max 1 per level)
  - 💣 Bomb: Clear a 3x3 area (max 2 per level)
  - 💡 Hint: Show optimal move (max 3 per level)

### Game Screens
- **Login Screen**: Social login with Google and WeChat
- **Main Game**: Grid-based maze with character movement
- **Leaderboard**: Global and friends rankings
- **Settings**: Audio controls, game rules, feedback system

### Technical Features
- **HTML5 Canvas-free**: Pure DOM-based rendering for compatibility
- **Local Storage**: Persistent game progress and settings
- **Web Audio API**: Synthetic sound effects and background music
- **Touch Support**: Optimized for mobile gameplay
- **Keyboard Controls**: WASD/Arrow keys for desktop players

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required - runs directly in browser

### Running the Game

#### Option 1: Direct File Access
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start playing!

#### Option 2: Local Server (Recommended)
```bash
# Using Python (if installed)
python -m http.server 8080

# Or using Node.js
npx http-server -p 8080

# Then open http://localhost:8080 in your browser
```

#### Option 3: Using npm
```bash
npm install
npm start
```

## 🎯 How to Play

### Basic Controls
- **Desktop**: 
  - Click blocks to select them
  - Use WASD or arrow keys to move character
  - Spacebar for hints
  - ESC for settings
- **Mobile**: 
  - Tap blocks to select
  - Character moves automatically when path is clear

### Game Objective
1. **Match Blocks**: Select three identical blocks to eliminate them
2. **Clear Path**: Create a route from start (top-left) to exit (bottom-right)
3. **Use Items**: Strategic use of keys, bombs, and hints
4. **Reach Exit**: Guide your character to the goal

### Special Mechanics
- **Hidden Items**: Some blocks contain bonus items when eliminated
- **Locked Blocks**: Require keys to unlock
- **Time/Move Limits**: Advanced levels have restrictions
- **Score System**: Points based on efficiency and style

## 📱 Mobile Optimization

The game is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Swipe gestures for navigation
- Automatic screen scaling
- Portrait and landscape support

## 🔧 Architecture

### File Structure
```
/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css           # Base styles and animations
│   ├── game.css           # Game-specific styles
│   └── ui.css             # UI components styling
├── js/
│   ├── utils.js           # Utility functions
│   ├── game-engine.js     # Core game logic
│   ├── level-manager.js   # Level generation and progression
│   ├── ui-manager.js      # UI interactions and updates
│   ├── audio-manager.js   # Sound effects and music
│   └── main.js            # Application orchestration
└── audio/                 # Audio files (optional)
```

### Key Components

#### GameEngine
- Handles game state and logic
- Block elimination mechanics
- Player movement and collision
- Item usage and effects

#### LevelManager
- Procedural level generation
- Difficulty progression
- Unlock system
- Achievement tracking

#### UIManager
- Screen transitions
- Maze rendering
- User input handling
- Modal dialogs

#### AudioManager
- Synthetic sound generation
- Background music management
- Volume controls
- Mobile audio optimization

## 🎨 Customization

### Adding New Block Types
Edit `js/utils.js` to add new block categories:
```javascript
const BLOCK_COLORS = {
    fruit: ['🍎', '🍌', '🍇', '🍊', '🍓', '🥝'],
    animal: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
    shape: ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'],
    // Add your custom types here
    custom: ['⭐', '❄️', '🔥', '⚡', '🌙', '☀️']
};
```

### Modifying Difficulty Curves
Adjust difficulty settings in `js/level-manager.js`:
```javascript
const difficultySettings = {
    tutorial: {
        gridSize: 8,
        blockedPercentage: 0.6,
        // ... other settings
    }
    // Modify existing or add new difficulty tiers
};
```

### Styling Changes
- **Colors**: Modify CSS variables in `styles/main.css`
- **Animations**: Update keyframes and transitions
- **Layout**: Adjust grid sizes and component positioning

## 🌐 Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 12+)
- **Edge**: Full support
- **Internet Explorer**: Not supported (uses modern JS features)

## 📈 Performance Optimization

- **Efficient DOM Updates**: Minimal reflow/repaint operations
- **Event Delegation**: Optimized event handling for large grids
- **Memory Management**: Proper cleanup of audio contexts and timers
- **Asset Loading**: Lightweight, no external dependencies

## 🔊 Audio System

The game features a comprehensive audio system:
- **Synthetic Sound Effects**: Generated using Web Audio API
- **Background Music**: Loop-capable audio management
- **Volume Controls**: Separate BGM and SFX settings
- **Mobile Compatibility**: Handles autoplay restrictions

## 💾 Data Persistence

Game progress is automatically saved using localStorage:
- Player progress and unlocked levels
- High scores and statistics
- Audio and display preferences
- Achievement data

## 🐛 Known Issues & Limitations

- **Audio Autoplay**: Some browsers require user interaction before playing audio
- **iOS Safari**: Minor touch event quirks on older versions
- **Offline Mode**: Currently requires internet for social features

## 🔮 Future Enhancements

- **Multiplayer Mode**: Real-time competitive gameplay
- **Level Editor**: Community-created levels
- **Power-up Shop**: Additional items and abilities
- **Achievements System**: Unlock rewards and badges
- **Cloud Sync**: Cross-device progress synchronization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, feature requests, or bug reports:
- Open an issue on GitHub
- Contact: [project maintainer]

## 🎯 Game Design Philosophy

Brain Maze City follows these design principles:
- **Accessibility**: Easy to learn, challenging to master
- **Progressive Difficulty**: Smooth learning curve
- **Visual Clarity**: Clear feedback and intuitive interface
- **Mobile-First**: Optimized for touch devices
- **Performance**: Smooth gameplay on all devices

---

**Enjoy playing Brain Maze City! 🧩✨**