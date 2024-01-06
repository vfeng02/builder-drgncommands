import React from 'react';
import { useState } from "react";
import '../App.css';
import './Slurm.css';
import { useLocation } from 'react-router-dom';

const Slurm = () => {
    const location = useLocation();
    const generated = location.state?.generatedCommand;
    const [output, setOutput] = useState("");

    async function saveAndRun() {
        const fileName = "hello.py";
        const path = "/Users/vickyfeng/Desktop/Thesis/drgncommands/src/main/" + fileName;
        const content = "print('hello world')";
        const result = await window.electronAPI.saveAndRun([path, content]);
        setOutput(result);
    }

    return (
        <div className="slurm">
            <p>{output}</p>
            <button onClick={saveAndRun}>Click to save and run script</button>
        </div>
    );

}

export default Slurm;
