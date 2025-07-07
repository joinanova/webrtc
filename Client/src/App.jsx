import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import './App.css'

import { SocketProvider } from './providers/Socket';
import { PeerProvider } from './providers/Peer';

import HomePage from './pages/Home';
import RoomPage from './pages/Room';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/room/:roomId" element={<RoomPage />}></Route>
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </>
  )
}

export default App
