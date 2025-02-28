import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import error from './img/error.png'; // Assuming you have an error image
import { selectClasses } from '@mui/material';

const ErrorMessageBox = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showEmptyResult, setShowEmptyResult] = useState(""); // initialize state variable for showing empty result message.

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    }; 

    return (
        <div style={{ margin: '-5px 0 0 ',backgroundColor: '#f3b7b7', border: '1px solid #e0a1a1', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
            <div onClick={toggleExpanded} style={{ display: 'flex', alignItems: 'center', padding: '1em', cursor: 'pointer', userSelect: 'none', borderRadius: '5px'}}>
                <img 
                    src={error}
                    className="error-logo"
                    alt="error logo"
                    style={{ width:'2.5rem', height: '2.5rem', objectFit: 'contain', marginRight: '0.5em'}}
                />
                
                <h5 style={{ margin: 0, flexGrow: 1}}>Feilmeldinger</h5>
                <div
                    style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '2em'}}
                    onClick={toggleExpanded}
                >
                 <FontAwesomeIcon style={{marginLeft: 'auto', fontSize: '1.25em'}} icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
            </div>

            
            {isExpanded && (
                <div style={{ width: '100%', padding: '1em', borderTop: '1px solid #e0a1a1', borderRadius: '0 0 5px 5px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'}}>
                  <p>** Obligatoriske næringsverdier kan ikke være tomme.</p>
                  <p>** Velg mat på matkategori velger.</p>
                </div>
            )}
        </div>
    );
};

export default ErrorMessageBox;
