import React, { useEffect, useState } from "react";
import {
  Table,
  Container,
  Row,
  Col,
  Form,
  Accordion,
  AccordionBody,
  Button,
} from "react-bootstrap";
import { Product } from "../types/product";
import { Link, useNavigate } from "react-router-dom";
import "../css/ProductTable.css";
import API_URL from "../apiConfig";
import ClaimsView from "../shared/ClaimsView";
import ProductActions from "../components/ProductActions";
import { deleteProduct } from "./ProductService";
import SplitHtml from "../components/SplitHtmlProps";
import axios from "axios";
import NoAccess from "../components/NoAccess";

interface ProductTableProps {
  products: Product[];
  apiUrl: string;
  onProductDeleted: (productId: number) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  activeSortMode: "column" | "nyest" | "eldst";
  handleSort: (column: string) => void;
  toggleSortMode: (mode: "column" | "nyest" | "eldst") => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onProductDeleted,
  sortColumn,
  sortDirection,
  activeSortMode,
  handleSort,
  toggleSortMode,
}) => {
  const [showId, setShowId] = useState<boolean>(false);
  const [showNutrition, setShowNutrition] = useState<boolean>(false);
  const [showClaims, setShowClaims] = React.useState<boolean>(false);
  const [claimsContent, setClaimsContent] = React.useState<string>("");
  //const [visibleNutrition, setVisibleNutrition] = useState<{[key: number]: boolean;}>({});
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showType, setShowType] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    role: "",
    organizationNumber: "",
    profilePicture: "",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/account/get-user-info`,
          {
            withCredentials: true,
          }
        );
        setUserInfo(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            navigate("/account/login"); // Redirect til login
          } else {
            setError(
              error.response?.data?.message ||
                "Failed to fetch user information."
            );
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleShowClaims = (content: string, product: any) => {
    setClaimsContent(content);
    setShowClaims(true);
    setSelectedProduct(product);
  };

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
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    />
                    <Form.Check
                      type="checkbox"
                      id="showTypeCheckbox"
                      label="Type"
                      onChange={() => setShowType(!showType)}
                      className="me-2"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    />
                    <Form.Check
                      type="checkbox"
                      id="showNutritionCheckbox"
                      label="Næringsmiddel"
                      onChange={() => setShowNutrition(!showNutrition)}
                      className="me-2"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
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
      </Row>
      <Row>
        <Col>
          <div className="card p-3">
            <div className="table">
              <Table hover className="rounded">
                <caption>Produkttabell</caption>
                <thead className="bg-light">
                  <tr>
                    {showId && <th className="align-middle">ID</th>}
                    <th
                      className={`sort-column align-middle text-center 
                      ${
                        sortColumn === "name" && activeSortMode === "column"
                          ? "sorted-column"
                          : ""
                      }
                      ${
                        activeSortMode === "column" ? "active-sort-column" : ""
                      }`}
                      onClick={() => handleSort("name")}
                      style={{ cursor: "pointer" }}
                    >
                      Navn{" "}
                      {sortColumn === "name" ? (
                        sortDirection === "asc" ? (
                          <small>
                            <i>(A-Å) ▲</i>
                          </small>
                        ) : (
                          <small>
                            <i>(Å-A) ▼</i>
                          </small>
                        )
                      ) : (
                        ""
                      )}
                    </th>
                    <th className="align-middle text-center">Bilde</th>
                    <th
                      className={`sort-column align-middle text-center 
                      ${
                        sortColumn === "group" && activeSortMode === "column"
                          ? "sorted-column"
                          : ""
                      }
                      ${
                        activeSortMode === "column" ? "active-sort-column" : ""
                      }`}
                      onClick={() => handleSort("group")}
                      style={{ cursor: "pointer" }}
                    >
                      Gruppe{" "}
                      {sortColumn === "group" ? (
                        sortDirection === "asc" ? (
                          <small>
                            <i>(A-Å) ▲</i>
                          </small>
                        ) : (
                          <small>
                            <i>(Å-A) ▼</i>
                          </small>
                        )
                      ) : (
                        ""
                      )}
                    </th>
                    {showType && (
                      <th className="align-middle text-center">Kategori</th>
                    )}
                    {showNutrition && (
                      <th className="align-middle">
                        Næringsmiddel pr. 100 g/ml
                      </th>
                    )}
                    <th className="align-middle text-center">
                      <img
                        src={`${API_URL}/images/circle-keyhole-logo.png`}
                        alt="Nøkkelhullet"
                        className="img-fluid"
                        style={{ maxHeight: "1.5rem" }} // Adjust size to match text
                      />
                      <span></span>
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
                  {products.map((product) => (
                    <tr key={product.productId}>
                      {showId && (
                        <td className="align-middle px-2 py-4">
                          {product.productId}
                        </td>
                      )}
                      <td className="align-middle fw-bold px-2 py-4">
                        <Link
                          to={`/products/details/${product.productId}`}
                          className="btn btn-link-primary"
                        >
                          {product.name}
                        </Link>
                      </td>

                      <td className="align-middle text-center px-2 py-4">
                        <Link
                          to={`/products/details/${product.productId}`}
                          className="text-decoration-none"
                        >
                          <img
                            alt={product.name}
                            className="rounded"
                            style={{ maxWidth: "120px", maxHeight: "50px" }}
                            src={
                              product.imageUrl
                                ? `${API_URL}${product.imageUrl}`
                                : `${API_URL}/images/product_images/placeholder.png`
                            }
                          />
                        </Link>
                      </td>

                      <td className="align-middle px-2 py-4">
                        <SplitHtml htmlContent={product.group} part="after" />
                      </td>
                      {showType && (
                        <td className="align-middle small px-2 py-4">
                          <SplitHtml htmlContent={product.type} part="after" />
                        </td>
                      )}

                      {showNutrition && (
                        <td className="align-middle small px-2 py-4">
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
                      <td className="align-middle text-center px-2 py-4">
                        {product.hasNokkelhullet ? (
                          <i className="bi bi-check-circle-fill text-success h4"></i>
                        ) : (
                          <></>
                        )}
                      </td>

                      <td className="align-middle text-center px-2 py-4">
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
                                  handleShowClaims(
                                    product.hasEfsaHealth,
                                    product
                                  )
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

                      <td className="align-middle text-center px-2 py-4">
                        {userInfo.role !== "Researcher" ? (
                          <ProductActions
                            productId={product.productId}
                            onDelete={deleteProduct}
                          />
                        ) : (
                          <NoAccess />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
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
