import axios from "axios";
import API_URL from "../apiConfig";

const handleResponse = async (response: any) => {
  if (response.status >= 200 && response.status < 300) {  // HTTP status code success 200-299
    if (response.status === 204) { // Detele returns 204 No content
      return null;
    }
    return response.data; // other returns response body as JSON
  } else {
    const errorText = response.data || 'Network response was not ok';
    throw new Error(errorText);
  }
};

// Get itemlist
// Not currently used (see fetchMyProducts), but can be used to fetch all products
export const fetchProducts = async () => {
  const response = await axios.get(`${API_URL}/api/products`,
    { withCredentials: true, });
  return handleResponse(response);
};
// Get item by id
export const fetchProductById = async (productId: string) => {
  const response = await axios.get(`${API_URL}/api/products/${productId}`,
    {withCredentials: true, });
  return handleResponse(response);
};

export const fetchMyProducts = async () => {
  const response = await axios.get(`${API_URL}/api/products/my-products`,
    { withCredentials: true, });
  return handleResponse(response);
};

// Post create item
export const createProduct = async (product: any) => {
  const response = await axios.post(`${API_URL}/api/products`, 
    product,
    {withCredentials: true, }
  );    

  if (response.status === 401) {
    const error = new Error('Unauthorized') as any;
    error.status = 401;
    throw error;
  }
  /*
  if (!response.request.ok) {
    throw new Error('Network response was not ok');
  }
    */
  return handleResponse(response);
};
// Put update item
export const updateProduct = async (productId: number, product: any) => {
  const response = await axios.put(`${API_URL}/api/products/${productId}`, 
    product,
    {withCredentials: true, }
);
  return handleResponse(response);
};
// Delete item
export const deleteProduct = async (productId: number) => {
  const response = await axios.delete(`${API_URL}/api/products/${productId}`, 
    {withCredentials: true, }
  );

  if (response.status === 401) {
    const error = new Error('Unauthorized') as any;
    error.status = 401;
    throw error;
  }
  /*
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
    */
  return handleResponse(response);
};