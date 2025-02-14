import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp,faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

const ClaimLowSugarsResult = ( { lowSugars } ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
     }
    if (lowSugars) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                <p>
                    <b>** Produktet oppfyller kravet for 
                        <span style={{ textDecoration: 'underline' }}> "Lavt sukkerinnhold" </span> påstanden.</b>
                </p>
                <div
                    style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}}
                    onClick={toggleExpanded}
                    >
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
            </div>
                {isExpanded && (
                <div style={{ width: '100%'}}>
                    <p>
                    <FontAwesomeIcon icon={faCheck} style={{ color: 'green', marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em' }} />
                        Dette produktet inneholder høyst 5 g sukkerarter per 100 g
                        for næringsmidler i fast form, eller høyst 2,5 g
                        sukkerarter per 100 ml for næringsmidler i flytende form.
                    </p>
                </div>
        )}
         </div>
    );
} 
    else {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                <p>
                    <b>** Produktet oppfyller ikke kravet for 
                        <span style={{ textDecoration: 'underline' }}> "Lavt sukkerinnhold" </span>påstanden.</b>
                </p>
                <div
                    style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}}
                    onClick={toggleExpanded}
                 >
                 <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
            </div>
                {isExpanded && (
                <div style={{ width: '100%' }}>
                    {/* Additional information here */}                   
                <ul>
                    <li style={{ marginLeft: '-15px' }}>
                    {/* Use the FontAwesomeIcon for "times" to represent "x" */}
                    <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px' , fontWeight: 'bold', fontSize: '1.2em' }} />
                    For faste næringsmidler, må sukkerinnholdet være høyst 5 g per 100 g.
                    </li>
                    <li style={{ marginLeft: '-15px' }}>
                    {/* Use the FontAwesomeIcon for "times" to represent "x" */}
                    <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em'  }} />
                     For flytende næringsmidler, må sukkerinnholdet være høyst 2,5 g per 100 ml.
                    </li>
                </ul>
                <br></br>
            </div>
            )}
        </div>
        );
    }
}

export default ClaimLowSugarsResult; 