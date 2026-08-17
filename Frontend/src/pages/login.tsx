import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RoleRightsTable from "../components/account/RoleRightsTable";
import {
  getUserInfo,
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
} from "../services/accountService";

const LoginPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Producer"); // Standardrolle
  const [organizationNumber, setOrganizationNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        await getUserInfo();
        setIsLoggedIn(true);
      } catch (error) {
        //setMessage("Failed to check login status.");
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginRequest(email, password);

      setMessage("Login successful");
      setIsLoggedIn(true);
      // Client wants to navigate to homepage after login
      navigate("/");
      window.location.reload();
    } catch (error) {
      setMessage("Login failed. Please check your credentials.");
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      await registerRequest({ name, email, password, role, organizationNumber });

      setMessage("Registrert! Du kan nå logge inn.");
      setIsRegister(false);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 409) {
          setMessage(
            "Epost er allerede i bruk. Prøv en annen, eller logg inn."
          );
        } else if (status === 400 && errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          setMessage(`Registration failed: ${errorMessages.join(", ")}`);
        } else {
          setMessage(errorData.message || "En uventet feil oppstod.");
        }
      } else {
        setMessage("Nettverksfeil. Prøv igjen senere.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutRequest();
      setMessage("Logout successful");
      setIsLoggedIn(false);
    } catch (error) {
      setMessage("Logout failed. Please try again.");
    }
  };

  if (loading) {
    return <div aria-live="assertive">Laster...</div>;
  }

  return (
    // Main Registration and Login container
    <div className="container mt-5 py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="card-title">
                {isRegister ? "Registrering" : "Innlogging"}
              </h1>
              {/* Display welcome message if in logged-in state */}
              {isLoggedIn ? (
                <div>
                  <p>Velkommen! Du er nå logget inn.</p>
                  <button
                    className="btn btn-secondary mt-3"
                    onClick={handleLogout}
                  >
                    Logg ut
                  </button>
                </div>
              ) : (
                // Registration and Login Page if NOT in logged-in state
                <form onSubmit={isRegister ? handleRegistration : handleLogin}>
                  {/* Display Name input if in registration state */}
                  {isRegister && (
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Navn*
                      </label>
                      <input
                        type="name"
                        className="form-control"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  {/* Display Email input in any state */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Epost*
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {/* Display Password input in any state */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Passord*
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        aria-label={
                          showPassword ? "Skjul passord" : "Vis passord"
                        }
                        title={showPassword ? "Skjul passord" : "Vis passord"}
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
                  {/* Display Role input if in registration state */}
                  {isRegister && (
                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">
                        Rolle*
                      </label>
                      <select
                        className="form-select"
                        id="role"
                        value={role}
                        aria-label="Velg din rolle"
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="Producer">Producer</option>
                        <option value="Researcher">Researcher</option>
                      </select>
                    </div>
                  )}
                  {/* Display Organisation Number input if in registration state */}
                  {isRegister && (
                    <div className="mb-3">
                      <label htmlFor="org-num" className="form-label">
                        Organisasjonsnummer
                      </label>
                      <input
                        type="org-num"
                        className="form-control"
                        id="org-num"
                        value={organizationNumber}
                        onChange={(e) => setOrganizationNumber(e.target.value)}
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    aria-label={
                      isRegister
                        ? "Send inn registreringsskjema"
                        : "Send inn innloggingsskjema"
                    }
                    title={
                      isRegister
                        ? "Klikk for å registrere"
                        : "Klikk for å logge inn"
                    }
                  >
                    {isRegister ? "Registrer" : "Logg inn"}
                  </button>
                </form>
              )}
              {/* Section for switching between registration and Login */}
              <p className="mt-3">
                {isRegister ? (
                  <span>Allerede har en konto?</span>
                ) : (
                  <span>Trenger du en konto?</span>
                )}
                <button
                  className="btn btn-link"
                  role="button"
                  aria-label={
                    isRegister ? "Gå til innlogging" : "Gå til registrering"
                  }
                  onClick={() => setIsRegister(!isRegister)}
                >
                  {isRegister ? "Tilbake til innlogging" : "Registrering"}
                </button>
              </p>
              {/* Display Role Rights Table if in registration state */}
              {isRegister && (
                <p>
                  <span>Vil du vite mer om rollerettigheter?</span>
                  <a
                    type="button"
                    className="btn btn-link"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                  >
                    Åpne oversikt
                  </a>
                </p>
              )}
              {/* Role Rights Table Modal */}
              <div
                className="modal fade"
                id="exampleModal"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h2 className="modal-title fs-5" id="exampleModalLabel">
                        Rollerettigheter
                      </h2>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Lukk oversikt"
                        title="Lukk oversikt"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <RoleRightsTable role="" />
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                        aria-label="Lukk oversikt"
                        title="Lukk oversikt"
                      >
                        Lukk
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Display HTTP messages */}
              {message && (
                <div
                  className="alert alert-info mt-3"
                  role="alert"
                  aria-live="polite"
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
