import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameProvider } from './GameContext.jsx'
import { OnlineProvider } from './OnlineContext.jsx'
import { registerSW } from 'virtual:pwa-register';

if (import.meta.env.PROD) {
  registerSW({ immediate: true });
}

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
