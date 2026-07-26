import React, { useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import efsaLogo from "../img/new_resized_image_2.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faXmarkCircle, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import ClaimResult, { CLAIMS_CONFIG } from './ClaimResult.jsx';
import API_URL from '../apiConfig';
import '../css/EfsaClaims.css';

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
      <p style={{ margin: 0, marginRight: '10px' }}>
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

// claimsToShow: object where keys are claim keys and values are booleans
// Only shows claims where claimsToShow[key] is true (all shown as met)
function ResultEfsaFulfilled({ claimsToShow }) {
  const [infoEfsa, setInfoEfsa] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '1em' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.2em' }}>
        <img
          src={efsaLogo}
          className="efsa-logo"
          alt="EFSA logo"
          style={{ width: '2.5rem', height: 'auto', objectFit: 'contain', marginRight: '1em' }}
        />
        <h5 className="mb-0">Oppfylte EFSA Påstander</h5>
        <FontAwesomeIcon
          icon={faCircleInfo}
          onClick={() => setInfoEfsa(v => !v)}
          style={{ marginLeft: 'auto', cursor: 'pointer' }}
        />
      </div>
      {infoEfsa && <InfoSection onClose={() => setInfoEfsa(false)} />}
      <div>
        <ul>
          <div className='notFullfilledContent'>
            {Object.entries(claimsToShow)
              .filter(([, v]) => v)
              .map(([key]) => {
                const cfg = CLAIMS_CONFIG[key];
                if (!cfg) return null;
                return (
                  <ClaimResult key={key} name={cfg.name} met={true} metText={cfg.metText} notMetLines={cfg.notMetLines} />
                );
              })}
          </div>
        </ul>
      </div>
    </div>
  );
}

// claimsToShow: all claims applicable to the category (by key)
// claimValues: which claims were actually met (by key)
// Shows claims in category that were NOT met
function ResultEfsaNotFulfilled({ claimsToShow, claimValues }) {
  const [infoEfsa, setInfoEfsa] = useState(false);

  return (
    <div className='notFullfilledContainer' style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '1em' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.2em' }}>
        <img
          src={efsaLogo}
          className="efsa-logo"
          alt="EFSA logo"
          style={{ width: '2.5rem', height: 'auto', objectFit: 'contain', marginRight: '1em' }}
        />
        <h5 className="mb-0">Ikke oppfylte EFSA Påstander</h5>
        <FontAwesomeIcon
          icon={faCircleInfo}
          onClick={() => setInfoEfsa(v => !v)}
          style={{ marginLeft: 'auto', cursor: 'pointer' }}
        />
      </div>
      {infoEfsa && <InfoSection onClose={() => setInfoEfsa(false)} />}
      <div style={{ width: '100%' }}>
        <ul>
          {Object.entries(claimsToShow)
            .filter(([key, inCategory]) => inCategory && !claimValues?.[key])
            .map(([key]) => {
              const cfg = CLAIMS_CONFIG[key];
              if (!cfg) return null;
              return (
                <div key={key} className='notFullfilledContent'>
                  <ClaimResult name={cfg.name} met={false} metText={cfg.metText} notMetLines={cfg.notMetLines} />
                </div>
              );
            })}
        </ul>
      </div>
    </div>
  );
}

