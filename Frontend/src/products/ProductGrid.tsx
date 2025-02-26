import React, { useState } from 'react';
import { Card, Col, Row, Button, ButtonGroup } from 'react-bootstrap';
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

  return (
    <div>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.map(product => (
          <Col key={product.productId}>
            <Card className='h-100 d-flex flex-column'>
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

                  <Card.Img 
                    className='mx-auto d-block mb-2'
                    src={product.hasNokkelhullet ? `${API_URL}/images/circle-keyhole-logo.png` : `${API_URL}/images/ban_keyhole.png` } 
                    alt={product.hasNokkelhullet ? 'Oppfyller Nøkkelhullet' : 'Oppfyller ikke Nøkkelhullet'}
                    style={{ width: '50px', height: '50px', padding: '2px' }}
                  />
                  <br/>
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
                 </div>
                
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