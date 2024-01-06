import React from 'react';
import Navbar from './components/Navbar';
import './App.css';
import Home from './pages/Home';
import Generate from './pages/Generate';
import Slurm from './pages/Slurm';
import { HashRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <HashRouter>
        <Navbar />
          <Routes>
            <Route exact path='/' element={<Home/>} />
            <Route exact path='/generate' element={<Generate/>} />
            <Route exact path='/slurm' element={<Slurm/>} />
          </Routes>
      </HashRouter>
    </>
  );
}

export default App;


