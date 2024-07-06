import React from 'react';
import './App.css'
import Bg from './Components/Bg.js'
import { Analytics } from "@vercel/analytics/react"

const App = () => {
  return (
    <div>
      <Analytics />
      <Bg/>
    </div>
  )
}

export default App