import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../apiConfig";
import { Product } from "../types/product"; // Importer Product-typen
import SplitHtml from "../components/SplitHtmlProps";
import NutritionClaimsUL from "../components/NutritionClaimsUL";
import ClaimsLabels from "../components/ClaimsLabels";
import ProductActions from "../components/ProductActions";
import { deleteProduct } from "./ProductService";
import HealthClaimsUL from "../components/HealthClaimsUL";

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get<Product>(
          `${API_URL}/api/products/${productId}`,
          {
            withCredentials: true, // Viktig hvis API-et bruker cookies for autentisering
          }
        );
        setProduct(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message || "Kunne ikke hente produktet."
          );
        } else {
          setError("En ukjent feil oppstod.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]); // Kjør bare når productId endres

  if (loading) return <p>Laster produkt...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Produkt ikke funnet.</p>;

  return (
    <>
      <div className="container">
        <div className="row">
          <p>Breadcrumbs</p>
        </div>

        {/* Title row */}
        <div className="row mb-4">
          <div className="col-8">
            <h1>{product.name}</h1>
            <p>Produktlinje 2</p>
          </div>
          <div className="col-4 text-end">
            <ProductActions
              productId={product.productId}
              onDelete={deleteProduct}
            />
          </div>
        </div>

        <div className="row gx-5">
          {/* Left column */}
          <div className="col-12 col-md-5">
            <div className="d-flex justify-content-center align-items-center">
              <img
                alt={product.name}
                className="rounded img-fluid"
                width={"100%"}
                style={{
                  maxHeight: "300px",
                  width: "auto",
                  objectFit: "contain",
                }}
                src={
                  product.imageUrl
                    ? `${API_URL}${product.imageUrl}`
                    : `${API_URL}/images/product_images/placeholder.png`
                }
              />
            </div>
            <div className="mt-4">
              <h2>Om produktet</h2>
              <ClaimsLabels
                hasNokkelhullet={product.hasNokkelhullet}
                hasEfsaNutrition={product.hasEfsaNutrition}
              />
              <div className="p-2">
                <dl className="row">
                  <dt className="col-6">Produsent</dt>
                  <dd className="col-6">Ex: Nortura SA</dd>

                  <dt className="col-6">Merkevare</dt>
                  <dd className="col-6">Ex: Gilde</dd>

                  <dt className="col-6">Matvaregruppe</dt>
                  <dd className="col-6">
                    <SplitHtml htmlContent={product.group} part="after" />
                  </dd>

                  <dt className="col-6">Matvarekategori</dt>
                  <dd className="col-6">
                    <SplitHtml htmlContent={product.type} part="after" />
                  </dd>

                  <dt className="col-6">Oppbevaring</dt>
                  <dd className="col-6">
                    Ex: Oppbevaren kjølig, mellom 0 og 4 °C
                  </dd>

                  <dt className="col-6">Opprinnelse</dt>
                  <dd className="col-6">Norge</dd>

                  <dt className="col-6">GTIN</dt>
                  <dd className="col-6">7037206101371</dd>
                </dl>
              </div>
            </div>
            <hr></hr>
            <div>
              <h2>Beskrivelse</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Temporibus nihil pariatur esse ut neque quos reprehenderit magni
                harum, excepturi est dolorum quisquam quo reiciendis vel
                cupiditate repellat tempore. Dolorem, nulla!
              </p>
            </div>
            <hr></hr>
          </div>

          {/* Right column */}
          <div className="col-12 col-md-7">
            <h2>Ingredients</h2>
            <p>
              Ex: Kjøtt (52 %) av svin og storfe, vann, hodekjøtt (7 %) av
              storfe og svin, potetmel, salt, dekstrose, krydder, løk,
              surhetsregulerende middel e508, stabilisator e451, røykaroma,
              antioksidant e315, konserveringsmiddel e261, e326, e250.
            </p>
            <hr />

            <h2>Nutrition</h2>
            <div className="mb-4">
              <table className="table table-striped table-hover">
                <caption>Nutrition per 100g</caption>
                <thead>
                  <tr>
                    <th scope="col">Næringsstoff</th>
                    <th scope="col">Per 100g</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Kalorier</td>
                    <td>{product.calories}</td>
                  </tr>
                  <tr>
                    <td>Fett</td>
                    <td>{product.fat}</td>
                  </tr>
                  <tr>
                    <td className="ps-4">Hvorav mettet fett</td>
                    <td>{product.satFat}</td>
                  </tr>
                  <tr>
                    <td>Karohydrater</td>
                    <td>{product.carbs}</td>
                  </tr>
                  <tr>
                    <td className="ps-4">Hvorav naturlig sukker</td>
                    <td>{product.natSugar}</td>
                  </tr>
                  <tr>
                    <td className="ps-4">Hvorav tilsatt sukker</td>
                    <td>{product.addedSugar}</td>
                  </tr>
                  <tr>
                    <td className="ps-4">Hvorav fiber</td>
                    <td>{product.fiber}</td>
                  </tr>
                  <tr>
                    <td>Protein</td>
                    <td>{product.protein}</td>
                  </tr>
                  <tr>
                    <td>Salt</td>
                    <td>{product.salt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <hr></hr>
            <h2>EFSA Påstander</h2>
            {product.hasEfsaNutrition && (
              <div className="mb-4">
                <p>
                  <strong>Næringspåstander</strong>
                </p>
                <NutritionClaimsUL claims={product.hasEfsaNutrition} />
                {product.hasEfsaHealth !== "" && (
                  <div className="mb-4">
                    <p>
                      <strong>Helsepåstander</strong>
                    </p>
                    <div>
                      <HealthClaimsUL claims={product.hasEfsaHealth} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
