import React from 'react';
import '../App.css';
import './Loading.css';

const Loading = () => {
  return (
    <div className="spinner">
        <span>Loading...</span>
        <div className="half-spinner"></div>
    </div>
  );
}
 
export default Loading;