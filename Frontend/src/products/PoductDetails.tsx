import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../apiConfig";
import { Product } from "../types/product"; // Importer Product-typen
import CrudButtons from "../components/CrudButtons";
import NutritionScoreGroup from "../components/NutritionScoreGroup";
import { calculateNutriScore } from "../services/CalculateNutriScore";

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nutriScore, setNutriScore] = useState<string | null>(null);

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

  useEffect(() => {
    if (product) {
      const score = calculateNutriScore(product); // Beregn NutriScore når produktet lastes inn
      setNutriScore(score);
    }
  }, [product]); // Kjør når produktet endres

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
            <CrudButtons />
          </div>
        </div>

        <div className="row gx-5">
          {/* Left column */}
          <div className="col-12 col-md-5">
            <div className="p-4">
              <img
                src={`${API_URL}/images/placeholder.png`}
                width={"100%"}
                alt="Gilde Kjøttpølse"
              ></img>
            </div>
            <div className="mt-4">
              <h2>Om produktet</h2>
              <div className="p-2">
                <img
                  src={`${API_URL}/images/circle-keyhole-logo.png`}
                  height={"30px"}
                  className="pe-2"
                  alt="Nøkkelhull-merket"
                />
                <img
                  src={`${API_URL}/images/efsaLogo.png`}
                  height={"30px"}
                  alt="EFSA-merket"
                />
                <img
                  src={`${API_URL}/images/efsaLogoGreen.png`}
                  height={"30px"}
                  alt="EFSA-merket"
                />
              </div>
              <div className="p-2">
                <dl className="row">
                  <dt className="col-6">Produsent</dt>
                  <dd className="col-6">Ex: Nortura SA</dd>

                  <dt className="col-6">Merkevare</dt>
                  <dd className="col-6">Ex: Gilde</dd>

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
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Temporibus nihil pariatur esse ut neque quos reprehenderit magni
              harum, excepturi est dolorum quisquam quo reiciendis vel
              cupiditate repellat tempore. Dolorem, nulla!
            </p>
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
            <NutritionScoreGroup highlighted={nutriScore} />
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
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
