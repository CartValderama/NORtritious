import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import error from './img/error.png'; // Assuming you have an error image

const ErrorMessageBox = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showEmptyResult, setShowEmptyResult] = useState(""); // initialize state variable for showing empty result message.

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    }; 

    return (
        <div style={{ padding: '10px', margin: '-85px 0 0 ',backgroundColor: '#f3b7b7'}}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1em', paddingTop: '1em' }}>
                <img 
                    src={error}
                    className="error-logo img-fluid"
                    alt="error logo"
                    style={{ width:'2.5rem', height: '2.5rem', objectFit: 'contain', marginRight: '0.5em'}}
                />
                <h5 style={{ margin: 0}}>Feilmeldinger</h5>
            </div>

            <div style={{ display: 'flex', paddingLeft: '0.9em', paddingTop: '0.5em'}}>
                <p>Klikk for å se <span style={{ textDecoration: 'underline' }}>feilmeldinger</span></p>
                <div
                    style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '2em'}}
                    onClick={toggleExpanded}
                >
                 <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
            </div>
            {isExpanded && (
                <div style={{ width: '100%', paddingLeft: '1em' }}>
                  <p>** Obligatoriske næringsverdier kan ikke være tomme.</p>
                  <p>** Velg mat på matkategori velger.</p>
                </div>
            )}
        </div>
    );
};

export default ErrorMessageBox;
