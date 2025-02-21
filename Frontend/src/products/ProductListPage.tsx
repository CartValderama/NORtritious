import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import ProductTable from './ProductTable';
import ProductGrid from './ProductGrid';
import { Product } from '../types/product';
import API_URL from '../apiConfig';
import * as ProductService from './ProductService';
import '../css/ProductTable.css';
//import ErrorPopup from '../shared/ErrorPopup';


const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // State for storing products with Product type
  const [loading, setLoading] = useState<boolean>(false); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for storing error messages
  const [showTable, setShowTable] = useState<boolean>(true); // State to toggle between table and grid view
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query
  //const [showUnauthorizedError, setShowUnauthorizedError] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState<number>(5); // State for the number of visible products

  const toggleTableOrGrid = () => setShowTable(prevShowTable => !prevShowTable);

  const fetchProducts = async () => {
    setLoading(true); // Set loading to true when starting the fetch
    setError(null);   // Clear any previous errors

    try {
      const data = await ProductService.fetchProducts();
      setProducts(data);
      console.log(data);
    } catch (error) {
      console.error(`There was a problem with the fetch operation: ${error}`);
      setError('Failed to fetch products. Are you logged in?');
    } finally {
      setLoading(false); // Set loading to false once the fetch is complete
    }
  };

  // Set the view mode to local storage when the product is fetched
  useEffect(() => {
    const savedViewMode = localStorage.getItem('productViewMode');
    console.log('[fetch products] Saved view mode:', savedViewMode); // Debugging line
    if (savedViewMode) {
      if (savedViewMode === 'grid')
        setShowTable(false)
      console.log('show table', showTable);
    }
    fetchProducts();
  }, []);

  const loadMoreProducts = () => {
    setVisibleProducts(prevVisibleProducts => prevVisibleProducts + 5);
  };

  const showLessProducts = () => {
    setVisibleProducts(prevVisibleProducts => Math.max(prevVisibleProducts - 5, 5));
  };
  

  // Save the view mode to local storage whenever it changes
  useEffect(() => {
    console.log('[save view state] Saving view mode:', showTable ? 'table' : 'grid');
    localStorage.setItem('productViewMode', showTable ? 'table' : 'grid');
  }, [showTable]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductDeleted = async (productId: number) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the product ${productId}?`);
    if (confirmDelete) {
      try {
        await ProductService.deleteProduct(productId);
        setProducts(prevProducts => prevProducts.filter(product => product.productId !== productId));
        console.log('Product deleted:', productId);
      } catch (error: any) {
        //setShowUnauthorizedError(true);
        console.error('Error deleting product:', error);
        if (error.response.status === 404) {
            setError('Product not found.');
        } else if (error.response.status === 401) {
            setError('You are not authorized to delete this product.');
        } else {
        setError('Failed to delete product.');
        }
      }
    }
  };

  return (
    <div>
      <h1>Products</h1>
      <Button onClick={fetchProducts} className="btn btn-primary mb-3 me-2" disabled={loading}>
        <i className="bi bi-arrow-clockwise"></i> 
        {loading ? ' Loading...' : ' Refresh'}
      </Button>
      <Button onClick={toggleTableOrGrid} className="btn btn-primary mb-3 me-2">
        {showTable ? <i className="bi bi-grid"></i> : <i className="bi bi-list-ul"></i>}
      </Button>
      <Button href='/products/calculator' className="btn btn-secondary mb-3 me-2" style={{ backgroundColor: 'darkblue'}}>
      <i className="bi bi-pencil-square"></i> New Product
      </Button>
      <Form.Group className="mb-3">
        <InputGroup>
        <InputGroup.Text>
          <i className="bi bi-search"></i>
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder='Search by name or type'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        
        </InputGroup>
      </Form.Group>

      <div>
      {loading && <Spinner animation="border" />}
      {error && <div className="alert alert-danger">{error}</div>}
      {showTable ? (
        <ProductTable products={filteredProducts.slice(0, visibleProducts)}
        apiUrl={`${API_URL}`} onProductDeleted={handleProductDeleted} />
      ) : (
        <ProductGrid products={filteredProducts.slice(0, visibleProducts)} apiUrl={`${API_URL}`} onProductDeleted={handleProductDeleted} />
      )}
      <div className='d-flex justify-content-between mt-3'>
      {visibleProducts < filteredProducts.length && (
        <Button onClick={loadMoreProducts}>
          Load More
        </Button>
      )}
      {visibleProducts > 5 && (
          <Button onClick={showLessProducts}>
            Show Less
          </Button>
        )}
      </div>
      
     </div>
    {/*
    *  {error && <p style={{ color: 'red' }}>{error}</p>}
    * {showTable
    *    ? <ProductTable products={filteredProducts} apiUrl={`http://localhost:5047`} onProductDeleted={handleProductDeleted} />
    *    : <ProductGrid products={filteredProducts} apiUrl={`http://localhost:5047`} onProductDeleted={handleProductDeleted} />
    *    }
      */}
        {/*{showUnauthorizedError}*/}


    </div>
  );
};

export default ProductListPage;