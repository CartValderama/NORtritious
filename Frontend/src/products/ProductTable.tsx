import React, { useState } from 'react';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import { Product } from '../types/product';
import { Link } from 'react-router-dom';
import '../css/ProductTable.css';

interface ProductTableProps {
  products: Product[];
  apiUrl: string;
  onProductDeleted: (productId: number) => void;
}


const ProductTable: React.FC<ProductTableProps> = ({ products, onProductDeleted }) => {
  const [showId, setShowId] = useState<boolean>(false);  
  const [showNutrition, setShowNutrition] = useState<boolean>(false);
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
        <Button 
            onClick={() => setShowId(!showId)} 
            className="btn btn-primary me-2"
            size="sm"
          >
            <i className="bi bi-list-ol"></i>
            {showId ? ' Hide' : ' Show'}
          </Button>
          <Button 
            onClick={() => setShowNutrition(!showNutrition)} 
            className="btn btn-primary"
            size="sm"
          >
            <i className="bi bi-clipboard-data"></i> 
            {showNutrition ? ' Hide' : ' Show'}
          </Button>

        </Col>
      </Row>
      <Row>
        <Col>
          <div className="table-responsive">
            <Table 
              striped 
              bordered 
              hover 
              className="shadow-sm" 
              style={{ backgroundColor: 'white' }}
            >
              <thead className="bg-light">
                <tr>
                  {showId && <th className="align-middle">ID</th>}
                  <th className="align-middle">Name</th>
                  <th className="align-middle">Image</th>
                  <th className="align-middle">Group</th>
                  <th className="align-middle">Type</th>
                  {showNutrition && <th className="align-middle">Nutrition per 100 g/ml</th>}
                  <th className="align-middle">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.productId}>
                    {showId && (
                      <td className="align-middle">{product.productId}</td>
                    )}
                    <td className="align-middle fw-bold">
                      <Link 
                        to={`/productdetails/${product.productId}`}
                        className='text-decoration-none'
                      >
                        {product.name}
                      </Link>
                    </td>

                      <td className="align-middle text-center">
                        <Link 
                          to={`/productdetails/${product.productId}`}
                          className='text-decoration-none'
                        >
                        <img 
                          src={`http://localhost:5047/images/${product.imageUrl}`} 
                          alt={product.name} 
                          className="rounded" 
                          style={{ maxWidth: '120px', height: 'auto' }} 
                        />
                        </Link>
                      </td>
                    
                    
                    <td className="align-middle small">{product.group}</td>
                    <td className="align-middle">{product.type}</td>
                    {showNutrition && <td className="align-middle small">
                    Energi: {product.calories}<br/>
                    Fett: {product.fat}<br/>
                    Mettet fett: {product.satFat}<br/>
                    Karbo: {product.carbs}<br/>
                    Nat sukker: {product.natSugar}<br/>
                    Tilsatt sukker: {product.addedSugar}<br/>
                    Fiber: {product.fiber}<br/>
                    Protein: {product.protein}<br/>
                    Salt: {product.salt}</td>
                    }
                    <td className="align-middle text-center">
                      <Link 
                        to={`/products/updateCalculator/${product.productId}`}
                        className="btn btn-outline-primary btn-sm me-2"
                      >
                        <i className="bi bi-pencil-square"></i> Update
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onProductDeleted(product.productId)}
                      >
                        <i className='bi bi-trash'></i> Delete
                      </Button>
                      </td>
                  </tr>
                ))}
              </tbody>              
            </Table>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductTable;