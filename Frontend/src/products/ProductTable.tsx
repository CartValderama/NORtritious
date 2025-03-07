import React, { useState } from "react";
import { Table, Button, Container, Row, Col, Card } from "react-bootstrap";
import { Product } from "../types/product";
import { Link } from "react-router-dom";
import "../css/ProductTable.css";
import API_URL from "../apiConfig";
import ClaimsView from "../shared/ClaimsView";

interface ProductTableProps {
  products: Product[];
  apiUrl: string;
  onProductDeleted: (productId: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onProductDeleted,
}) => {
  const [showId, setShowId] = useState<boolean>(false);
  const [showNutrition, setShowNutrition] = useState<boolean>(false);
  const [showClaims, setShowClaims] = React.useState<boolean>(false);
  const [claimsContent, setClaimsContent] = React.useState<string>("");
  const [visibleNutrition, setVisibleNutrition] = useState<{
    [key: number]: boolean;
  }>({});
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showType, setShowType] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleToggleNutrition = (productId: number) => {
    setVisibleNutrition((prevState) => ({
      ...prevState,
      [productId]: !prevState[productId],
    }));
  };

  const handleShowClaims = (content: string, product: any) => {
    setClaimsContent(content);
    setShowClaims(true);
    setSelectedProduct(product);
  };

  const handleShowNutritionClaims = (content: string, product: any) => {
    setClaimsContent(content);
    setShowClaims(true);
    setSelectedProduct(product);
  };

  // Sorterer produktene
  const sortedProducts = [...products].sort((a, b) => {
    // Ensure TypeScript knows `sortColumn` is a valid key of `Product`
    const key = sortColumn as keyof Product;

    if (!a[key] || !b[key]) return 0; // Handle missing data

    const valueA =
      typeof a[key] === "string" ? (a[key] as string).toLowerCase() : a[key];
    const valueB =
      typeof b[key] === "string" ? (b[key] as string).toLowerCase() : b[key];

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Formaterer innholdet i kortet
  const formatContent = (content: string) => {
    return content.split("\n").map((line, index) => (
      // For hver linje i innholdet, returnes en paragraf via HTML,
      // dangerouslySetInnerHTML er innerHTML i React
      <p key={index} dangerouslySetInnerHTML={{ __html: line }} />
    ));
  };

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
            {showId ? " Gjem" : " Vis"}
          </Button>
          <Button
            onClick={() => setShowType(!showType)}
            className="btn btn-primary me-2"
            size="sm"
          >
            <i className="bi bi-tag"></i>
            {showType ? " Gjem" : " Vis"}
          </Button>
          <Button
            onClick={() => setShowNutrition(!showNutrition)}
            className="btn btn-primary"
            size="sm"
          >
            <i className="bi bi-clipboard-data"></i>
            {showNutrition ? " Gjem" : " Vis"}
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
              style={{ backgroundColor: "white" }}
            >
              <caption>Produkttabell</caption>
              <thead className="bg-light">
                <tr>
                  {showId && <th className="align-middle">ID</th>}
                  <th
                    className="align-middle text-center"
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Navn{" "}
                    {sortColumn === "name"
                      ? sortDirection === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th className="align-middle text-center">Bilde</th>
                  <th
                    className="align-middle text-center"
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Gruppe{" "}
                    {sortColumn === "name"
                      ? sortDirection === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  {showType && (
                    <th className="align-middle text-center">Kategori</th>
                  )}
                  {showNutrition && (
                    <th className="align-middle">Næringsmiddel pr. 100 g/ml</th>
                  )}
                  <th className="align-middle text-center">
                    <img
                      src={`${API_URL}/images/circle-keyhole-logo.png`}
                      alt="Nøkkelhullet"
                      className="img-fluid"
                      style={{ maxHeight: "1.5rem" }} // Adjust size to match text
                    />
                    <span> Nøkkelhull</span>
                  </th>
                  <th className="align-middle text-center">
                    <img
                      src={`${API_URL}/images/efsaLogoGreen.png`}
                      alt="EFSA Ernæringspåstander"
                      className="img-fluid"
                      style={{ maxHeight: "1.5rem" }}
                    />
                    <span> EFSA Påstander</span>
                  </th>
                  <th className="align-middle text-center">Behandling</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product.productId}>
                    {showId && (
                      <td className="align-middle">{product.productId}</td>
                    )}
                    <td className="align-middle fw-bold">
                      <Link
                        to={`/products/details/${product.productId}`}
                        className="text-decoration-none"
                      >
                        {product.name}
                      </Link>
                    </td>

                    <td className="align-middle text-center">
                      <Link
                        to={`/products/details/${product.productId}`}
                        className="text-decoration-none"
                      >
                        <img
                          src={`${API_URL}/images/${product.imageUrl}`}
                          alt={product.name}
                          className="rounded"
                          style={{ maxWidth: "120px", height: "auto" }}
                        />
                      </Link>
                    </td>

                    <td className="align-middle">
                      {formatContent(product.group)}
                    </td>
                    {showType && (
                      <td className="align-middle small">
                        {formatContent(product.type)}
                      </td>
                    )}

                    {showNutrition && (
                      <td className="align-middle small">
                        Energi: {product.calories}
                        <br />
                        Fett: {product.fat}
                        <br />
                        Mettet fett: {product.satFat}
                        <br />
                        Karbo: {product.carbs}
                        <br />
                        Nat sukker: {product.natSugar}
                        <br />
                        Tilsatt sukker: {product.addedSugar}
                        <br />
                        Fiber: {product.fiber}
                        <br />
                        Protein: {product.protein}
                        <br />
                        Salt: {product.salt}
                      </td>
                    )}
                    <td className="align-middle text-center">
                      {product.hasNokkelhullet ? (
                        <i className="bi bi-check-circle-fill text-success h4"></i>
                      ) : (
                        <></>
                      )}
                    </td>

                    <td className="align-middle text-center">
                      <div
                        className="btn-group"
                        role="group"
                        aria-label="EFSA Visningsknapper"
                      >
                        {product.hasEfsaHealth ? (
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            onClick={() =>
                              handleShowClaims(product.hasEfsaHealth, product)
                            }
                          >
                            <i className="bi bi-arrows-fullscreen"></i>
                            <span> Helsepåstander</span>
                          </button>
                        ) : (
                          ""
                        )}
                      </div>
                      <br></br>
                      {product.hasEfsaNutrition}
                    </td>

                    <td className="align-middle text-center">
                      <div
                        className="btn-group"
                        role="group"
                        aria-label="Produkthandlingsknapper"
                      >
                        {/* Navigate to the edit page with product ID */}
                        <Link
                          type="button"
                          to="/edit-product"
                          className="btn btn-outline-primary btn-sm"
                          aria-label="Rediger produkt"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Link>

                        {/* Call onProductDeleted function with product ID */}
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          aria-label="Slett produkt"
                          onClick={() => onProductDeleted(product.productId)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
      {selectedProduct && (
        <ClaimsView
          show={showClaims}
          onHide={() => setShowClaims(false)}
          content={claimsContent}
          product={selectedProduct}
        />
      )}
    </Container>
  );
};

export default ProductTable;
