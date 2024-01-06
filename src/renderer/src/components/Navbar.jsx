import React from 'react';
import { Link } from "react-router-dom";
import '../App.css';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="title">
        <Link to="/"><h1>cryoDRGN commands</h1></Link>
      </div>
      <div className="links">
        <Link to="/">Home</Link>
      </div>
    </nav>
  );
}
 
export default Navbar;