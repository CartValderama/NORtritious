import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp ,faTimes, faCheck} from '@fortawesome/free-solid-svg-icons';

const ClaimReducedSaltResult = ( { reducedSalt } ) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpanded = () => { setIsExpanded(!isExpanded); }
    
    if (reducedSalt) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                <p>
                <b>** Produktet oppfyller kravet for
                    <span style={{ textDecoration: 'underline' }}> "Redusert innhold av salt"</span> påstanden.</b>
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
                    Innhold av salt er minst 25 % lavere enn i et lignende produkt.
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
                    <span style={{ textDecoration: 'underline' }}>"Redusert innhold av salt"</span> påstanden.</b>
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
                 <li  style={{ marginLeft: '-15px' }}>
                 <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px' , fontWeight: 'bold', fontSize: '1.2em' }} />
                 Innhold av salt må være minst 30 % lavere enn i et lignende produkt.
                 </li>
                 
                 </ul>
                <br></br>
            </div>
            )}
        </div>
        );
    }
}

export default ClaimReducedSaltResult; 