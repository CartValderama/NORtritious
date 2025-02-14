import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

const ClaimSaturatedFatFreeResult = ({ saturatedFatFree }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    }

    if (saturatedFatFree) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <p>
                        <b>** Produktet oppfyller kravet for <span style={{ textDecoration: 'underline' }}> "Uten mettet fett"</span> påstanden.</b>
                    </p>
                    <div style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}} onClick={toggleExpanded}>
                        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                    </div>
                </div>
                {isExpanded && (
                    <div style={{ width: '100%' }}>
                        <p> 
                        <FontAwesomeIcon icon={faCheck} style={{ color: 'green', marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em' }} />    
                            Dette produktet inneholder høyst 0,1 g mettet fett per 100 g eller 100 ml.</p>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <p><b>** Produktet oppfyller ikke kravet for <span style={{ textDecoration: 'underline' }}> "Uten mettet fett"</span> påstanden.</b></p>
                    <div style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}}
                     onClick={toggleExpanded}>
                        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                    </div>
                </div>
                {isExpanded && (
                    <div style={{ width: '100%' }}>
                        
                     <ul >
                    <li style={{ marginLeft: '-15px' }}> {/* Adding left margin */}
                    <FontAwesomeIcon icon={faTimes} style={{ color: 'red', marginRight: '5px' , fontWeight: 'bold', fontSize: '1.2em' }} />
                    Fettinnholdet må være høyst 0,1 g per 100g eller 100 ml.
                    </li>
                    </ul>
                    <br />
                    </div>
                )}
            </div>
        );
    }
}

export default ClaimSaturatedFatFreeResult;
