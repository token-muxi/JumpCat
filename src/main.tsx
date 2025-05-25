import { StrictMode ,useState} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import JumpGame from './JumpGame.tsx'
import StartScreen from "./StartScreen.tsx";
import Prepare from './Prepare.tsx';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';

const App = () => {
  const [started, setStarted] = useState(false)

  return (
      <Router>
        <Routes>
          <Route path='/' element={<StartScreen onStart={() => setStarted(true)}/>}></Route>
          <Route path='/singlegame/:roomId/:uuid' element={<JumpGame/>}></Route>
          {/* <Route path='/singleSuccess/:time' element={<SingleSucess />}></Route> */}
          <Route path='/prepare/:roomId/:uuid' element={<Prepare/>}></Route>
        </Routes>
      </Router>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
