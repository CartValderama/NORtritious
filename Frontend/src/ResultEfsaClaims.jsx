import React, { useState } from 'react';
import efsaLogo from "./img/new_resized_image_2.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faXmarkCircle, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import * as ResultComponents from "./ResultComponents.jsx";

const InfoSection = ({ onClose }) => (
  <div style={{
    position: 'absolute',
    top: '70%',
    left: '50%',
    backgroundColor: 'white',
    border: '0.1em solid black',
    padding: '1em',
    zIndex: 100,
    width: 'auto'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p style={{ margin: 0, marginRight:'10px' }}>
        Les mer om EFSA ernæringspåstander på <a
          href="https://lovdata.no/dokument/SF/forskrift/2010-02-17-187/KAPITTEL_1#KAPITTEL_1"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline' }}>lovdata.no</a>.
      </p>
      <FontAwesomeIcon
        icon={faXmarkCircle}
        onClick={onClose}
        style={{ cursor: 'pointer', marginLeft: '1em' }} 
      />
    </div>
  </div>
);

function ResultEfsaFulfilled({ claimsToShow, lowEnergy, lowFat, fatFree, lowSaturatedFat, saturatedFatFree, lowSugars, sugarsFree, withNoAddedSugars, highFibre, SourceOfProtein, reducedFat, reducedSaturatedFat, reducedSalt }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [infoEfsa, setInfoEfsa] = useState(false);

  const toggleExpanded = () => { setIsExpanded(!isExpanded); };
  const onClickInfo = () => { setInfoEfsa(!infoEfsa); };
  const onClickClose = () => { setInfoEfsa(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column"}}>
    <div style={{ display: "flex", alignItems: "center", marginBottom: '0.2em' }}>
        <img 
          src={efsaLogo}
          className="efsa-logo img-fluid"
          alt="EFSA logo"
          style={{ width:'2.5rem', height: 'auto', objectFit: 'contain', marginRight: '1em', marginTop: '2em' }}
        />
        <h5 style={{ marginTop: '2em'}}>Oppfylte EFSA Påstander</h5>
        <FontAwesomeIcon
          icon={faCircleInfo}
          onClick={onClickInfo}
          style={{ marginLeft: 'auto' }}
        />
      </div>
      {infoEfsa && <InfoSection onClose={onClickClose} />}
      <div style={{ display: 'flex', margin: '1px' }}>
        <p style={{marginLeft: '55px'}}>Se <span style={{textDecoration: 'underline' }}>oppfylte</span> EFSA påstander</p>
        <div
          style={{ marginLeft: 'auto', cursor: 'pointer' }}
          onClick={toggleExpanded}
        >
          <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
        </div>
      </div>
      {isExpanded && (
        <div>
          <ul>
            {claimsToShow.lowEnergy && <ResultComponents.ClaimLowEnergyResult lowEnergy={lowEnergy} />}
            {claimsToShow.lowFat && <ResultComponents.ClaimLowFatResult lowFat={lowFat} />}
            {claimsToShow.fatFree && <ResultComponents.ClaimFatFreeResult fatFree={fatFree} />}
            {claimsToShow.lowSaturatedFat && <ResultComponents.ClaimLowSaturatedFatResult lowSaturatedFat={lowSaturatedFat} />}
            {claimsToShow.saturatedFatFree && <ResultComponents.ClaimSaturatedFatFreeResult saturatedFatFree={saturatedFatFree} />}
            {claimsToShow.lowSugars && <ResultComponents.ClaimLowSugarsResult lowSugars={lowSugars} />}
            {claimsToShow.sugarsFree && <ResultComponents.ClaimSugarsFreeResult sugarsFree={sugarsFree} />}
            {claimsToShow.withNoAddedSugars && <ResultComponents.ClaimWithNoAddedSugarsResult withNoAddedSugars={withNoAddedSugars} />}
            {claimsToShow.highFibre && <ResultComponents.ClaimHighFibreResult highFibre={highFibre} />}
            {claimsToShow.SourceOfProtein && <ResultComponents.ClaimSourceOfProteinResult SourceOfProtein={SourceOfProtein}/>}
            {claimsToShow.reducedFat && <ResultComponents.ClaimReducedFatResult reducedFat={reducedFat}/>}
            {claimsToShow.reducedSaturatedFat && <ResultComponents.ClaimReducedSaturatedFatResult reducedSaturatedFat={reducedSaturatedFat}/>}
            {claimsToShow.reducedSalt && <ResultComponents.ClaimReducedSaltResult reducedSalt={reducedSalt}/>}
          </ul>
        </div>
      )}
    </div>
  );
}

function ResultEfsaNotFulfilled({ claimsToShow, lowEnergy, lowFat, fatFree, lowSaturatedFat, saturatedFatFree, lowSugars, sugarsFree, withNoAddedSugars, highFibre, SourceOfProtein, reducedFat, reducedSaturatedFat, reducedSalt }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [infoEfsa, setInfoEfsa] = useState(false);
  const toggleExpanded = () => { setIsExpanded(!isExpanded); };
  const onClickInfo = () => { setInfoEfsa(!infoEfsa); };
  const onClickClose = () => { setInfoEfsa(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: '0.2em' }}>
        <img
          src={efsaLogo}
          className="efsa-logo img-fluid"
          alt="EFSA logo"
          style={{width:'2.5rem', height: 'auto', objectFit: 'contain', marginRight: '1em', marginTop: '2em' }}
        />
        <h5 style={{ marginTop: '2em'}}>Ikke oppfylte EFSA Påstander</h5>

        <FontAwesomeIcon
          icon={faCircleInfo}
          onClick={onClickInfo}
          style={{ marginLeft: 'auto' }}
        />

      </div>
      {infoEfsa && <InfoSection onClose={onClickClose} />}
      <div style={{ display: 'flex' }}>
        <p style={{marginLeft: '55px'}}>Se <span style={{ textDecoration: 'underline' }}>ikke</span> oppfylte EFSA påstander</p>
        <div
          style={{ marginLeft: 'auto', cursor: 'pointer'}}
          onClick={toggleExpanded}
        >
          <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
        </div>
      </div>
      {isExpanded && (
        <div style={{ width: '100%' }}>
          <ul>
            {claimsToShow.lowEnergy && !lowEnergy && <ResultComponents.ClaimLowEnergyResult lowEnergy={lowEnergy} />}
            {claimsToShow.lowFat && !lowFat && <ResultComponents.ClaimLowFatResult lowFat={lowFat} />}
            {claimsToShow.fatFree && !fatFree && <ResultComponents.ClaimFatFreeResult fatFree={fatFree} />}
            {claimsToShow.lowSaturatedFat && !lowSaturatedFat && <ResultComponents.ClaimLowSaturatedFatResult lowSaturatedFat={lowSaturatedFat} />}
            {claimsToShow.saturatedFatFree && !saturatedFatFree && <ResultComponents.ClaimSaturatedFatFreeResult saturatedFatFree={saturatedFatFree} />}
            {claimsToShow.lowSugars && !lowSugars && <ResultComponents.ClaimLowSugarsResult lowSugars={lowSugars} />}
            {claimsToShow.sugarsFree && !sugarsFree && <ResultComponents.ClaimSugarsFreeResult sugarsFree={sugarsFree} />}
            {claimsToShow.withNoAddedSugars && !withNoAddedSugars && <ResultComponents.ClaimWithNoAddedSugarsResult withNoAddedSugars={withNoAddedSugars} />}
            {claimsToShow.highFibre && !highFibre && <ResultComponents.ClaimHighFibreResult highFibre={highFibre} />}
            {claimsToShow.SourceOfProtein && !SourceOfProtein && <ResultComponents.ClaimSourceOfProteinResult SourceOfProtein={SourceOfProtein}/>}
            {claimsToShow.reducedFat && !reducedFat && <ResultComponents.ClaimReducedFatResult reducedFat={reducedFat}/>}
            {claimsToShow.reducedSaturatedFat && !reducedSaturatedFat && <ResultComponents.ClaimReducedSaturatedFatResult reducedSaturatedFat={reducedSaturatedFat}/>}
            {claimsToShow.reducedSalt && !reducedSalt && <ResultComponents.ClaimReducedSaltResult reducedSalt={reducedSalt}/>}
          </ul>
        </div>
      )}
    </div>
  );
}

export { ResultEfsaFulfilled, ResultEfsaNotFulfilled };
