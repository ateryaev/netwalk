# Netwalk

Netwalk is a modern, feature-rich puzzle game inspired by the classic Netwalk. This version introduces new levels, increasing complexity, multi-color puzzles, and additional gameplay features for a fresh and challenging experience.


## Progressive Web App (PWA)

Netwalk is a Progressive Web App (PWA). You can install it on your mobile device or desktop for a dedicated app-like experience. Simply use your browser's "Add to Home Screen" or "Install App" feature to install Netwalk and play offline.

## Features

- **Classic Netwalk Gameplay**: Rotate tiles to connect all terminals and complete the network.
- **Multiple Game Modes**: Unlock and play through various modes, each with unique rules and challenges.
- **Progressive Levels**: Levels increase in size and complexity as you advance.
- **Multi-Color Networks**: Some puzzles require connecting multiple colored networks simultaneously.
- **Achievements & Scoring**: Earn points, track your progress, and compete on the leaderboard.
- **Responsive UI**: Designed for both desktop and mobile devices.
- **Sound & Music**: Optional sound effects and background music for an immersive experience.
- **Settings**: Customize sound, music, vibration, and player name.

## Gameplay

1. **Objective**: Rotate tiles to connect all endpoints and complete the network.
2. **Controls**: Click or tap a tile to rotate it. All connections must be completed for the puzzle to be solved.
3. **Modes**: Unlock new modes by solving puzzles. Each mode may introduce new mechanics (e.g., borders, looped edges, emptiness percentage).
4. **Levels**: Each mode contains a series of levels with increasing difficulty.

## Installation

1. **Clone the repository**:
	```sh
	git clone https://github.com/ateryaev/netwalker.git
	cd netwalker
	```
2. **Install dependencies**:
	```sh
	npm install
	```
3. **Run the development server**:
	```sh
	npm run dev
	```
4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## Build

To build the project for production:
```sh
npm run build
```


## Project Architecture

The project is structured as a modern React application using TypeScript and Vite for fast development and builds. Key architectural components:

- **src/**: Main source code directory
	- **App.jsx**: Main application entry and router
	- **components/**: Reusable UI components (buttons, modals, headers, etc.)
	- **game/**: Core game logic, level generation, state management, and constants
	- **utils/**: Utility functions for math, sound, storage, and rendering
	- **Page*.jsx/tsx**: Page components for different screens (menu, play, settings, about, etc.)
- **public/**: Static assets, manifest, and icons for PWA support
- **index.html**: Main HTML entry point
- **vite.config.ts**: Vite configuration

The app uses React Context for global state (progress, settings), and supports PWA features via the manifest and service worker for offline play and installation.

## Usage

- Play directly in your browser after starting the development server.
- Use the menu to select game modes, view your progress, and adjust settings.
- Your progress and settings are saved locally.

## Credits

- Developed by Anton Teryaev.
- Uses [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), and [zzfx](https://killedbyapixel.github.io/ZzFX/) for sound effects.

## License

This project is licensed under the MIT License.
