import React from 'react';
import './App.css'
import Bg from './Components/Bg.js'
import { Analytics } from "@vercel/analytics/react"

const App = () => (
  <>
    <Analytics />
    <Bg />
  </>
);

export default App;