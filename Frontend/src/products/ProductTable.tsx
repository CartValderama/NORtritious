import React, { useState } from 'react';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import { Product } from '../types/product';
import { Link } from 'react-router-dom';
import '../css/ProductTable.css';
import API_URL from '../apiConfig';

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
                  <th className="align-middle text-center">Navn</th>
                  <th className="align-middle text-center">Bilde</th>
                  <th className="align-middle text-center">Gruppe</th>
                  <th className="align-middle text-center">Type</th>
                  {showNutrition && <th className="align-middle">Næringsmiddel pr. 100 g/ml</th>}
                  <th className='align-middle text-center'>Nøkkelhullet</th>
                  <th className='align-middle text-center'>EFSA Ernæringspåstander</th>
                  <th className="align-middle text-center">Behandling</th>
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
                          src={`${API_URL}/images/${product.imageUrl}`} 
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
                    <img 
                          src={product.hasNokkelhullet ? `${API_URL}/images/circle-keyhole-logo.png` : `${API_URL}/images/ban_keyhole.png`}	 
                          alt={product.hasNokkelhullet ? 'Oppfyller Nøkkelhullet' : 'Oppfyller ikke Nøkkelhullet'}
                          style={{ width: '50px', height: '50px', padding: '2px' }} 
                          className="rounded" 
                        />
                      
                    </td>

                    <td className="align-middle text-center">
                      {product.hasEfsaNutrition}
                    </td>
  
                    <td className="align-middle text-center">
                      <Link 
                        to={`/products/updateCalculator/${product.productId}`}
                        className="btn btn-outline-primary btn-sm me-2"
                      >
                        <i className="bi bi-pencil-square"></i> Rediger
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onProductDeleted(product.productId)}
                      >
                        <i className='bi bi-trash'></i> Fjern
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