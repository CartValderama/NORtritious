import React from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import { Product } from '../types/product';
import { Link } from 'react-router-dom';
import API_URL from '../apiConfig';

interface ProductGridProps {
  products: Product[];
  apiUrl: string;
  onProductDeleted: (productId: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductDeleted }) => {

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
                <Card.Text>
                  {product.type}
                </Card.Text>
                <Card.Img 
                  className='mx-auto d-block'
                  src={product.hasNokkelhullet ? `${API_URL}/images/circle-keyhole-logo.png` : `${API_URL}/images/ban_keyhole.png` } 
                  alt={product.hasNokkelhullet ? 'Oppfyller Nøkkelhullet' : 'Oppfyller ikke Nøkkelhullet'}
                  style={{ width: '50px', height: '50px', padding: '2px' }}
                />
                
                <div className="mt-auto d-flex justify-content-between">
                    <Button href={`/productupdate/${product.productId}`} variant="primary" ><i className="bi bi-pencil-square"></i></Button>
                    <Button onClick={() => onProductDeleted(product.productId)} variant="danger"><i className='bi bi-trash'></i></Button>                    
                </div>                
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductGrid;