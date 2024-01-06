import React from 'react';
import { useState } from "react";
import '../App.css';
import './Generate.css';
import Error from "../components/Error";
import { Accordion, AccordionSummary, AccordionDetails, MenuItem, Select, Switch, Alert, Snackbar, Tooltip, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useLocation, Link } from 'react-router-dom';
import {CopyToClipboard} from 'react-copy-to-clipboard';

const Generate = () => {
  const location = useLocation();
  const [command_name, command_args] = location.state?.fromCommand;
  const [generated, setGenerated] = useState("");
  const [argValues, setArgValue] = useState({});
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  async function onOpenFile(argName) {
    const filePath = await window.electronAPI.openFile();
    setArgValue({
      ...argValues,
      [argName]: filePath.toString(),
    });
  }

  function updateArg(e, argName, newValue) {
    setArgValue({
      ...argValues,
      [argName]: newValue,
    });
  }

  function updateChecked (argName, isChecked) {
    setArgValue({
      ...argValues,
      [argName]: isChecked ? true : false,
    });
  };

  function generate(e) {
    e.preventDefault();
    var result = "cryodrgn " + command_name + " ";

    // Object.entries(argValues).map((value) => (console.log(value)));

    for (const [_, args_in_group] of Object.entries(command_args)) {
      for (const [arg_name, arg_details] of Object.entries(args_in_group)) {
        if (arg_name in argValues && argValues[arg_name].toString().length > 0) {
          if ("const" in arg_details) {
            if (argValues[arg_name] == true) {
              result += arg_details.flags[0] + " "
            }
          }
          else {
            if ("flags" in arg_details) {
              result += arg_details.flags[0] + " "
            }
            result += argValues[arg_name] + " "
          }
        }
        else if ("nargs" in arg_details && arg_details.nargs > 1) {
          var multiple_values = ""
          for (var i = 0; i < arg_details.nargs; i++) {
            // does not handle the case when one or multiple values are missing
            if ((arg_name+i) in argValues && argValues[(arg_name+i)] != null) {
              multiple_values += argValues[(arg_name+i)] + " "
            }
          }
          // check for >2 when user types then deletes their input to the multiple argument
          if ((multiple_values.length) > 2) {
            if ("flags" in arg_details) {
              result += arg_details.flags[0] + " "
            }
            result += multiple_values + " "
          }
        }
      } 
    }

    setGenerated(result);
    setAlertMessage("Command generated!");
    setOpenAlert(true);
    return false;
  }

  function renderInput(group, arg_name, arg_details) {
    var type = "text";
    var step = "";
    var onWheel;

    if ("type" in arg_details) {
      // render directory selection and return 
      if (arg_details.type == "abspath") {
        // type = "file";
        return (
          <div className="path-select">
            <input 
            data-toggle="tooltip" 
            data-placement="top" 
            title={arg_details.help}
            type="text"
            required = {group == "positional arguments"}
            id={arg_name+"file"}
            value={arg_name in argValues ? argValues[arg_name] : ""}
            placeholder='Click to select path'
            key = {arg_name}
            readOnly
            onClick={() => onOpenFile(arg_name)}
            />
          {/* <label className="path-select-label" for={arg_name+"_file"}>{arg_name in argValues ? argValues[arg_name] : "Choose path"}</label> */}
          {/* <button id="upload" onClick={onOpenFile}>Upload File</button> */}
          </div>
          // <IconButton type='button' color='inherit' onClick={onOpenFile}>
          //   <FileOpenIcon />
          // </IconButton>
        )
      }
      else {
        type = "number";
        step = "1";
        onWheel = (e) => e.target.blur();
        if (arg_details.type == "float") {
          step = "any";
        }
      }
    }

    // render toggle and return
    if ("const" in arg_details) {
      return (
        <div className="toggle">
          <Switch
            className="toggle-switch"
            checked={argValues[arg_name] ?? false}
            onChange={(e) => updateChecked(arg_name, e.target.checked)}
          />
          <p>{(argValues[arg_name] ?? false) ? arg_details.const.toString() : arg_details.default.toString()}</p>
        </div>
      )
    }

    // render dropdown select and return
    if ("choices" in arg_details) {
      return (
        <div>
          <Select
            className="select"
            value={argValues[arg_name] ?? ""}
            onChange={(e) => updateArg(e, arg_name, e.target.value)}
          >
            {(arg_details.choices).map((option) => (
              <MenuItem className="menu-options" value={option}>{option}</MenuItem>
            )
            )}
          </Select>
        </div>
      )

    }

    // render multiple input selection
    if ("nargs" in arg_details && arg_details.nargs > 0) {
      const nInputs = new Array(arg_details.nargs)
      for (var i = 0; i < arg_details.nargs; i++) {
        nInputs[i] = i;
      };

      return (nInputs).map((index) => 
      (<input 
        data-toggle="tooltip" 
        data-placement="top" 
        title={arg_details.help}
        name={arg_name+index}
        type={type}
        step={step}
        onWheel={onWheel}
        required = {group == "positional arguments"}
        placeholder={arg_details.default}
        key = {arg_name+index}
        onChange={(e) => updateArg(e, arg_name+index, e.target.value)}
      />));
    }

    return (
      <input 
        data-toggle="tooltip" 
        data-placement="top" 
        title={arg_details.help}
        type={type}
        step={step}
        onWheel={onWheel}
        required = {group == "positional arguments"}
        placeholder={arg_details.default}
        key = {arg_name}
        onChange={(e) => updateArg(e, arg_name, e.target.value)}
      />
    )

  }

  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  return (
    <div className="generate">
      {generated && (<div className="result-bar"> 
        <h3>{generated}</h3>
        <CopyToClipboard 
          className="copy"
          text={generated}
          onCopy={() => {
            openAlert ? handleClose() : undefined;
            setAlertMessage("Copied to clipboard!");
            setOpenAlert(true);
          }}>
          <IconButton className="copy-icon" 
          sx={{
            height: 40, marginRight: '30px',
            }}>
            <ContentCopyIcon />
          </IconButton>
        </CopyToClipboard>
        <Snackbar 
          open={openAlert} 
          anchorOrigin={{ vertical: 'top', horizontal: 'right'}} 
          autoHideDuration={3000} 
          onClose={handleClose}
          // TransitionProps={() => setAlertMessage("")}
          >
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
        </div>)}
      {command_args ? (
        <div>
          <h2 style={(generated.length > 0) ? { top: "140px" } : { top: "60px" }}>{command_name}</h2>
          <div className="arguments">
            <form onSubmit={e => generate(e)}>
              <div className="accordion">
                {Object.entries(command_args).map(([group, args]) => 
                  (<Accordion key={group} defaultExpanded={group == "positional arguments"}>
                      <AccordionSummary key={group + "_name"} expandIcon={<ExpandMoreIcon />}><strong>{group}</strong></AccordionSummary>
                      <AccordionDetails key={group + "_details"}>
                        {Object.entries(args).map(([arg_name, arg_details]) =>(
                          <div>
                            <label>{arg_name}</label>
                            <Tooltip title={arg_details.help}>
                              <IconButton className="info-icon">
                                <InfoOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                            {renderInput(group, arg_name, arg_details)}
                          </div>
                        ))}
                      </AccordionDetails>
                    </Accordion> 
                  ))}
              </div>
              <button type="submit">Generate Command</button>
            </form>
            {/* <Link to={"/slurm"} state={{generatedCommand: generated}}>
              <p>Run slurm script</p>
            </Link> */}
          </div>
        </div>
      ) : <Error errorMessage="Data for this command does not exist" />}
    </div>
  );
}
 
export default Generate;