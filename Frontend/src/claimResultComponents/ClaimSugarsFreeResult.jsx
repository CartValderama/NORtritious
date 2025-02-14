import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

const ClaimSugarsFreeResult = ({ sugarsFree }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    }  

    if (sugarsFree) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <p>
                        <b>** Produktet oppfyller kravet for<span style={{ textDecoration: 'underline' }}> "Sukkerfri" </span> påstanden.</b>
                        </p>
                    <div style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}} onClick={toggleExpanded}>
                        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                    </div>
                </div>
                {isExpanded && (
                    <div>
                        <p>
                        <FontAwesomeIcon icon={faCheck} style={{ color: 'green', marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em' }} />
                        Dette produktet inneholder ikke mer enn 0,5 g sukkerarter per 100 g eller 100 ml.
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
                    <b>** Produktet oppfyller ikke kravet for <span style={{ textDecoration: 'underline' }}> "Sukkerfri"</span> påstanden.</b>
                </p>
                    <div style={{ marginLeft: 'auto', cursor: 'pointer', marginRight: '0em'}}
                     onClick={toggleExpanded}>
                        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                    </div>
                </div>
                {isExpanded && (
                    <div style={{ width: '100%' }}>
                       
                        <ul >
                            <li style={{ marginLeft: '-15px' }}> {/* Adding left margin */}
                            < FontAwesomeIcon icon={faTimes} style={{ color: 'red', marginRight: '5px' , fontWeight: 'bold', fontSize: '1.2em' }} />
                             Produktet må inneholde høyst 0,5 g sukkerarter per 100 g eller 100 ml.
                            </li>
                        </ul>
                        <br />
                    </div>
                )}
            </div>
        );
    }
}

export default ClaimSugarsFreeResult;
