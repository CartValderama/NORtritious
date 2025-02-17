import React from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import { Product } from '../types/product';
import { Link } from 'react-router-dom';

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
            <Card>
            <Link 
              to={`/productdetails/${product.productId}`}
              className='text-decoration-none'
            >
              <Card.Img variant="top" src={`http://localhost:5047/${product.imageUrl}`} alt={product.name} />
            </Link>
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>
                  {product.type}
                </Card.Text>
                <Card.Text>
                  {product.group} 
                </Card.Text>
                <div className="d-flex justify-content-between">
                    <Button href={`/productupdate/${product.productId}`} variant="primary"><i className="bi bi-pencil-square"></i></Button>
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