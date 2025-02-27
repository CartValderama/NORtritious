import React, { useState } from 'react';
import { Card, Button, Collapse } from 'react-bootstrap';
import API_URL from '../apiConfig';

interface CollapsibleCardProps {
  productId: number;
  content: string;
}

const CollapseCard: React.FC<CollapsibleCardProps> = ({ productId, content }) => {
  const [open, setOpen] = useState<boolean>(false);

  const toggleCollapse = () => {
    setOpen(!open);
  };

  // Formaterer innholdet i kortet
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      // For hver linje i innholdet, returnes en paragraf via HTML, 
      // dangerouslySetInnerHTML er innerHTML i React
      <p key={index} dangerouslySetInnerHTML={{__html: line }}/>
    ));
  };

  return (
    <>
      <Button
        onClick={toggleCollapse}
        aria-controls={`collapse-${productId}`}
        aria-expanded={open}
        variant="outline-primary"
        size="sm"
      >
        {open ? 'Gjem Helsepåstander' : <Card.Img 
                variant="bottom" 
                className='mx-auto d-block'
                style={{ width: '50px', height: '50px'  }} 
                src={`${API_URL}/images/efsaLogo.png`} 
                alt={"EFSA Helsepåstander"} 
              />}
      </Button>
      <Collapse in={open}>
        <div id={`collapse-${productId}`}>
          <Card className="mt-2">
          <Card.Header>
            <Card.Img 
                variant="bottom" 
                className=''
                style={{ width: '30px', height: '30px'  }} 
                src={`${API_URL}/images/efsaLogo.png`} 
                alt={"EFSA Helsepåstander"} 
              />
              &nbsp;<strong>Helsepåstander</strong>
            </Card.Header>
            <Card.Body style={{ maxHeight: '200px', overflowY: 'auto' }}>
              

              {formatContent(content)}
            </Card.Body>
          </Card>
        </div>
      </Collapse>
    </>
  );
};

export default CollapseCard;