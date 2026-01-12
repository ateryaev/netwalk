import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameProvider } from './GameContext.jsx'
import { OnlineProvider } from './OnlineContext.jsx'
import { registerSW } from 'virtual:pwa-register';

if (import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      const isAtStart = window.history.state === null;
      if (isAtStart) {
        window.history.replaceState(null, "");
        updateSW(true);
      }
    }
  });
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
