import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'  // Ink & Garden design system (Tailwind v4 + @theme tokens)
import App from './App.tsx'
import "./styles/global.css"  // 3-line reset — kept (folds into base layer later)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
