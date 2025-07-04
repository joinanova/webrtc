import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import './App.css'

import { SocketProvider } from './providers/Socket';

import HomePage from './pages/Home';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<HomePage/>}></Route>
          <Route path="/room/:roomId" element={<h1>Room</h1>}></Route>
        </Routes>
      </SocketProvider>
    </>
  )
}

export default App
