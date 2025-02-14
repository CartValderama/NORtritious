import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp ,faTimes, faCheck} from '@fortawesome/free-solid-svg-icons';

const ClaimLowSaturatedFatResult = ( { lowSaturatedFat } ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
     }
    if (lowSaturatedFat) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                <p>
                    <b>** Produktet oppfyller kravet for 
                        <span style={{ textDecoration: 'underline' }}> "Lavt innhold mettet fett" </span> påstanden.</b>
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
                    <p>
                    <FontAwesomeIcon icon={faCheck} style={{ color: 'green', marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em' }} />
                        Dette produktet inneholder høyst 1,5 g mettet fett per 100 g
                        for næringsmidler i fast form, eller høyst 0,75 g
                        mettet fett per 100 ml for næringsmidler i flytende form.
                        I tillegg utgjør ikke summen av mettet- og transfett mer enn 10% av energien. 
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
                <b>** Produktet oppfyller ikke kravet for <span style={{ textDecoration: 'underline' }} >"Lavt innhold mettet fett"</span> påstanden.</b>
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
                        
                    <ul>
                        <li style={{ marginLeft: '-15px' }} >
                        {/* Use the FontAwesomeIcon for "times" to represent "x" */}
                        <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em'  }} />
                         For faste næringsmidler, må mettet fettinnhold være høyst 1,5 g per 100 g.
                        </li>
                        <li style={{ marginLeft: '-15px' }}>   
                        {/* Use the FontAwesomeIcon for "times" to represent "x" */}
                        <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em'  }} />                    
                         For flytende næringsmidler, må mettet fettinnhold være
                         høyst 0,75 g per 100 ml.
                        </li>
                        <li style={{ marginLeft: '-15px' }}> 
                        {/* Use the FontAwesomeIcon for "times" to represent "x" */}
                        <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px' , fontWeight: 'bold', fontSize: '1.2em' }} />
                        I tillegg kan ikke summen av mettet- og transfett utgjøre mer enn 10% av energien.
                        </li>
                     </ul>
                     <br></br>
                </div>
                )}
            </div>
        );
    }
}

export default ClaimLowSaturatedFatResult; 