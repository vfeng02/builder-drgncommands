import React from 'react';
import { useState } from "react";
import fields from '../slurm.json';
import { Accordion, AccordionSummary, AccordionDetails, Tooltip, IconButton, Switch } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import '../App.css';
import './Slurm.css';
import { useLocation } from 'react-router-dom';

const Slurm = () => {
    const location = useLocation();
    const generatedCommand = location.state?.generatedCommand;
    const [values, setValues] = useState({});
    // const [slurmScript, setSlurmScript] = useState("");
    const [runOutput, setRunOutput] = useState("");

    async function onSelectDir(fieldName) {
        const dirPath = await window.electronAPI.selectDir();
        // if (isOptional) {
        //     setOptionalValues({
        //         ...optionalValues,
        //         [fieldName]: dirPath.toString(),
        //     });
        // } 
        // else {
        //     setRequiredValues({
        //         ...requiredValues,
        //         [fieldName]: dirPath.toString(),
        //     });
        // }
        setValues({
            ...values,
            [fieldName]: dirPath.toString(),
        });
    };

    async function saveAndRun() {
        const fileName = "hello.py";
        const path = "/Users/vickyfeng/Desktop/Thesis/drgncommands/src/main/" + fileName;
        const content = "print('hello world')";
        const result = await window.electronAPI.saveAndRun([path, content]);
        setRunOutput(result);
    };

    async function generateSlurm(e) {
        e.preventDefault();
        let slurm_configs = "";
        let slurm_env = "module purge \nmodule load ";

        for (const [field_name, field_details] of Object.entries(fields["optional fields"])) {
            if (field_name == "conda version") {
                if (field_name in values) {
                    slurm_env += values[field_name] + "\n"
                }
                else {
                    slurm_env += field_details.default + "\n"
                }
            }
            else if (field_name == "shell") {
                if (field_name in values) {
                    slurm_configs += "#" + values[field_name] + "\n"
                }
                else {
                    slurm_configs += "#" + field_details.default + "\n"
                }
            }
            else if (field_details.type == "toggle") {
                if (field_name in values) { 
                    if (values[field_name]) { // the config should be added
                        slurm_configs += "#SBATCH " + field_details.flag + "\n"
                    }
                }
                else if (field_details.default) {
                    slurm_configs += "#SBATCH" + field_details.flag + "\n"
                }
            }
            else {
                if (field_name in values) {
                    slurm_configs += "#SBATCH " + field_details.flag + "=" + values[field_name] + "\n"
                }
                else {
                    if (field_name != "mail user") {
                        slurm_configs += "#SBATCH " + field_details.flag + "=" + field_details.default + "\n"
                    }
                }
            }
        }
        slurm_configs += "#SBATCH --job-name=" + values["job name"] + "\n \n";
        slurm_env += "conda activate " + values["conda env"] + "\n \n";
        
        // let slurm_script = slurm_configs + slurm_env + generatedCommand;
        let slurm_script = slurm_configs + slurm_env + "python hi.py > output.txt"; // script for testing on della

        // const test_script = "print('''" + slurm_script + "''')";
        const path = values["dir"] + "/" + values["job name"] + ".slurm"; // change .py extension to .slurm

        const result = await window.electronAPI.saveAndRun([path, slurm_script]); // change test_script to slurmScript
        setRunOutput(result);
    };

    function updateField(fieldName, newValue) {
        // if (isOptional) {
        //     setOptionalValues({
        //         ...optionalValues,
        //         [fieldName]: newValue,
        //     });
        // } 
        // else {
        //     setRequiredValues({
        //         ...requiredValues,
        //         [fieldName]: newValue,
        //     });
        // }
        setValues({
            ...values,
            [fieldName]: newValue,
        });
    };

    function updateChecked (fieldName, isChecked) {
        setValues({
            ...values,
            [fieldName]: isChecked ? true : false,
        });
    };

    function renderField(group_name, field_name, field_details) {
        if (field_details.type == "toggle") {
            return (
                <div className="toggle">
                  <Switch
                    key={field_name + "_toggle"}
                    className="toggle-switch"
                    checked={values[field_name] ?? field_details.default}
                    onChange={(e) => updateChecked(field_name, e.target.checked)}
                  />
                  <p>{(field_name in values) ? values[field_name].toString() : field_details.default.toString()}</p>
                </div>
              )
        }
        if (field_details.type == "path") {
            return (
                <div className="path-select">
                  <input 
                  data-toggle="tooltip" 
                  data-placement="top" 
                  title={field_details.help}
                  type="text"
                  required
                  id={field_name+"file"}
                  value={field_name in values ? values[field_name] : ""}
                  placeholder='Click to select path'
                  key = {field_name}
                  readOnly
                  onClick={() => onSelectDir(field_name)}
                  />
                </div>
              )
        }
        return (
            <input 
              data-toggle="tooltip" 
              data-placement="top" 
              title={field_details.help}
              type={field_details.type}
              step={field_details.type == "number" ? 1 : ""}
              required={group_name == "required fields"}
              onWheel={field_details.type == "number" ? ((e) => e.target.blur()) : undefined}
              placeholder={group_name == "required fields" ? "" : field_details.default}
              key = {field_name}
              onChange={(e) => updateField(field_name, e.target.value)}
            />
          )
    };

    return (
        <div className="slurm">
            {/* <p>{runOutput}</p> */}
            <h2>slurm job configurations</h2>
            <form onSubmit={e => generateSlurm(e)}>
                <div className='accordion'>
                    {Object.entries(fields).map(([group_name, group_fields]) => (
                        <Accordion key={group_name+"_accordion"} defaultExpanded={group_name == "required fields"}>
                            <AccordionSummary key={group_name + "_name"} expandIcon={<ExpandMoreIcon />}><strong>{group_name}</strong></AccordionSummary>
                            <AccordionDetails key={group_name + "_details"}>
                            {Object.entries(group_fields).map(([field_name, field_details]) =>(
                                <div key={field_name} className="field">
                                <label>{field_name}</label>
                                <Tooltip title={field_details.help}>
                                    <IconButton className="info-icon">
                                    <InfoOutlinedIcon />
                                    </IconButton>
                                </Tooltip>
                                {renderField(group_name, field_name, field_details)}
                                </div>
                            ))}
                            </AccordionDetails>
                        </Accordion> 
                    ))}
                </div>
                <button type="submit" className='run-button' onClick={(e) => generateSlurm(e)}>Save and run slurm script</button>
            </form>
        </div>
    );

}

export default Slurm;
