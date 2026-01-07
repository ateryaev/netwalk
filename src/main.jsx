import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameProvider } from './GameContext.jsx'
import { OnlineProvider } from './OnlineContext.jsx'
import * as serviceWorkerRegistration from './serviceWorkerRegistration.js';

createRoot(document.getElementById('root')).render(
  <><StrictMode>
    <OnlineProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </OnlineProvider>
  </StrictMode>
  </>
)

serviceWorkerRegistration.register();
