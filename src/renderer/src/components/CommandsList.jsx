import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import './CommandsList.css';

const CommandList = ({ commands }) => {
  return (
    <div className="command-list">
      {Object.entries(commands).map(([command_name,command_info]) => (
        <div className="command-preview" key={"summary_"+ command_name} >
        <Link to={"/generate"} key={"link"+command_name} state={{fromCommand: [command_name, command_info.args]}}>
            <h2>{ command_name }</h2>
            <p>{ command_info.desc }</p>
          </Link>
        </div>
      ))}
    </div>
  );
}
 
export default CommandList;