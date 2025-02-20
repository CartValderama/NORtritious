import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Producer"); // Standardrolle
  const [message, setMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        await axios.get("https://localhost:7064/api/account/get-user-info", {
          withCredentials: true,
        });
        setIsLoggedIn(true);
      } catch (error) {
        //setMessage("Failed to check login status.");
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://localhost:7064/api/account/login",
        { email, password },
        { withCredentials: true }
      );

      setMessage("Login successful");
      setIsLoggedIn(true);
      navigate("/account/profile");
      window.location.reload();
    } catch (error) {
      setMessage("Login failed. Please check your credentials.");
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(
        "https://localhost:7064/api/account/register",
        { email, password, role }, // Sender valgt rolle
        { withCredentials: true }
      );

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
      await axios.post(
        "https://localhost:7064/api/account/logout",
        {},
        {
          withCredentials: true,
        }
      );
      setMessage("Logout successful");
      setIsLoggedIn(false);
    } catch (error) {
      setMessage("Logout failed. Please try again.");
    }
  };

  if (loading) {
    return <div>Laster...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">
                {isRegister ? "Registrering" : "Innlogging"}
              </h1>
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
                <form onSubmit={isRegister ? handleRegistration : handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Epost
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
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Passord
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {isRegister && (
                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">
                        Velg rolle
                      </label>
                      <select
                        className="form-select"
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="Producer">Producer</option>
                        <option value="Researcher">Researcher</option>
                      </select>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {isRegister ? "Registrer" : "Logg inn"}
                  </button>
                </form>
              )}
              <p className="mt-3">
                {isRegister ? (
                  <span>Allerede har en konto?</span>
                ) : (
                  <span>Trenger du en konto?</span>
                )}
                <button
                  className="btn btn-link"
                  onClick={() => setIsRegister(!isRegister)}
                >
                  {isRegister ? "Tilbake til innlogging" : "Registrering"}
                </button>
              </p>
              {message && (
                <div className="alert alert-danger mt-3">{message}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
