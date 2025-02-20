// ProductButtons.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faShare } from '@fortawesome/free-solid-svg-icons';


interface ProductButtonsProps {
  showSubmitButton: boolean;
  onSubmit: () => void;
}

const ProductButtons: React.FC<ProductButtonsProps> = ({ showSubmitButton, onSubmit }) => {
  return (
    <>
      <div className="button-container d-flex align-items-center flex-wrap justify-content-start">
        <div className="button-wrapper me-2 mb-2">
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle custom-button" type="button" id="lagreProduktDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <FontAwesomeIcon icon={faSave} className="icon-right-spacing me-2" />
              Lagre produkt
            </button>
            <ul className="dropdown-menu" aria-labelledby="lagreProduktDropdown">
              <li className="d-flex align-items-center justify-content-center flex-column">
                <button className="dropdown-item" disabled aria-describedby="pdfDesc">
                  Lagre som PDF
                </button>
                <span id="pdfDesc" className="text-muted small">
                  (Under utvikling)
                </span>
              </li>
              <li className="d-flex align-items-center justify-content-center flex-column">
                <button className="dropdown-item" disabled aria-describedby="bildeDesc">
                  Lagre som bilde
                </button>
                <span id="bildeDesc" className="text-muted small">
                  (Under utvikling)
                </span>
              </li>
              <li className="d-flex align-items-center justify-content-center flex-column">
                <button className="dropdown-item" disabled aria-describedby="nettskyDesc">
                  Lagre i nettsky
                </button>
                <span id="nettskyDesc" className="text-muted small">
                  (Under utvikling)
                </span>
              </li>
              
              <li className="d-flex align-items-center justify-content-center flex-column">
                <button className="dropdown-item" disabled aria-describedby="profilenDesc">
                <FontAwesomeIcon icon={faSave} className="icon-right-spacing me-2" />
                  Lagre i profilen
                </button>
                <span id="profilenDesc" className="text-muted small">
                  {showSubmitButton && (
              <li className="d-flex align-items-center justify-content-center flex-column">
                <button className="btn btn-primary btn-sm" onClick={onSubmit}>
                  Lagre produkt
                </button>
              </li>
            )}
                </span>
              </li>              
            </ul>
          </div>
        </div>
        
        <div className="button-wrapper me-2 mb-2">
        <div className="dropdown">
          <button className="btn btn-primary dropdown-toggle custom-button" type="button" id="delProduktDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <FontAwesomeIcon icon={faShare} className="icon-right-spacing me-2" />
            Del produkt
          </button>
          <ul className="dropdown-menu" aria-labelledby="delProduktDropdown">
            <li className="d-flex align-items-center justify-content-center flex-column">
              <button className="dropdown-item" disabled aria-describedby="epost-description">
                Send på e-post
              </button>
              <span id="epost-description" className="text-muted small">
                (Under utvikling)
              </span>
            </li>
            <li className="d-flex align-items-center justify-content-center flex-column">
              <button className="dropdown-item" disabled aria-describedby="samarbeidsplattformer-description">
                Del på samarbeidsplattformer
              </button>
              <span id="samarbeidsplattformer-description" className="text-muted small">
                (Under utvikling)
              </span>
            </li>
            <li className="d-flex align-items-center justify-content-center flex-column">
              <button className="dropdown-item" disabled aria-describedby="lenke-description">
                Kopier lenke
              </button>
              <span id="lenke-description" className="text-muted small">
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
