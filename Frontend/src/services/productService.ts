import axios from "axios";
import API_URL from "../apiConfig";

const handleResponse = async (response: any) => {
  if (response.status >= 200 && response.status < 300) {
    // HTTP status code success 200-299
    if (response.status === 204) {
      // Detele returns 204 No content
      return null;
    }
    return response.data; // other returns response body as JSON
  } else {
    const errorText = response.data || "Network response was not ok";
    throw new Error(errorText);
  }
};

// Get itemlist
// Not currently used (see fetchMyProducts), but can be used to fetch all products
export const fetchProducts = async () => {
  const response = await axios.get(`${API_URL}/api/products`, {
    withCredentials: true,
  });
  return handleResponse(response);
};
// Get item by id
export const fetchProductById = async (productId: string) => {
  const response = await axios.get(`${API_URL}/api/products/${productId}`, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
  }
  });
  return handleResponse(response);
};

export const fetchMyProducts = async () => {
  const response = await axios.get(`${API_URL}/api/products/my-products`, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
  },
  });
  return handleResponse(response);
};

// Post create item
export const createProduct = async (product: any) => {
  const response = await axios.post(`${API_URL}/api/products`, product, {
    withCredentials: true,
  });

  if (response.status === 401) {
    const error = new Error("Unauthorized") as any;
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
  const response = await axios.put(
    `${API_URL}/api/products/${productId}`,
    product,
    { withCredentials: true }
  );
  return handleResponse(response);
};
// Delete item
export const deleteProduct = async (productId: number): Promise<boolean> => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/products/${productId}`,
      {
        withCredentials: true,
      }
    );

    if (response.status === 204) {
      return true; // Return true if deletion was successful (status 204)
    }

    return false; // Return false if not successful
  } catch (error) {
    console.error("Error deleting product:", error);
    return false; // Return false if an error occurs
  }
};

// Upload a product's image — used from the calculator pages (Calculator.jsx,
// CalculatorUpdate.jsx) when saving/updating a product, but the endpoint itself is
// a product operation, so it lives here rather than in calculatorService.
export const uploadProductImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(
    `${API_URL}/api/products/upload-product-image`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    },
  );
  return response.data.imageUrl;
};

// Cleans up an orphaned image (e.g. the product save/update itself failed after
// the image had already been uploaded).
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  await axios.delete(`${API_URL}/api/products/delete-product-image`, {
    data: { imageUrl },
    withCredentials: true,
  });
};
