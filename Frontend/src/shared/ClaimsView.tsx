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
  /*
  // Formaterer innholdet i modalen
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
        // For hver linje i innholdet, returnes en paragraf med HTML,
        // dangerouslySetInnerHTML er innerHTML i React
      <p key={index} dangerouslySetInnerHTML={{ __html: line }} />
    ));
  };
  */

  // Formaterer innholdet i modalen
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      const label = line.split(', ')[0];
      return (
      // For hver linje etter ':' i innholdet (claim label), returnes en paragraf via HTML, 
      // *dangerouslySetInnerHTML er innerHTML i React
      <p key={index} dangerouslySetInnerHTML={{__html: label }}/>
      );
    });
  };

// Popover for ernæringspåstander
const popover = (
    <Popover id="popover-basic" style={{ width: '500px', maxHeight: '300px' }}>
      <Popover.Header as="h2">EFSA Ernæringspåstander</Popover.Header>
      <Popover.Body>
        <strong>{product.hasEfsaNutrition}</strong>
      </Popover.Body>
    </Popover>
);
    
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
            <Card.Img 
                variant="bottom" 
                className=''
                style={{ width: '50px', height: '50px'  }} 
                src={`${API_URL}/images/efsaLogo.png`} 
                alt={"EFSA Helsepåstander"} 
            />  
             &nbsp;Helsepåstander
        </Modal.Title>
            <OverlayTrigger trigger="click" placement="right" overlay={popover}>
                <Button style={{marginLeft: '30px', fontSize: '1.1rem'}} variant="primary" >Ernæringspåstander</Button>
            </OverlayTrigger>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto'}}>
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