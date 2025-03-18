import React, { useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import efsaLogo from "./img/new_resized_image_2.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faXmarkCircle, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import * as ResultComponents from "./ResultComponents.jsx";
import API_URL from './apiConfig';
import './css/EfsaClaims.css';

const InfoSection = ({ onClose }) => (
  <div style={{
    position: 'absolute',
    backgroundColor: 'white',
    border: '0.1em solid black',
    padding: '1em',
    zIndex: 100,
    width: 'auto',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p style={{ margin: 0, marginRight:'10px' }}>
        Les mer om EFSA Ernæringspåstander og Helsepåstander på <a
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

// Changes from upper to lowercase for sourceOfProtein
function ResultEfsaFulfilled({ claimsToShow, lowEnergy, lowFat, fatFree, lowSaturatedFat, saturatedFatFree, lowSugars, sugarsFree, withNoAddedSugars, highFibre, sourceOfProtein, reducedFat, reducedSaturatedFat, reducedSalt }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [infoEfsa, setInfoEfsa] = useState(false);

  const toggleExpanded = () => { setIsExpanded(!isExpanded); };
  const onClickInfo = () => { setInfoEfsa(!infoEfsa); };
  const onClickClose = () => { setInfoEfsa(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: '1em' }}>
    <div style={{ display: "flex", alignItems: "center", marginBottom: '0.2em' }}>
        <img 
          src={efsaLogo}
          className="efsa-logo"
          alt="EFSA logo"
          style={{ width:'2.5rem', height: 'auto', objectFit: 'contain', marginRight: '1em', marginTop: '2em' }}
        />
        <h5 style={{ marginTop: '2em'}}>Oppfylte EFSA Påstander</h5>
        <FontAwesomeIcon
          icon={faCircleInfo}
          onClick={onClickInfo}
          style={{ marginLeft: 'auto',cursor: 'pointer', }}
        />
      </div>
      {infoEfsa && <InfoSection onClose={onClickClose} />}
      <div style={{ display: 'flex', margin: '1px' }}>
        <p style={{marginLeft: '55px'}}>Se <span style={{textDecoration: 'underline' }}>oppfylte</span> EFSA Ernæringspåstander</p>
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
            <div className='notFullfilledContent'>
            {claimsToShow.lowEnergy && <ResultComponents.ClaimLowEnergyResult lowEnergy={lowEnergy} />}
            {claimsToShow.lowFat && <ResultComponents.ClaimLowFatResult lowFat={lowFat} />}
            {claimsToShow.fatFree && <ResultComponents.ClaimFatFreeResult fatFree={fatFree} />}
            {claimsToShow.lowSaturatedFat && <ResultComponents.ClaimLowSaturatedFatResult lowSaturatedFat={lowSaturatedFat} />}
            {claimsToShow.saturatedFatFree && <ResultComponents.ClaimSaturatedFatFreeResult saturatedFatFree={saturatedFatFree} />}
            {claimsToShow.lowSugars && <ResultComponents.ClaimLowSugarsResult lowSugars={lowSugars} />}
            {claimsToShow.sugarsFree && <ResultComponents.ClaimSugarsFreeResult sugarsFree={sugarsFree} />}
            {claimsToShow.withNoAddedSugars && <ResultComponents.ClaimWithNoAddedSugarsResult withNoAddedSugars={withNoAddedSugars} />}
            {claimsToShow.highFibre && <ResultComponents.ClaimHighFibreResult highFibre={highFibre} />}
            {claimsToShow.sourceOfProtein && <ResultComponents.ClaimSourceOfProteinResult sourceOfProtein={sourceOfProtein}/>}
            {claimsToShow.reducedFat && <ResultComponents.ClaimReducedFatResult reducedFat={reducedFat}/>}
            {claimsToShow.reducedSaturatedFat && <ResultComponents.ClaimReducedSaturatedFatResult reducedSaturatedFat={reducedSaturatedFat}/>}
            {claimsToShow.reducedSalt && <ResultComponents.ClaimReducedSaltResult reducedSalt={reducedSalt}/>}
            </div>
          </ul>
        </div>
      )}
    </div>
  );
}

function ResultEfsaNotFulfilled({ claimsToShow, lowEnergy, lowFat, fatFree, lowSaturatedFat, saturatedFatFree, lowSugars, sugarsFree, withNoAddedSugars, highFibre, sourceOfProtein, reducedFat, reducedSaturatedFat, reducedSalt }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [infoEfsa, setInfoEfsa] = useState(false);
  const toggleExpanded = () => { setIsExpanded(!isExpanded); };
  const onClickInfo = () => { setInfoEfsa(!infoEfsa); };
  const onClickClose = () => { setInfoEfsa(false); };

  return (
    <div className='notFullfilledContainer' style={{ display: "flex", flexDirection: "column", width: "100%", padding: '1em' }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: '0.2em' }}>
        <img
          src={efsaLogo}
          className="efsa-logo"
          alt="EFSA logo"
          style={{width:'2.5rem', height: 'auto', objectFit: 'contain', marginRight: '1em', marginTop: '2em' }}
        />
        <h5 style={{ marginTop: '2em'}}>Ikke oppfylte EFSA Påstander</h5>

        <FontAwesomeIcon
          icon={faCircleInfo}
          onClick={onClickInfo}
          style={{ marginLeft: 'auto',cursor: 'pointer', }}
        />

      </div>
      {infoEfsa && <InfoSection onClose={onClickClose} />}
      <div style={{ display: 'flex' }} >
        <p style={{marginLeft: '55px'}}>Se <span style={{ textDecoration: 'underline' }}>ikke</span> oppfylte EFSA Ernæringspåstander</p>
        <div
          style={{ marginLeft: 'auto', cursor: 'pointer', padding: '0.5em' }}
          onClick={toggleExpanded}
        >
          <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
        </div>
      </div>
      {isExpanded && (
        <div style={{ width: '100%' }}>
          <ul>
          <div className='notFullfilledContent'>
            {claimsToShow.lowEnergy && !lowEnergy && <ResultComponents.ClaimLowEnergyResult lowEnergy={lowEnergy} />}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.lowFat && !lowFat && <ResultComponents.ClaimLowFatResult lowFat={lowFat} />}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.fatFree && !fatFree && <ResultComponents.ClaimFatFreeResult fatFree={fatFree} />}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.lowSaturatedFat && !lowSaturatedFat && <ResultComponents.ClaimLowSaturatedFatResult lowSaturatedFat={lowSaturatedFat} />}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.saturatedFatFree && !saturatedFatFree && <ResultComponents.ClaimSaturatedFatFreeResult saturatedFatFree={saturatedFatFree} />}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.lowSugars && !lowSugars && <ResultComponents.ClaimLowSugarsResult lowSugars={lowSugars} />}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.sugarsFree && !sugarsFree && <ResultComponents.ClaimSugarsFreeResult sugarsFree={sugarsFree} />}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.withNoAddedSugars && !withNoAddedSugars && <ResultComponents.ClaimWithNoAddedSugarsResult withNoAddedSugars={withNoAddedSugars} />}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.highFibre && !highFibre && <ResultComponents.ClaimHighFibreResult highFibre={highFibre} />}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.sourceOfProtein && !sourceOfProtein && <ResultComponents.ClaimSourceOfProteinResult sourceOfProtein={sourceOfProtein}/>}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.reducedFat && !reducedFat && <ResultComponents.ClaimReducedFatResult reducedFat={reducedFat}/>}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.reducedSaturatedFat && !reducedSaturatedFat && <ResultComponents.ClaimReducedSaturatedFatResult reducedSaturatedFat={reducedSaturatedFat}/>}
            </div>
            <div className='notFullfilledContent'>
            {claimsToShow.reducedSalt && !reducedSalt && <ResultComponents.ClaimReducedSaltResult reducedSalt={reducedSalt}/>}
            </div>
          </ul>
        </div>
      )}
    </div>
  );
}


function ResultEfsaHealthClaims({ vitaminClaims, mineralClaims, otherClaims, selectedVitamins, selectedMinerals, selectedOthers, meetsReqClaims, selectedMeetsReqs }) {
  //const [showVitaminClaim, setShowVitaminClaim] = useState(false);
  //const [showMineralClaim, setShowMineralClaim] = useState(false);
  const [visibleVitaminClaims, setVisibleVitaminClaims] = useState({});
  const [visibleMineralClaims, setVisibleMineralClaims] = useState({});
  const [visibleOtherClaims, setVisibleOtherClaims] = useState({});
  const [visibleMeetsReqClaims, setVisibleMeetsReqClaims] = useState({});
  // These two useEffects are neccessary to avoid uncaught Type Errors,
  // The selectedVitamins and selectedMinerals are empty arrays, 
  // so if an object that is visible is removed from the list, the visibility state will not be reset. 
  useEffect(() => {
    // Resets visibility state for vitamins
    setVisibleVitaminClaims((prevState) => {
      const newState = {};
      selectedVitamins.forEach((_, index) => {
        newState[index] = prevState[index] || false;
      });
      return newState;
    });
  }, [selectedVitamins]);

  useEffect(() => {
    // Resets visibility state for minerals
    setVisibleMineralClaims((prevState) => {
      const newState = {};
      selectedMinerals.forEach((_, index) => {
        newState[index] = prevState[index] || false;
      });
      return newState;
    });
  }, [selectedMinerals]);

  useEffect(() => {
    // Resets visibility state for other claims
    setVisibleOtherClaims((prevState) => {
      const newState = {};
      selectedOthers.forEach((_, index) => {
        newState[index] = prevState[index] || false;
      });
      return newState;
    });
  }, [selectedOthers]);

  useEffect(() => {
    // Resets visibility state for requirements
    setVisibleMeetsReqClaims((prevState) => {
      const newState = {};
      selectedMeetsReqs.forEach((_, index) => {
        newState[index] = prevState[index] || false;
      });
      return newState;
    });
  }, [selectedMeetsReqs]);

  // Toggles visibility of individual vitamin claims, sorted by index
  const toggleVitaminClaim = (index) => {
    setVisibleVitaminClaims((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // Toggles visibility of individual mineral claims, sorted by index
  const toggleMineralClaim = (index) => {
    setVisibleMineralClaims((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // Toggles visibility of individual other claims, sorted by index
  const toggleOtherClaim = (index) => {
    setVisibleOtherClaims((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // Toggles visibility of individual req claims, sorted by index
  const toggleMeetReqClaim = (index) => {
    setVisibleMeetsReqClaims((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

    // Formaterer innholdet i modalen
    const formatContent = (content) => {
      return content.split('\n').map((line, index) => {
        const label = line.split(', ')[0];
        return (
        // For hver linje etter ':' i innholdet (claim label), returnes en paragraf via HTML, 
        // *dangerouslySetInnerHTML er innerHTML i React
        <p key={index} dangerouslySetInnerHTML={{__html: `&#9642; `+label }}/>
        );
      });
    };

  

  {/* Hvis man ønsker at trekkmenyen ikke overlapper med andre objekter -> fjern styling på Container */}
  return (
    <div className="health_claims" style={{ display: "flex", flexDirection: "column" }}> {/*style={{ position: 'absolute', maxWidth: '600px'}} >*/}

    <Container className="claim-description mt-4" >
      <Row>
        <div className="accordion" id="accordionPanelsStayOpen" >
          <div className="accordion-item" style={{border: '1px solid #ccc', boxShadow: '5px 5px 10px 0 rgba(0,0,0,0.1)'}}>
            <h2 className="accordion-header" id="panelsStayOpen-headingOne">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                <img 
                  alt="EFSA Logo"
                  className="me-2"
                  style={{ width: '50px', height: '50px', float: 'right' }}
                  src={`${API_URL}/images/efsaLogo.png`}
                  />
                  &nbsp; EFSA Helsepåstander &nbsp;    
              </button>  

            </h2>

            <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingOne" >
              <div class="accordion-body" style={{ display: 'flex', flexDirection: 'column', padding: '1em', overflowY: 'auto', maxHeight: '700px'}}>
                {vitaminClaims.length > 0 && (
                  <>
                  {vitaminClaims.map((description, index) => (
                    <div key={index}>
                    <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} className={`vitamins mb-2 ${visibleVitaminClaims[index] ? 'active' : ''}`} onClick={() => toggleVitaminClaim(index)}>
                      <h6 className='mb-0'>{visibleVitaminClaims[index] ? `Gjem` : `Vis`} Påstand(er) for {selectedVitamins[index]?.label}</h6>
                      <FontAwesomeIcon icon={visibleVitaminClaims[index] ? faChevronUp : faChevronDown} className='ms-auto'/> 
                    </div>
                    <div className="vitamin-claims">
                  {visibleVitaminClaims[index] && (
                    <div>
                      <p>
                        <strong></strong>
                        {formatContent(description)}
                      </p>  
                    </div>
                  )}
                  </div>
                  </div>       
                  ))}
                  </>
                )}
                
                <br/>
                {mineralClaims.length > 0 && (
                <>
                {mineralClaims.map((description, index) => (
                  <div key={index}>
                  <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer'}} className={`minerals mb-2 ${visibleMineralClaims[index] ? 'active' : ''}`} onClick={() => toggleMineralClaim(index)}>
                    <h6 className='mb-0'>{visibleMineralClaims[index] ? 'Gjem' : 'Vis'} Påstand(er) for {selectedMinerals[index]?.label}</h6>
                    <FontAwesomeIcon icon={visibleMineralClaims[index] ? faChevronUp : faChevronDown} className='ms-auto'/>
                  </div>
                  <div className="mineral-claims">
                  {visibleMineralClaims[index] && (
                    <div>
                        <p>
                          <strong></strong>
                          {formatContent(description)}
                        </p>
                    </div>
                  )}
                  </div>
                  </div>
                ))}
                </>
                )}
                <br/>
                {otherClaims.length > 0 && (
                <>
                {otherClaims.map((description, index) => (
                  <div key={index}>
                  <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} className={`others mb-2 ${visibleOtherClaims[index] ? 'active' : ''}`} onClick={() => toggleOtherClaim(index)}>
                    <h6 className='mb-0'>{visibleOtherClaims[index] ? 'Gjem' : 'Vis'} Påstand(er) for {selectedOthers[index]?.label}</h6>
                    <FontAwesomeIcon icon={visibleOtherClaims[index] ? faChevronUp : faChevronDown} className='ms-auto'/>
                  </div>
                  <div className="other-claims">
                  {visibleOtherClaims[index] && (
                    <div>
                      <p>
                        <strong></strong>
                        {formatContent(description)}
                      </p>
                    </div>
                  )}
                  </div>
                  </div>
                ))}
                </>
                )}

                <br/>
                {meetsReqClaims.length > 0 && (
                <>
                {meetsReqClaims.map((description, index) => (
                  <div key={index}>
                  <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} className={`minerals mb-2 ${visibleMeetsReqClaims[index] ? 'active' : ''}`} onClick={() => toggleMeetReqClaim(index)}>
                    <h6 className='mb-0'>{visibleMeetsReqClaims[index] ? 'Gjem' : 'Vis'} Påstand(er) for {selectedMeetsReqs[index]?.label}</h6>
                    <FontAwesomeIcon icon={visibleMeetsReqClaims[index] ? faChevronUp : faChevronDown} className='ms-auto'/>
                  </div>
                  <div className="mineral-claims">
                  {visibleMeetsReqClaims[index] && (
                    <div>
                        <p>
                          <strong></strong>
                          {formatContent(description)}
                        </p>
                    </div>
                  )}
                  </div>
                  </div>
                ))}
                </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Row>
    </Container>
    </div>


  );
}


export { ResultEfsaFulfilled, ResultEfsaNotFulfilled, ResultEfsaHealthClaims };