function ResultEfsaHealthClaims({ vitaminClaims, mineralClaims, otherClaims, selectedVitamins, selectedMinerals, selectedOthers, meetsReqClaims, selectedMeetsReqs }) {
  const [visibleVitaminClaims, setVisibleVitaminClaims] = useState({});
  const [visibleMineralClaims, setVisibleMineralClaims] = useState({});
  const [visibleOtherClaims, setVisibleOtherClaims] = useState({});
  const [visibleMeetsReqClaims, setVisibleMeetsReqClaims] = useState({});

  useEffect(() => {
    setVisibleVitaminClaims((prevState) => {
      const newState = {};
      selectedVitamins.forEach((_, index) => { newState[index] = prevState[index] || false; });
      return newState;
    });
  }, [selectedVitamins]);

  useEffect(() => {
    setVisibleMineralClaims((prevState) => {
      const newState = {};
      selectedMinerals.forEach((_, index) => { newState[index] = prevState[index] || false; });
      return newState;
    });
  }, [selectedMinerals]);

  useEffect(() => {
    setVisibleOtherClaims((prevState) => {
      const newState = {};
      selectedOthers.forEach((_, index) => { newState[index] = prevState[index] || false; });
      return newState;
    });
  }, [selectedOthers]);

  useEffect(() => {
    setVisibleMeetsReqClaims((prevState) => {
      const newState = {};
      selectedMeetsReqs.forEach((_, index) => { newState[index] = prevState[index] || false; });
      return newState;
    });
  }, [selectedMeetsReqs]);

  const toggleVitaminClaim  = (i) => setVisibleVitaminClaims(p => ({ ...p, [i]: !p[i] }));
  const toggleMineralClaim  = (i) => setVisibleMineralClaims(p => ({ ...p, [i]: !p[i] }));
  const toggleOtherClaim    = (i) => setVisibleOtherClaims(p => ({ ...p, [i]: !p[i] }));
  const toggleMeetReqClaim  = (i) => setVisibleMeetsReqClaims(p => ({ ...p, [i]: !p[i] }));

  const formatContent = (content) =>
    content.split('\n').map((line, index) => (
      <p key={index} dangerouslySetInnerHTML={{ __html: `&#9642; ` + line.split(', ')[0] }} />
    ));

  const ClaimGroup = ({ claims, selected, visible, toggle, className }) =>
    claims.length > 0 ? (
      <>
        {claims.map((description, index) => (
          <div key={index}>
            <div
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              className={`${className} mb-2 ${visible[index] ? 'active' : ''}`}
              onClick={() => toggle(index)}
            >
              <h6 className='mb-0'>{visible[index] ? 'Gjem' : 'Vis'} Påstand(er) for {selected[index]?.label}</h6>
              <FontAwesomeIcon icon={visible[index] ? faChevronUp : faChevronDown} className='ms-auto' />
            </div>
            {visible[index] && (
              <div>
                <p><strong></strong>{formatContent(description)}</p>
              </div>
            )}
          </div>
        ))}
        <br />
      </>
    ) : null;

  return (
    <div className="health_claims" style={{ display: 'flex', flexDirection: 'column' }}>
      <Container fluid className="claim-description mt-4">
        <Row>
          <div className="accordion" id="accordionPanelsStayOpen">
            <div className="accordion-item" style={{ border: '1px solid #ccc', boxShadow: '5px 5px 10px 0 rgba(0,0,0,0.1)' }}>
              <h2 className="accordion-header" id="panelsStayOpen-headingOne">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#panelsStayOpen-collapseOne"
                  aria-expanded="true"
                  aria-controls="panelsStayOpen-collapseOne"
                >
                  <img
                    alt="EFSA Logo"
                    className="me-2"
                    style={{ width: '50px', height: '50px', float: 'right' }}
                    src={`${API_URL}/images/efsaLogo.png`}
                  />
                  &nbsp; EFSA Helsepåstander &nbsp;
                </button>
              </h2>
              <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingOne">
                <div className="accordion-body" style={{ display: 'flex', flexDirection: 'column', padding: '1em', overflowY: 'auto', maxHeight: '700px' }}>
                  <ClaimGroup claims={vitaminClaims}   selected={selectedVitamins}  visible={visibleVitaminClaims}  toggle={toggleVitaminClaim}  className="vitamins" />
                  <ClaimGroup claims={mineralClaims}   selected={selectedMinerals}  visible={visibleMineralClaims}  toggle={toggleMineralClaim}  className="minerals" />
                  <ClaimGroup claims={otherClaims}     selected={selectedOthers}    visible={visibleOtherClaims}    toggle={toggleOtherClaim}    className="others" />
                  <ClaimGroup claims={meetsReqClaims}  selected={selectedMeetsReqs} visible={visibleMeetsReqClaims} toggle={toggleMeetReqClaim}  className="minerals" />
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
