import React, { useState } from "react";
import { Table, Button, Container, Row, Col, Card } from "react-bootstrap";
import { Product } from "../types/product";
import { Link } from "react-router-dom";
import "../css/ProductTable.css";
import API_URL from "../apiConfig";
import CollapseCard from "../shared/CollapseCard";
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
              <thead className="bg-light">
                <tr>
                  {showId && <th className="align-middle">ID</th>}
                  <th className="align-middle text-center">Navn</th>
                  <th className="align-middle text-center">Bilde</th>
                  <th className="align-middle text-center">Gruppe</th>
                  {showType && (
                    <th className="align-middle text-center">Type</th>
                  )}
                  {showNutrition && (
                    <th className="align-middle">Næringsmiddel pr. 100 g/ml</th>
                  )}
                  <th className="align-middle text-center">Nøkkelhullet</th>
                  <th className="align-middle text-center">
                    EFSA Ernæringspåstander
                  </th>
                  <th className="align-middle text-center">
                    EFSA Helsepåstander
                  </th>
                  <th className="align-middle text-center">Behandling</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
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
                        to={`/productdetails/${product.productId}`}
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
                      <img
                        src={
                          product.hasNokkelhullet
                            ? `${API_URL}/images/circle-keyhole-logo.png`
                            : `${API_URL}/images/ban_keyhole.png`
                        }
                        alt={
                          product.hasNokkelhullet
                            ? "Oppfyller Nøkkelhullet"
                            : "Oppfyller ikke Nøkkelhullet"
                        }
                        style={{
                          width: "50px",
                          height: "50px",
                          padding: "2px",
                        }}
                        className="rounded"
                      />
                    </td>

                    <td className="align-middle text-center">
                      <Button variant="outline-primary">
                        <img
                          src={
                            product.hasEfsaNutrition
                              ? `${API_URL}/images/efsaLogoGreen.png`
                              : `${API_URL}/images/efsaLogoBlack.png`
                          }
                          alt={
                            product.hasEfsaNutrition
                              ? "Has EFSA Nutrition"
                              : "No EFSA Nutrition"
                          }
                          style={{
                            width: "70px",
                            height: "70px",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handleToggleNutrition(product.productId)
                          }
                        />
                      </Button>

                      {visibleNutrition[product.productId] &&
                        product.hasEfsaNutrition && (
                          <Card>
                            <div>
                              <strong>
                                Ernæringspåstander:
                                <br />
                              </strong>
                              {product.hasEfsaNutrition}
                            </div>
                          </Card>
                        )}
                    </td>

                    <td className="align-middle text-center">
                      <CollapseCard
                        productId={product.productId}
                        content={product.hasEfsaHealth}
                      />
                      <p></p>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() =>
                          handleShowClaims(product.hasEfsaHealth, product)
                        }
                      >
                        Full oversikt
                      </Button>
                    </td>

                    <td className="align-middle text-center">
                      <Link
                        to={`/products/updateCalculator/${product.productId}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-pencil-square"></i> Rediger
                      </Link>
                      <p></p>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onProductDeleted(product.productId)}
                      >
                        <i className="bi bi-trash"></i> Fjern
                      </Button>
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
