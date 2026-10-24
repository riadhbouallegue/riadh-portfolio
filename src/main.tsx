import { createRoot } from 'react-dom/client'
import '@fontsource/anton'
import '@fontsource-variable/inter-tight'
import '@fontsource/jetbrains-mono'
import './styles.css'
import App from './App'

// No React.StrictMode: effects must run exactly once (single scroll tick, single frame loader).
createRoot(document.getElementById('root')!).render(<App />)
