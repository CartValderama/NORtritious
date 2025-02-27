import React, { useState } from 'react';
import { Card, Col, Row, Button, ButtonGroup, Popover, OverlayTrigger } from 'react-bootstrap';
import { Product } from '../types/product';
import { Link } from 'react-router-dom';
import API_URL from '../apiConfig';
import ClaimsView from '../shared/ClaimsView';

interface ProductGridProps {
  products: Product[];
  apiUrl: string;
  onProductDeleted: (productId: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductDeleted }) => {
  const [showClaims, setShowClaims] = React.useState<boolean>(false);
  const [claimsContent, setClaimsContent] = React.useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleShowClaims = (content: string, product: any) => {
    setClaimsContent(content);
    setShowClaims(true);
    setSelectedProduct(product);
  };

  // Formaterer innholdet i kortet
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      // For hver linje i innholdet, returnes en paragraf via HTML, 
      // dangerouslySetInnerHTML er innerHTML i React
      <p key={index} dangerouslySetInnerHTML={{__html: line }}/>
    ));
  };

  // Popover for ernæringspåstander
  const popover = (product: any) => (
    <Popover id="popover-basic" style={{ width: '500px', maxHeight: '300px' }}>
      <Popover.Header as="h2">EFSA Ernæringspåstander</Popover.Header>
      <Popover.Body>
        <strong>{formatContent(product.hasEfsaNutrition)}</strong>
      </Popover.Body>
    </Popover>

  );

  return (
    <div>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.map(product => (
          <Col key={product.productId}>
            <Card className='h-100 d-flex flex-column' style={{boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
            <Card.Img 
                    className='d-block mb-2 align-left'
                    src={product.hasNokkelhullet ? `${API_URL}/images/circle-keyhole-logo.png` : `${API_URL}/images/ban_keyhole.png` } 
                    alt={product.hasNokkelhullet ? 'Oppfyller Nøkkelhullet' : 'Oppfyller ikke Nøkkelhullet'}
                    style={{ width: '40px', height: '40px' }}
                  />
            <Link 
              to={`/productdetails/${product.productId}`}
              className='text-decoration-none'
            >
              <Card.Img 
                variant="top" 
                className='mx-auto d-block'style={{ width: '150px', height: '150px', objectFit: 'cover'  }} 
                src={`${API_URL}/images/${product.imageUrl}`} 
                alt={product.name} 
                />
            </Link>
              <Card.Body className='d-flex flex-column'>
                <Card.Title className='align-middle text-center'>{product.name}</Card.Title>                
                 <div className=' d-flex justify-content-between'>
                  
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className='mb-2'
                    onClick={() => handleShowClaims(product.hasEfsaHealth, product)}
                  >
                    <Card.Img 
                        variant="bottom" 
                        className='mx-auto d-block'
                        style={{ width: '50px', height: '50px'  }} 
                        src={`${API_URL}/images/efsaLogo.png`} 
                        alt={product.name} 
                      />
                  </Button>
                  <OverlayTrigger trigger="click" placement="right" overlay={popover(product)}>
                    <Button 
                      variant='outline-primary'
                      size="sm"
                      className='mb-2'
                    >
                      <Card.Img
                        variant="bottom" 
                        className='mx-auto d-block'                      
                        src={product.hasEfsaNutrition ? `${API_URL}/images/efsaLogoGreen.png` : `${API_URL}/images/efsaLogoBlack.png`}
                        alt={product.hasEfsaNutrition ? 'Has EFSA Nutrition' : 'No EFSA Nutrition'}
                        style={{ width: '50px', height: '50px', cursor: 'pointer'  }}
                      />

                    </Button>
                  </OverlayTrigger>
                 </div>
                <hr></hr>
                <div className="mt-auto d-flex justify-content-between">
                  <ButtonGroup className="mb-2 me-2">
                    <Button href={`/productupdate/${product.productId}`} variant="primary">
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button onClick={() => onProductDeleted(product.productId)} variant="danger">
                      <i className="bi bi-trash"></i>
                    </Button>
                  </ButtonGroup>
                </div>                
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {selectedProduct && (
      <ClaimsView 
      show={showClaims} 
      onHide={() => setShowClaims(false)} 
      content={claimsContent}  
      product={selectedProduct}
      />
      )}
    </div>
  );
};

export default ProductGrid;