import httpClient from "./httpClient";

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
  const response = await httpClient.get("/api/products");
  return handleResponse(response);
};
// Get item by id
export const fetchProductById = async (productId: string) => {
  const response = await httpClient.get(`/api/products/${productId}`, {
    headers: {
      'Content-Type': 'application/json',
  }
  });
  return handleResponse(response);
};

export const fetchMyProducts = async () => {
  const response = await httpClient.get("/api/products/my-products", {
    headers: {
      'Content-Type': 'application/json',
  },
  });
  return handleResponse(response);
};

// Post create item
export const createProduct = async (product: any) => {
  const response = await httpClient.post("/api/products", product);

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
  const response = await httpClient.put(`/api/products/${productId}`, {
    ...product,
    productId,
  });

  if (response.status === 401) {
    const error = new Error("Unauthorized") as any;
    error.status = 401;
    throw error;
  }
  return handleResponse(response);
};

// Delete item
export const deleteProduct = async (productId: number): Promise<boolean> => {
  try {
    const response = await httpClient.delete(`/api/products/${productId}`);

    if (response.status === 204) {
      return true; // Return true if deletion was successful (status 204)
    }

    return false; // Return false if not successful
  } catch (error) {
    console.error("Error deleting product:", error);
    return false; // Return false if an error occurs
  }
};

// Upload a product's image — used from the calculator pages when saving a
// product, but the endpoint itself is a product operation, so it lives here
// rather than in calculatorService.
export const uploadProductImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await httpClient.post(
    "/api/products/upload-product-image",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data.imageUrl;
};

// Cleans up an orphaned image (e.g. the product save/update itself failed after
// the image had already been uploaded).
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  await httpClient.delete("/api/products/delete-product-image", {
    data: { imageUrl },
  });
};

// Distinguishes which step of saveProductWithImage failed, so callers can
// show the right message (and know whether the product itself was saved).
export class ProductSaveError extends Error {
  stage: "upload" | "save";
  cause?: unknown;

  constructor(stage: "upload" | "save", cause?: unknown) {
    super(stage === "upload" ? "Image upload failed" : "Product save failed");
    this.stage = stage;
    this.cause = cause;
  }
}

// Uploads the image (if given) then creates the product with that image's
// URL. If create fails after an image was already uploaded, cleans up the
// orphaned image before rethrowing, so a failed save doesn't leave a
// dangling upload behind.
export const saveProductWithImage = async (
  product: any,
  image: File | null,
): Promise<void> => {
  let imageUrl = "";
  if (image) {
    try {
      imageUrl = await uploadProductImage(image);
    } catch (error) {
      throw new ProductSaveError("upload", error);
    }
  }

  try {
    await createProduct({ ...product, imageUrl });
  } catch (error) {
    if (imageUrl) {
      try {
        await deleteProductImage(imageUrl);
      } catch (deleteError: any) {
        console.error(
          "Failed to delete orphaned image:",
          deleteError.response?.data || deleteError.message,
        );
      }
    }
    throw new ProductSaveError("save", error);
  }
};

// Same as saveProductWithImage, but updates an existing product instead of
// creating a new one. Only uploads a replacement image when one was picked —
// otherwise keeps the product's existing imageUrl as-is.
export const updateProductWithImage = async (
  productId: number,
  product: any,
  image: File | null,
): Promise<void> => {
  let imageUrl = product.imageUrl || "";
  if (image) {
    try {
      imageUrl = await uploadProductImage(image);
    } catch (error) {
      throw new ProductSaveError("upload", error);
    }
  }

  try {
    await updateProduct(productId, { ...product, imageUrl });
  } catch (error) {
    if (image && imageUrl) {
      try {
        await deleteProductImage(imageUrl);
      } catch (deleteError: any) {
        console.error(
          "Failed to delete orphaned image:",
          deleteError.response?.data || deleteError.message,
        );
      }
    }
    throw new ProductSaveError("save", error);
  }
};
