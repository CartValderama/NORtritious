import React from 'react';
import { Modal, Button, Card, Popover, OverlayTrigger } from 'react-bootstrap';
import API_URL from '../apiConfig';

interface ClaimsModalProps {
  show: boolean;
  onHide: () => void;
  content: string;
  product: {
    hasEfsaNutrition: string;
  };
}

// Modalen setter bakgrunnen til en grå farge og viser innholdet (Health-claims)
const ClaimsModal: React.FC<ClaimsModalProps> = ({ show, onHide, content, product }) => {
    // Formaterer innholdet i modalen
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
        // For hver linje i innholdet, returnes en paragraf med HTML,
        // dangerouslySetInnerHTML er innerHTML i React
      <p key={index} dangerouslySetInnerHTML={{ __html: line }} />
    ));
  };

// Popover for ernæringspåstander
const popover = (
    <Popover id="popover-basic" style={{ width: '500px', maxHeight: '300px' }}>
      <Popover.Header as="h2">EFSA Ernæringspåstander</Popover.Header>
      <Popover.Body>
        <strong>{formatContent(product.hasEfsaNutrition)}</strong>
      </Popover.Body>
    </Popover>
);
    
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Helsepåstander</Modal.Title>
            <OverlayTrigger trigger="click" placement="right" overlay={popover}>
                <Button style={{marginLeft: '50px'}} variant="secondary">Ernæringspåstander</Button>
            </OverlayTrigger>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Card.Img 
            variant="bottom" 
            className='mx-auto d-block'
            style={{ width: '50px', height: '50px'  }} 
            src={`${API_URL}/images/efsaLogo.png`} 
            alt={"EFSA Helsepåstander"} 
        />  

        {formatContent(content)}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClaimsModal;