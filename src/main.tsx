import { StrictMode,useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import JumpGame from './JumpGame.tsx'
import StartScreen from "./StartScreen.tsx";

const App = () => {
  const [started, setStarted] = useState(false)

  return (
    <StrictMode>
      {started ? <JumpGame /> : <StartScreen onStart={() => setStarted(true)} />}
      {/*<JumpGame />*/}
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
