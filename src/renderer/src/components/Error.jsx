import React from 'react';
import '../App.css';
import './Error.css';
import Alert from '@mui/material/Alert';

const Error = ( {errorMessage} ) => {
  return (
    <div className="error">
         <Alert severity="error">{errorMessage}</Alert>
    </div>
  );
}
 
export default Error;