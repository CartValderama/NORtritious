// ProductButtons.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faShare, faPlus } from '@fortawesome/free-solid-svg-icons';

function ProductButtons() {
  return (
    <>
      <div className="button-container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        <div className="button-wrapper"
          style={{ marginRight: '0.25em' }}
        >
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle custom-button" type="button" id="lagreProduktDropdown" data-bs-toggle="dropdown">
              <FontAwesomeIcon icon={faSave} className="icon-right-spacing" style={{ marginRight: '0.75em' }} />
              Lagre produkt
            </button>
            <ul className="dropdown-menu" aria-labelledby="lagreProduktDropdown">
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <button className="dropdown-item" disabled aria-describedby="pdfDesc">
                  Lagre som PDF
                </button>
                <span id="pdfDesc" style={{ fontSize: "smaller", color: "gray" }}>
                  (Under utvikling)
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <button className="dropdown-item" disabled aria-describedby="bildeDesc">
                  Lagre som bilde
                </button>
                <span id="bildeDesc" style={{ fontSize: "smaller", color: "gray" }}>
                  (Under utvikling)
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <button className="dropdown-item" disabled aria-describedby="nettskyDesc">
                  Lagre i nettsky
                </button>
                <span id="nettskyDesc" style={{ fontSize: "smaller", color: "gray" }}>
                  (Under utvikling)
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <button className="dropdown-item" disabled aria-describedby="profilenDesc">
                  Lagre i profilen
                </button>
                <span id="profilenDesc" style={{ fontSize: "smaller", color: "gray" }}>
                  (Under utvikling)
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="button-wrapper" style={{ margin: '0.25em' }}>
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle custom-button" type="button" id="delProduktDropdown" data-bs-toggle="dropdown">
              <FontAwesomeIcon icon={faShare} className="icon-right-spacing" style={{ marginRight: '0.75em' }} />
              Del produkt
            </button>
            <ul className="dropdown-menu" aria-labelledby="delProduktDropdown">
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <button className="dropdown-item" disabled aria-describedby="epost-description">
                  Send på e-post
                </button>
                <span id="epost-description" style={{ fontSize: "smaller", color: "gray" }}>
                  (Under utvikling)
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <button className="dropdown-item" disabled aria-describedby="samarbeidsplattformer-description">
                  Del på samarbeidsplattformer
                </button>
                <span id="samarbeidsplattformer-description" style={{ fontSize: "smaller", color: "gray" }}>
                  (Under utvikling)
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <button className="dropdown-item" disabled aria-describedby="lenke-description">
                  Kopier lenke
                </button>
                <span id="lenke-description" style={{ fontSize: "smaller", color: "gray" }}>
                  (Under utvikling)
                </span>
              </li>
            </ul>
          </div>
        </div>
        
      </div>
    </>
  );
}

export default ProductButtons;
