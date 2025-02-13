import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

const ClaimWithNoAddedSugarsResult = ({ withNoAddedSugars }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    }

    if (withNoAddedSugars) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <p>
                        <b>** Produktet oppfyller kravet for <span style={{ textDecoration: 'underline' }} >"Uten tilsatt sukker" </span>påstanden.</b>
                    </p>
                    <div style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}} onClick={toggleExpanded}>
                        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                    </div>
                </div>
                {isExpanded && (
                    <div style={{ width: '100%' }}>
                        <p>
                        <FontAwesomeIcon icon={faCheck} style={{ color: 'green', marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em' }} />
                            Dette produktet er ikke tilsatt monosakkarider,
                            disakkarider eller andre næringsmidler på grunn av deres
                            søtende egenskaper.
                        </p>
                        <p>
                            Dersom produktet har et naturlig innhold av sukker bør det også merkes med: "Med et naturlig innhold av sukker" 
                        </p>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                <p>
                <b>** Produktet oppfyller ikke kravet for <span style={{ textDecoration: 'underline' }}> "Uten tilsatt sukker" påstanden.</span></b>
                </p>
                    <div style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}}
                     onClick={toggleExpanded}>
                        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                    </div>
                </div>
                {isExpanded && (
                    <div style={{ width: '100%' }}>
                        
                        <ul>
                            <li style={{ marginLeft: '-15px' }}> {/* Adding left margin */}
                            <FontAwesomeIcon icon={faTimes} style={{ color: 'red', marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em'  }} />   
                             Produktet må ikke være tilsatt monosakkarider, disakkarider eller andre næringsmidler på grunn av deres søtende egenskaper.
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        );
    }
}

export default ClaimWithNoAddedSugarsResult;
