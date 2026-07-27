import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainDashboard from './components/MainDashboard'
import Home from './components/Home';

function App() {
return (

<BrowserRouter>

<Routes>

<Route path="/" element={<Home />} />
<Route path="/dashboard" element={<MainDashboard />} />

</Routes>

</BrowserRouter>

);

}

export default App
