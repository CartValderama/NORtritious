import React, { useState } from "react";
import { Table, Container, Row, Col, Form, Accordion, AccordionBody } from "react-bootstrap";
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
  //const [visibleNutrition, setVisibleNutrition] = useState<{[key: number]: boolean;}>({});
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showType, setShowType] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  // Switch between sorting by ID and by column
  const [activeSortMode, setActiveSortMode] = useState<"column" | "nyest" |"eldst">("column");

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

  const handleShowClaims = (content: string, product: any) => {
    setClaimsContent(content);
    setShowClaims(true);
    setSelectedProduct(product);
  };

  // Sorterer produktene
  const sortedProducts = [...products].sort((a, b) => {
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

  /*
  const finalSortedProducts = sortedProducts.sort((a, b) => {
    if (activeSortMode === "id") {
      return sortById === "nyest" ? b.productId - a.productId : a.productId - b.productId;
    } else {
      return 0;
    }
  });
  */

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
        <Col md={4} lg={3}>
          <Accordion defaultActiveKey={"1"}>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Filter</Accordion.Header>
              <AccordionBody>
                <Form>
                  <div className="d-flex flex-column gap-2">
                    <Form.Check 
                      type="checkbox"
                      id="showIdCheckbox"
                      label="ID"
                      onChange={() => setShowId(!showId)}
                      className="me-2"
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    />
                    <Form.Check 
                        type="checkbox"
                        id="showTypeCheckbox"
                        label="Type"
                        onChange={() => setShowType(!showType)}
                        className="me-2"
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    />
                    <Form.Check
                      type="checkbox"
                      id="showNutritionCheckbox"
                      label="Næringsmiddel"
                      onChange={() => setShowNutrition(!showNutrition)}
                      className="me-2"
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    />
                  </div>  
                </Form>
              </AccordionBody>
            </Accordion.Item>
          </Accordion>
        </Col>
        <Col md={8} lg={9}>
          <Accordion defaultActiveKey={"1"}>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Sortering</Accordion.Header>
                <AccordionBody>
                <div className=" sort-buttons" data-toggle="buttons">
                  <label className={`btn btn-primary ${activeSortMode === "column" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="options"
                      id="option1"
                      checked={activeSortMode === "column"}
                      onChange={() => toggleSortMode("column")}
                    /> &nbsp;(A-Å) Navn/Gruppe

                  </label>
                  <label className={`btn btn-primary ${activeSortMode === "nyest" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="options"
                      id="option2"
                      autoComplete="off"
                      checked={activeSortMode === "nyest"}
                      onChange={() => toggleSortMode("nyest")}
                    /> &nbsp; <i className="bi bi-sort-numeric-down"></i> Nyest
                  </label>
                  <label className={`btn btn-primary ${activeSortMode === "eldst" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="options"
                      id="option3"
                      autoComplete="off"
                      checked={activeSortMode === "eldst"}
                      onChange={() => toggleSortMode("eldst")}
                    /> &nbsp; <i className="bi bi-sort-numeric-up"></i> Eldst 
                  </label>
                </div>
              </AccordionBody>
            </Accordion.Item>
          </Accordion>
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
                    className={`sort-column align-middle text-center 
                      ${sortColumn === "name" && activeSortMode === "column" ? "sorted-column" : ""}
                      ${activeSortMode === "column" ? "active-sort-column" : ""}`}
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Navn{" "}
                    {sortColumn === "name"
                      ? sortDirection === "asc"
                        ? <small><i>(A-Å) ▲</i></small>
                        : <small><i>(Å-A) ▼</i></small>
                      : ""}
                  </th>
                  <th className="align-middle text-center">Bilde</th>
                  <th
                    className={`sort-column align-middle text-center 
                      ${sortColumn === "group" && activeSortMode === "column" ? "sorted-column" : ""}
                      ${activeSortMode === "column" ? "active-sort-column" : ""}`}  
                    onClick={() => handleSort("group")}
                    style={{ cursor: "pointer" }}
                  >
                    Gruppe{" "}
                    {sortColumn === "group"
                      ? sortDirection === "asc"
                        ? <small><i>(A-Å) ▲</i></small>
                        : <small><i>(Å-A) ▼</i></small>
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
                          alt={product.name}
                          className="rounded"
                          style={{ maxWidth: "120px", maxHeight: "100px" }}
                          src={
                            product.imageUrl
                              ? `${API_URL}${product.imageUrl}`
                              : `${API_URL}/images/product_images/placeholder.png`
                          }
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
                      {product.hasEfsaHealth &&
                      product.hasEfsaHealth.trim() !== "" ? (
                        <>
                          <div
                            className="btn-group"
                            role="group"
                            aria-label="EFSA Visningsknapper"
                          >
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
                          </div>
                          <br />
                        </>
                      ) : (
                        ""
                      )}
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
                          to={`/products/calculatorUpdate/${product.productId}`}
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
