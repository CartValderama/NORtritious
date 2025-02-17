import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GetProducts: React.FC = () => {
  const [products, setProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setMessage(null);
    try {
      const response = await axios.get("http://localhost:5047/api/products", {
        withCredentials: true,
      });
      setProducts(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          console.error("This is forbidden content:", error.response);
          setMessage("User not authorized to view this content");
          setProducts([]);
        } else if (error.response.status === 401) {
          console.error("User not authorized:", error.response);
          setProducts([]);
          navigate("/account/login"); // Redirect to login page
        } else {
          console.error("Error fetching products:", error.response);
          setProducts([]);
        }
      } else {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    }
  };

  const fetchMyProducts = async () => {
    setMessage(null);
    try {
      const response = await axios.get(
        "http://localhost:5047/api/products/my-products",
        { withCredentials: true }
      );
      setMyProducts(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          console.error("User not authorized:", error.response);
          setMyProducts([]);
          navigate("/account/login"); // Redirect to login page
        } else if (error.response.status === 403) {
          console.error("This is forbidden content:", error.response);
          setMessage("User not authorized to view this content");
          setMyProducts([]);
        } else {
          console.error("Error fetching my products:", error.response);
          setMyProducts([]);
        }
      } else {
        console.error("Error fetching my products:", error);
        setMyProducts([]);
      }
    }
  };

  return (
    <div>
      <div>
        <h1>Products List</h1>
        <button className="btn btn-primary" onClick={fetchProducts}>
          Fetch
        </button>
        <ul>
          {products.map((product: any) => (
            <li key={product.productId}>
              Id: {product.productId} --- Name: {product.name}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h1>My Products List</h1>
        <button className="btn btn-primary" onClick={fetchMyProducts}>
          Fetch
        </button>
        <ul>
          {myProducts.map((myProduct: any) => (
            <li key={myProduct.productId}>{myProduct.name}</li>
          ))}
        </ul>
      </div>

      {message && <p className="text-green-500 mt-4">{message}</p>}
    </div>
  );
};

export default GetProducts;
