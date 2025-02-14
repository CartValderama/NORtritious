import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

const ClaimEnergyFreeResult = ( { energyFree } ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
     }
    if (energyFree) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                <p>
                <b>Produktet oppfyller kravet for
                    <span style={{ textDecoration: 'underline' }}>"Energifri"</span> påstanden.</b>
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
                <p style={{ paddingLeft: '20px' }}>
                   <FontAwesomeIcon icon={faCheck} style={{ color: 'green', marginRight: '5px', fontWeight: 'bold', fontSize: '1.2em' }} />
                    Dette produktet inneholder høyst 4 kcal / 17 kJ per 100 ml.
                    For bordsøtningsmidler er grensen på 0,4 kcal (1,7 kJ) per porsjon,
                    tilsvarende søtningsegenskaper til 6 g sukrose
                    (ca. 1 teskje sukrose) gjelder. 
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
                    <b>**Produktet oppfyller ikke kravet for
                    <span style={{ textDecoration: 'underline' }}>"Energifri"</span> påstanden.</b>
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
                    <li style={{ marginLeft: '5px' }}>
                    <FontAwesomeIcon icon={faTimes} style={{ color: 'red' , marginRight: '5px' , fontWeight: 'bold', fontSize: '1.2em' }} />
                    Energinivået må være høyst 4 kcal / 17 kJ per 100 ml. For bordsøtningsmidler er grensen på 0,4 kcal (1,7 kJ) per porsjon,
                    tilsvarende søtningsegenskaper til 6 g sukrose
                    (ca. 1 teskje sukrose) gjelder. 
                    </li>
                </ul>
                <br></br>
            </div>
                )}
            </div>
        );
    }
}

export default ClaimEnergyFreeResult; 
