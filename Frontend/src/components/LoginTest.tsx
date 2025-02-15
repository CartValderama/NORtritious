import React, { useState } from "react";
import axios from "axios";
//import { Link } from "react-router-dom";

const LoginTest: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await axios.post<{ message: string }>(
        "http://localhost:5047/api/account/login",
        { email, password },
        { withCredentials: true }
      );
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Innlogging feilet");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5047/api/account/logout",
        {},
        { withCredentials: true }
      );
      setMessage("Du har blitt logget ut");
    } catch (err: any) {
      setError("Utlogging feilet");
    }
  };

  const checkAdminRole = async () => {
    try {
      const token = localStorage.getItem("token"); // For eksempel, henter tokenet fra localStorage
      const response = await axios.get<{ message: string }>(
        "http://localhost:5047/api/account/admin-role-test",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Sender Bearer-tokenet med forespørselen
          },
          withCredentials: true,
        }
      );
      setIsAdmin(true);
      setMessage(response.data.message);
    } catch (err: any) {
      setIsAdmin(false);
      setError("Feil ved sjekk av admin-rolle: " + err.response?.data?.message);
    }
  };

  return (
    <div className="container">
      <h1 className="h1">Login Test</h1>
      <form className="mb-4">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Epost
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <label htmlFor="password" className="form-label">
          Passord
        </label>
        <input
          type="password"
          className="form-control mb-4"
          id="password"
          placeholder="Passord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          onClick={handleLogin}
          className="btn btn-primary me-2"
          disabled={loading}
        >
          {loading ? "Laster..." : "Logg inn"}
        </button>
        <button type="submit" onClick={handleLogout} className="btn btn-danger">
          Logg ut
        </button>
      </form>

      {message && (
        <div className="mt-2 alert alert-success" role="alert">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-2 alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <h2 className="h2">Tilgangskontroll for Admin-rolle</h2>
      <button onClick={checkAdminRole} className="btn btn-outline-primary">
        Sjekk admin-rolle
      </button>
      {isAdmin !== null && (
        <p className="mt-4">
          {isAdmin ? (
            <div className="mt-2 alert alert-success">"Brukeren er admin"</div>
          ) : (
            <div className="mt-2 alert alert-danger">
              "Brukeren er ikke admin"
            </div>
          )}
        </p>
      )}
    </div>
  );
};

export default LoginTest;
