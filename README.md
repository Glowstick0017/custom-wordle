# Custom Wordle

A full-featured Next.js application for creating and playing custom Wordle games with any word length and customizable guess limits.

## Features

- ✨ **Custom Word Length**: Create Wordles with 1-30 letter words
- 🎯 **Flexible Guess Limits**: Set anywhere from 1 to unlimited guesses
- ⏱️ **Time Trial Mode**: Race against the clock with customizable time limits (60s, 90s, 120s)
- 🔥 **Hard Mode**: Revealed hints must be used in subsequent guesses
- 📖 **Real Words Only**: Enforce dictionary word validation
- 🔐 **Simple Encryption**: Vigenère cipher encryption for sharing links
- 📱 **Mobile Optimized**: Perfect UI/UX for mobile devices
- 📊 **Local Statistics**: Track your game stats locally
- 🎉 **Share Results**: Copy results with emoji grids like the original Wordle
- ⌨️ **Full Keyboard Support**: Both virtual and physical keyboard input
- 🎨 **Authentic Styling**: Matches the look and feel of the original Wordle
- ♿ **Accessibility Mode**: High contrast colors for better visibility

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd customwordle
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Creating a Custom Wordle

1. Click "Create Custom Wordle" from the home page (opens in a modal)
2. Enter your word (1-30 letters, letters only)
3. Set the maximum number of guesses (1+ or unlimited)
4. **Optional**: Click "Advanced Settings" to enable:
   - **Hard Mode**: Forces players to use revealed hints
   - **Real Words Only**: Only allows dictionary words as guesses
   - **⏱️ Time Trial Mode**: Add a countdown timer (60s, 90s, or 120s)
   - **Hint**: Provide a custom hint to help players
5. Click "Create Shareable Link"
6. Copy and share the generated link, or click "Play Now" to start immediately

### Playing a Custom Wordle

1. Click on a shared link to start playing immediately
2. Guess the word by typing letters
3. Press Enter to submit your guess
4. **Color Coding**:
   - 🟢 Green = correct letter in correct position
   - 🟡 Yellow = correct letter in wrong position
   - ⚫ Gray = letter not in the word
5. **Time Trial Mode**: Timer starts when you type the first letter
6. Win by guessing the word within the guess limit (and time limit if enabled)!
7. After the game, you can share results, play again, or create a new Wordle

### Time Trial Mode ⏱️

Add an exciting time-based challenge to your Wordle games!

**How it works:**
1. Enable "Time Trial Mode" in Advanced Settings when creating a game
2. Choose your time limit: 60s (Fast), 90s (Medium), or 120s (Relaxed)
3. Timer starts when you type the first letter (not immediately)
4. Race against the clock to solve the puzzle!
5. Timer pauses when you open modals (Stats, How to Play, etc.)
6. Game ends if time runs out - you lose!
7. Win before time runs out to see your completion time

**Visual Features:**
- Countdown timer with progress bar
- Color-coded warnings (green → yellow → red)
- Pulsing animation when time is low (< 10 seconds)
- Completion time displayed for successful games

### Viewing Statistics

- Click the statistics button to view your game history
- See games played, win percentage, current streak, and guess distribution
- Statistics are stored locally in your browser

## Technical Details

### Built With

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Custom Vigenère cipher** - Simple encryption for sharing links

### Key Features

- **Responsive Design**: Optimized for all screen sizes with mobile-first approach
- **PWA Ready**: Includes manifest.json for app-like experience
- **Keyboard Navigation**: Full support for physical keyboards
- **Touch Optimized**: Proper touch targets and gestures for mobile
- **Local Storage**: Game statistics persist between sessions
- **URL Encryption**: Game data is encrypted in sharing URLs using Vigenère cipher

### Project Structure

```
src/
├── app/                      # Next.js app router pages
│   ├── daily/               # Daily Wordle page
│   ├── play/                # Game playing page
│   └── layout.tsx           # Root layout
├── components/              # Reusable React components
│   ├── GameBoard.tsx        # Game grid display
│   ├── Keyboard.tsx         # Virtual keyboard
│   ├── Timer.tsx            # Time Trial countdown timer
│   ├── Modal.tsx            # Modal dialogs
│   ├── StatsModal.tsx       # Statistics display
│   ├── CreateModal.tsx      # Game creation modal
│   └── HowToPlayModal.tsx   # Instructions modal
├── contexts/                # React contexts
│   └── AccessibilityContext.tsx  # Accessibility mode state
├── types/                   # TypeScript type definitions
│   └── game.ts              # Game state and types
├── utils/                   # Utility functions
│   ├── encryption.ts        # Link encryption/decryption
│   ├── gameLogic.ts         # Core game logic
│   ├── gameSession.ts       # Session persistence
│   └── dailyGame.ts         # Daily word generation
└── globals.css              # Global styles
```

## Deployment

The app can be deployed to any platform that supports Next.js:

### Vercel (Recommended)
```bash
npm run build
```
Then deploy to Vercel

### Other Platforms
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by the original Wordle game by Josh Wardle
- Built with modern web technologies for the best user experience
