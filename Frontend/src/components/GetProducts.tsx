import React, { useState } from 'react';
import axios from 'axios';

const GetProducts: React.FC = () => {
    const [products, setProducts] = useState([]);
    const [myProducts, setMyProducts] = useState([]);


    const fetchProducts = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5047/api/products',
                 { withCredentials: true }
            );
            
            setProducts(response.data);
            
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

    const fetchMyProducts = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5047/api/products/my-products',
                 { withCredentials: true }
                );
            
            setMyProducts(response.data);
            
        } catch (error) {
            console.error('Error fetching my products:', error);
            setMyProducts([]);
        }
    };


    return (
        <div>
        <div>
            <h1>Products List</h1>
            <button onClick={fetchProducts}>Fetch</button>
            <ul>
                {products.map((product: any) => (
                    <li key={product.productId}>{product.name}</li>
                ))}
            </ul>
        </div>
        <div>
            <h1>My Products List</h1>
            <button onClick={fetchMyProducts}>Fetch</button>
            <ul>
                {myProducts.map((myProduct: any) => (
                    <li key={myProduct.productId}>{myProduct.name}</li>
                ))}
            </ul>
        </div>
        </div>
    );
};

export default GetProducts;