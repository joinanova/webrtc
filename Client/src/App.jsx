import { useState } from 'react'
import {Routes, Route} from "react-router-dom"; 
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<h1>"Hello World"</h1>}></Route>
        <Route path="/h" element={<h1>"Hello World 2"</h1>}></Route>
      </Routes>
    </>
  )
}

export default App
