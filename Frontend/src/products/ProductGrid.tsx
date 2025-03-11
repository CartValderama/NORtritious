import React, { useState } from "react";
import {
  Card,
  Col,
  Row,
  Button,
  ButtonGroup,
  Popover,
  OverlayTrigger,
  Accordion,
  AccordionBody,
} from "react-bootstrap";
import { Product } from "../types/product";
import { Link } from "react-router-dom";
import API_URL from "../apiConfig";
import ClaimsView from "../shared/ClaimsView";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";
import ClaimsLabels from "../components/ClaimsLabels";
import ProductActions from "../components/ProductActions";
import { deleteProduct } from "./ProductService";

interface ProductGridProps {
  products: Product[];
  apiUrl: string;
  onProductDeleted: (productId: number) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  activeSortMode: "column" | "nyest" | "eldst";
  handleSort: (column: string) => void;
  toggleSortMode: (mode: "column" | "nyest" | "eldst") => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductDeleted,
  sortColumn,
  sortDirection,
  activeSortMode,
  handleSort,
  toggleSortMode,
}) => {
  const [showClaims, setShowClaims] = React.useState<boolean>(false);
  const [claimsContent, setClaimsContent] = React.useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleShowClaims = (content: string, product: any) => {
    setClaimsContent(content);
    setShowClaims(true);
    setSelectedProduct(product);
  };

  // Formaterer innholdet i kortet
  const formatContent = (content: string) => {
    return content.split("\n").map((line, index) => (
      // For hver linje i innholdet, returnes en paragraf via HTML,
      // dangerouslySetInnerHTML er innerHTML i React
      <p key={index} dangerouslySetInnerHTML={{ __html: line }} />
    ));
  };

  // Popover for ernæringspåstander
  const popover = (product: any) => (
    <Popover id="popover-basic" style={{ width: "500px", maxHeight: "300px" }}>
      <Popover.Header as="h2">EFSA Ernæringspåstander</Popover.Header>
      <Popover.Body>
        <strong>{formatContent(product.hasEfsaNutrition)}</strong>
      </Popover.Body>
    </Popover>
  );

  return (
    <div>
      <Col md={8} lg={9}>
        <Accordion defaultActiveKey={"1"}>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Sortering</Accordion.Header>
            <AccordionBody>
              <div className=" sort-buttons" data-toggle="buttons">
                <Button
                  className="btn btn-primary"
                  onClick={() => handleSort("name")}
                >
                  Navn
                  {sortColumn === "name" && sortDirection === "asc"
                    ? " (A-Å)"
                    : " (Å-A)"}
                </Button>
                <Button
                  className="btn btn-primary"
                  onClick={() => handleSort("group")}
                >
                  Gruppe
                  {sortColumn === "group" && sortDirection === "asc"
                    ? " (A-Å)"
                    : " (Å-A)"}
                </Button>
                <label
                  className={`btn btn-primary ${
                    activeSortMode === "nyest" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="options"
                    id="option2"
                    autoComplete="off"
                    checked={activeSortMode === "nyest"}
                    onChange={() => toggleSortMode("nyest")}
                  />{" "}
                  &nbsp; <i className="bi bi-sort-numeric-down"></i> Nyest
                </label>
                <label
                  className={`btn btn-primary ${
                    activeSortMode === "eldst" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="options"
                    id="option3"
                    autoComplete="off"
                    checked={activeSortMode === "eldst"}
                    onChange={() => toggleSortMode("eldst")}
                  />{" "}
                  &nbsp; <i className="bi bi-sort-numeric-up"></i> Eldst
                </label>
              </div>
            </AccordionBody>
          </Accordion.Item>
        </Accordion>
      </Col>
      <br />
      <Row xs={1} sm={2} md={2} lg={3} xl={4} className="g-4">
        {products.map((product) => (
          <Col key={product.productId}>
            <Card className="h-100 d-flex flex-column">
              <Card.Body>
                <Link
                  to={`/products/details/${product.productId}`}
                  className="text-decoration-none"
                >
                  <Card.Img
                    alt={product.name}
                    variant="top"
                    className="mx-auto d-block"
                    style={{ height: "200px", objectFit: "contain" }}
                    src={
                      product.imageUrl
                        ? `${API_URL}${product.imageUrl}`
                        : `${API_URL}/images/product_images/placeholder.png`
                    }
                  />
                </Link>
              </Card.Body>
              <Card.Body>
                <div className="mb-4">
                  <ClaimsLabels
                    hasNokkelhullet={product.hasNokkelhullet}
                    hasEfsaNutrition={product.hasEfsaNutrition}
                  />
                </div>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>
                  <p dangerouslySetInnerHTML={{ __html: product.group }}></p>
                  <p dangerouslySetInnerHTML={{ __html: product.type }}></p>
                </Card.Text>
              </Card.Body>
              <Card.Body>
                <div className="d-flex justify-content-end">
                  <ProductActions
                    productId={product.productId}
                    onDelete={deleteProduct}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {selectedProduct && (
        <ClaimsView
          show={showClaims}
          onHide={() => setShowClaims(false)}
          content={claimsContent}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default ProductGrid;
