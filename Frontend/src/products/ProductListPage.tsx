import React, { useState, useEffect } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import ProductTable from "./ProductTable";
import ProductGrid from "./ProductGrid";
import { Product } from "../types/product";
import API_URL from "../apiConfig";
import * as ProductService from "./ProductService";
import "../css/ProductTable.css";
//import ErrorPopup from '../shared/ErrorPopup';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // State for storing products with Product type
  const [loading, setLoading] = useState<boolean>(false); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for storing error messages
  const [showTable, setShowTable] = useState<boolean>(true); // State to toggle between table and grid view
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query
  //const [showUnauthorizedError, setShowUnauthorizedError] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState<number>(5); // State for the number of visible products
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  // Switch between sorting by ID and by column
  const [activeSortMode, setActiveSortMode] = useState<"column" | "nyest" |"eldst">("column");

  const toggleTableOrGrid = () =>
    setShowTable((prevShowTable) => !prevShowTable);

  const fetchProducts = async () => {
    setLoading(true); // Set loading to true when starting the fetch
    setError(null); // Clear any previous errors

    try {
      const data = await ProductService.fetchMyProducts();
      setProducts(data);
      console.log(data);
    } catch (error) {
      console.error(`There was a problem with the fetch operation: ${error}`);
      setError("Failed to fetch products. Are you logged in?");
    } finally {
      setLoading(false); // Set loading to false once the fetch is complete
    }
  };

  // Set the view mode to local storage when the product is fetched
  useEffect(() => {
    const savedViewMode = localStorage.getItem("productViewMode");
    console.log("[fetch products] Saved view mode:", savedViewMode); // Debugging line
    if (savedViewMode) {
      if (savedViewMode === "grid") setShowTable(false);
      console.log("show table", showTable);
    }
    fetchProducts();
  }, []);

  const loadMoreProducts = () => {
    setVisibleProducts((prevVisibleProducts) => prevVisibleProducts + 5);
  };

  const showLessProducts = () => {
    setVisibleProducts((prevVisibleProducts) =>
      Math.max(prevVisibleProducts - 5, 5)
    );
  };

  // Save the view mode to local storage whenever it changes
  useEffect(() => {
    console.log(
      "[save view state] Saving view mode:",
      showTable ? "table" : "grid"
    );
    localStorage.setItem("productViewMode", showTable ? "table" : "grid");
  }, [showTable]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setActiveSortMode("column");
  };

  /*
  const toggleSortById = () => {
    setSortById((prevSortById) => (prevSortById === "nyest" ? "eldst" : "nyest"));
    setActiveSortMode("id");
  };
  */

  const toggleSortMode = (mode: "column" | "nyest" | "eldst") => {
    setActiveSortMode(mode);
  };

  // Sorterer produktene
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Ensure TypeScript knows `sortColumn` is a valid key of `Product`
    if (activeSortMode === "column") {
      const key = sortColumn as keyof Product;

      if (!a[key] || !b[key]) return 0; // Handle missing data

      const valueA =
        typeof a[key] === "string" ? (a[key] as string).toLowerCase() : a[key];
      const valueB =
        typeof b[key] === "string" ? (b[key] as string).toLowerCase() : b[key];
      
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    } else if (activeSortMode === "nyest") {
      return b.productId - a.productId;
    } else if (activeSortMode === "eldst") {
      return a.productId - b.productId;
    } else
    return 0;
  });



  const handleProductDeleted = async (productId: number) => {
    const confirmDelete = window.confirm(
      `Er du sikker på at du vil fjerne vare med Id ${productId}?`
    );
    if (confirmDelete) {
      try {
        await ProductService.deleteProduct(productId);
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.productId !== productId)
        );
        console.log("Product deleted:", productId);
      } catch (error: any) {
        //setShowUnauthorizedError(true);
        console.error("Error deleting product:", error);
        if (error.response.status === 404) {
          setError("Product not found.");
        } else if (error.response.status === 401) {
          setError("You are not authorized to delete this product.");
        } else {
          setError("Failed to delete product.");
        }
      }
    }
  };

  return (
    <div>
      <h1>Produkter</h1>
      <Button
        variant="outline-primary"
        onClick={fetchProducts}
        className="mb-3 me-2"
        aria-label="Oppdater visning"
        disabled={loading}
      >
        <i className="bi bi-arrow-clockwise"></i>
        {loading ? " Loading..." : " "}
      </Button>
      <Button
        type="button"
        variant="outline-primary"
        aria-label={showTable ? "Rutenettvisning" : "Tabellvisning"}
        onClick={toggleTableOrGrid}
        className="mb-3 me-2"
      >
        {showTable ? (
          <>
            <i className="bi bi-grid"></i>
            <span> Rutenett</span>
          </>
        ) : (
          <>
            <i className="bi bi-list-ul"></i>
            <span> Tabell</span>
          </>
        )}
      </Button>
      <Button
        to="/products/calculator"
        className="btn btn-secondary mb-3 me-2"
        style={{ backgroundColor: "darkblue" }}
      >
        <i className="bi bi-pencil-square"></i> Nytt Produkt
      </Button>
      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            aria-label="Søkefelt"
            placeholder="Søk etter Navn eller Kategorier"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </Form.Group>

      <div>
        {loading && <Spinner animation="border" />}
        {error && <div className="alert alert-danger">{error}</div>}
        {showTable ? (
          <ProductTable
            products={sortedProducts.slice(0, visibleProducts)}
            apiUrl={`${API_URL}`}
            onProductDeleted={handleProductDeleted}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            activeSortMode={activeSortMode}
            handleSort={handleSort}
            toggleSortMode={toggleSortMode}
          />
        ) : (
          <ProductGrid
            products={sortedProducts.slice(0, visibleProducts)}
            apiUrl={`${API_URL}`}
            onProductDeleted={handleProductDeleted}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            activeSortMode={activeSortMode}
            handleSort={handleSort}
            toggleSortMode={toggleSortMode}
          />
        )}
        <div className="d-flex justify-content-between mt-3">
          {visibleProducts < filteredProducts.length && (
            <Button onClick={loadMoreProducts}>Last inn flere produkter</Button>
          )}
          {visibleProducts > 5 && (
            <Button onClick={showLessProducts}>Vis færre produkter</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
