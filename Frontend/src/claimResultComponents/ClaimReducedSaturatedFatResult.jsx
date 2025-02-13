import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp ,faTimes, faCheck} from '@fortawesome/free-solid-svg-icons';

const ClaimReducedSaturatedFatResult = ( { reducedSaturatedFat } ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
     }
    if (reducedSaturatedFat) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                <p>
                    <b>** Produktet oppfyller kravet for 
                        <span style={{ textDecoration: 'underline' }}> "Redusert innhold av mettet fett" </span> påstanden.</b>
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
                    Innhold av fett er minst 30 % lavere enn i et lignende produkt.
                    Summen av mettede fettsyrer og transfettsyrer i produktet som påstanden gjelder, er minst 30 % lavere enn summen av mettede fettsyrer og transfettsyrer i et lignende produkt.
                    Innholdet av transfettsyrer i produktet som påstanden gjelder, er det samme som eller lavere enn i et lignende produkt.
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
                <b>** Produktet oppfyller ikke kravet for <span style={{ textDecoration: 'underline' }} >"Redusert innhold av mettet fett"</span> påstanden.</b>
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
                        Innhold av fett er minst 30 % lavere enn i et lignende produkt.
                        </li>
                        <li style={{ marginLeft: '-15px' }}>   
                        {/* Use the FontAwesomeIcon for "times" to represent "x" */}
                        <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em'  }} />                    
                        Summen av mettede fettsyrer og transfettsyrer i produktet som påstanden gjelder, er minst 30 % lavere enn summen av mettede fettsyrer og transfettsyrer i et lignende produkt.
                        </li>
                        <li style={{ marginLeft: '-15px' }}> 
                        {/* Use the FontAwesomeIcon for "times" to represent "x" */}
                        <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px' , fontWeight: 'bold', fontSize: '1.2em' }} />
                        innholdet av transfettsyrer i produktet som påstanden gjelder, er det samme som eller lavere enn i et lignende produkt.
                        </li>
                     </ul>
                     <br></br>
                </div>
                )}
            </div>
        );
    }
}

export default ClaimReducedSaturatedFatResult; 