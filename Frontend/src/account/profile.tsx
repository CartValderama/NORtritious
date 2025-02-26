import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../apiConfig";

const ProfilePage: React.FC = () => {
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    role: "",
    organizationNumber: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState(""); // Ny state for gammelt passord
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedSection, setSelectedSection] = useState<
    "password" | "info" | "products"
  >("info");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]); // For å holde på produktlisten
  const [isProductsLoading, setIsProductsLoading] = useState(false); // For å vise loading spinner

  const navigate = useNavigate();

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fetchProducts = async () => {
    setIsProductsLoading(true); // Start loading
    try {
      const response = await axios.get(
        `${API_URL}/api/products`, // Endepunkt for å hente alle produkter
        { withCredentials: true }
      );
      setProducts(response.data); // Sett produkter i state
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to fetch products.");
      }
    } finally {
      setIsProductsLoading(false); // Stop loading
    }
  };

  const handleChangePassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage("");
      setError("");

      try {
        const changePasswordRequest = {
          email: userInfo.email, // Brukerens epost
          oldPassword, // Gammelt passord
          newPassword, // Nytt passord
        };

        await axios.post(
          `${API_URL}/api/account/change-password`,
          changePasswordRequest,
          { withCredentials: true }
        );
        setMessage("Password changed successfully.");
        setOldPassword(""); // Tøm gammelt passord felt
        setNewPassword(""); // Tøm nytt passord felt
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message || "Failed to change password."
          );
        }
      }
    },
    [newPassword, oldPassword, userInfo.email] // Inkluder gammelt passord i dependencies
  );

  const handleUpdateInfo = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage("");
      setError("");

      try {
        await axios.put(`${API_URL}/api/account/update-info`, userInfo, {
          withCredentials: true,
        });
        setMessage("Information updated successfully.");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message || "Failed to update information."
          );
        }
      }
    },
    [userInfo]
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h1 className="h1">Konto</h1>

      <div className="row">
        {/* Sidemeny */}
        <div className="col-md-3">
          <div className="list-group mb-2">
            <button
              className={`list-group-item list-group-item-action ${
                selectedSection === "info" ? "active" : ""
              }`}
              onClick={() => setSelectedSection("info")}
            >
              <i className="bi bi-person-circle"></i> Oppdater informasjon
            </button>
            <button
              className={`list-group-item list-group-item-action ${
                selectedSection === "password" ? "active" : ""
              }`}
              onClick={() => setSelectedSection("password")}
            >
              <i className="bi bi-shield-lock"></i> Endre passord
            </button>
            <button
              className={`list-group-item list-group-item-action ${
                selectedSection === "products" ? "active" : ""
              }`}
              onClick={() => setSelectedSection("products")}
            >
              <i className="bi bi-box"></i> Mine produkter
            </button>
          </div>
        </div>

        {/* Hovedinnhold */}
        <div className="col-md-9">
          {selectedSection === "info" && (
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Oppdater informasjon</h2>
                <div className="alert alert-warning" role="alert">
                  Ikke implementert.
                </div>
                <form onSubmit={handleUpdateInfo}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Navn
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" id="basic-addon1">
                        <i className="bi bi-person-vcard"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={userInfo.name}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, name: e.target.value })
                        }
                        required
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Epost
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" id="basic-addon1">
                        <i className="bi bi-at"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={userInfo.email}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, email: e.target.value })
                        }
                        required
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">
                      Rolle
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" id="basic-addon2">
                        <i className="bi bi-tag"></i>
                      </span>
                      <input
                        type="role"
                        className="form-control"
                        id="role"
                        value={userInfo.role}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, email: e.target.value })
                        }
                        required
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  {userInfo.role === "Producer" && (
                    <div className="mb-3">
                      <label htmlFor="org-num" className="form-label">
                        Organisasjonsnummer
                      </label>
                      <div className="input-group">
                        <span className="input-group-text" id="basic-addon1">
                          <i className="bi bi-building"></i>
                        </span>
                        <input
                          type="org-num"
                          className="form-control"
                          id="org-num"
                          value={userInfo.organizationNumber}
                          onChange={(e) =>
                            setUserInfo({ ...userInfo, email: e.target.value })
                          }
                          required
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary" disabled>
                    Oppdater
                  </button>
                </form>
              </div>
            </div>
          )}

          {selectedSection === "password" && (
            <div className="card mb-3">
              <div className="card-body">
                <h2 className="card-title">Endre passord</h2>
                <div className="alert alert-success" role="alert">
                  Implementert!
                </div>
                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label htmlFor="oldPassword" className="form-label">
                      Gammelt passord
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="oldPassword"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <i className="bi bi-eye-slash"></i>
                        ) : (
                          <i className="bi bi-eye"></i>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      Nytt passord
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <i className="bi bi-eye-slash"></i>
                        ) : (
                          <i className="bi bi-eye"></i>
                        )}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Endre
                  </button>
                </form>
              </div>
            </div>
          )}

          {selectedSection === "products" && (
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Mine produkter</h2>
                <div className="alert alert-warning" role="alert">
                  Ikke implementert.
                </div>
                {/* Vise produkter eller loading state */}
                {isProductsLoading ? (
                  <p>Laster produkter...</p>
                ) : (
                  <>
                    <ul className="list-group mb-3">
                      {products.length > 0 ? (
                        products.map((product) => (
                          <li key={product.id} className="list-group-item">
                            {product.name} - {product.price} NOK
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item">
                          Ingen produkter funnet.
                        </li>
                      )}
                    </ul>
                    <button
                      className="btn btn-secondary"
                      onClick={fetchProducts}
                    >
                      Se alle produkter
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Melding / Feil */}
          {message && <div className="alert alert-success mt-3">{message}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
