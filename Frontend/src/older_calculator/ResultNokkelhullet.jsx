import React, { useState } from 'react';
import keyholeLogo from "../img/new_resized_image_1.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faXmarkCircle, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { kategorier } from './kravNokkelhullet';

{/* Info section for "Nøkkelhullet" */}
const InfoSection = ({ onClose }) => {
  return (
    <div style={{
      position: 'absolute',
        backgroundColor: 'white',
      border: '0.1em solid black',
      padding: '1em',
      zIndex: 100,
      width: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0 }}>
          Les mer om Nøkkelhullet på <a
            href="https://lovdata.no/dokument/SF/forskrift/2015-02-18-139"
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
};

{/* Result section for when "Nøkkelhullet" is fulfilled */}
function ResultNokkelhulletFulfilled( {category} ) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [infoNokkelhullet, setInfoNokkelhullet] = useState(false);

  const toggleExpanded = () => { setIsExpanded(!isExpanded); };
  const onClickInfo = () => { setInfoNokkelhullet(!infoNokkelhullet); };
  const onClickClose = () => { setInfoNokkelhullet(false); };
  
  const requirements = kategorier[category] || {};

  return (
    <div style={{ backgroundColor: '#daecd8', padding: '1em', position: 'relative', borderRadius: '0.5em' }}>
      <div style={{ display: 'flex', alignItems: 'center', margin: '1em' }}>
        <img 
          src={keyholeLogo}
          className="keyhole-logo"
          alt="keyhole logo"
          style={{ width:'2.5rem', height: 'auto', objectFit: 'contain', marginRight: '1em'}}
        />
        <h5 style={{ margin: 0 }}>Nøkkelhullet</h5>
        <FontAwesomeIcon
          className="info-button"
          icon={faCircleInfo}
          onClick={onClickInfo}
          style={{ marginLeft: 'auto' }}
        />
      </div>
      {infoNokkelhullet && <InfoSection onClose={onClickClose} />}
      <div style={{ display: 'flex', margin: '1em' }}>
        <p>Produktet innfrir <span style={{ textDecoration: 'underline' }}>alle</span> kravene for Nøkkelhullmerket. </p>
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
          {Object.entries(requirements).map(([key, value]) => value ? (
              <li key={key} style={{ padding: '0.4em' }}>{key}: {value}</li>
            ) : null)}
          </ul>
        </div>
      )}
    </div>
  );
}

{/* Result section for when "Nøkkelhullet" is not fulfilled */}
function ResultNokkelhulletNotFulfilled({ category, fett, mettede, hvoravSukkerarter, salt }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [infoNokkelhullet, setInfoNokkelhullet] = useState(false);

  const toggleExpanded = () => { setIsExpanded(!isExpanded); };
  const onClickInfo = () => { setInfoNokkelhullet(!infoNokkelhullet); };
  const onClickClose = () => { setInfoNokkelhullet(false); };

  const requirements = kategorier[category] || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: '2.2em', borderRadius: '0.5em' }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: '0.2em' }}>
        <img 
          src={keyholeLogo}
          className="keyhole-logo"
          alt="keyhole logo"
          style={{width:'2.5rem', height: 'auto', objectFit: 'contain', marginLeft: '-0.7em', marginTop: '1em' }}
        />
        <h5 style={{ marginTop: '1em', marginLeft: '0.7em' }}>Nøkkelhullet</h5>
        <FontAwesomeIcon
          className="info-button"
          icon={faCircleInfo}
          onClick={onClickInfo}
          style={{ marginLeft: 'auto' }}
        />
      </div>
      {infoNokkelhullet && <InfoSection onClose={onClickClose} />}
      <div style={{ display: 'flex'}}>
        <p style={{marginLeft: '40px',}}>Produktet innfrir <span style={{ textDecoration: 'underline' }}>ikke</span> kravene for Nøkkelhullmerket. </p>
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
          {Object.entries(requirements).map(([key, value]) => value ? (
              <li key={key} style={{ padding: '0.4em' }}>{key}: {value}</li>
            ) : null)}
          </ul>
        </div>
      )}
    </div>
  );
}



export { ResultNokkelhulletFulfilled, ResultNokkelhulletNotFulfilled };
