**Note**: This fork has some modifications for my personal use. You probably want to stick with the original version at https://github.com/Glowstick0017/custom-wordle

# Custom Wordle

A full-featured Next.js application for creating and playing custom Wordle games with any word length and customizable guess limits.

## Features

- ✨ **Custom Word Length**: Create Wordles with 1-30 letter words
- 🎯 **Flexible Guess Limits**: Set anywhere from 1 to unlimited guesses
- 🔐 **Simple Encryption**: Vigenère cipher encryption for sharing links
- 📱 **Mobile Optimized**: Perfect UI/UX for mobile devices
- 📊 **Local Statistics**: Track your game stats locally
- 🎉 **Share Results**: Copy results with emoji grids like the original Wordle
- ⌨️ **Full Keyboard Support**: Both virtual and physical keyboard input
- 🎨 **Authentic Styling**: Matches the look and feel of the original Wordle

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
4. Click "Create Shareable Link"
5. Copy and share the generated link, or click "Play Now" to start immediately

### Playing a Custom Wordle

1. Click on a shared link to start playing immediately
2. Guess the word by typing letters
3. Press Enter to submit your guess
4. Green = correct letter in correct position
5. Yellow = correct letter in wrong position
6. Gray = letter not in the word
7. Win by guessing the word within the guess limit!
8. After the game, you can share results, play again, or create a new Wordle

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
├── app/                 # Next.js app router pages
│   ├── create/         # Custom Wordle creation page
│   ├── play/           # Game playing page
│   └── layout.tsx      # Root layout
├── components/         # Reusable React components
│   ├── GameBoard.tsx   # Game grid display
│   ├── Keyboard.tsx    # Virtual keyboard
│   ├── Modal.tsx       # Modal dialogs
│   └── StatsModal.tsx  # Statistics display
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── encryption.ts   # Link encryption/decryption
│   └── gameLogic.ts    # Core game logic
└── globals.css         # Global styles
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
