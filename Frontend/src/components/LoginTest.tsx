import React, { useState, } from "react";
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
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Login Test</h1>
      <input
        type="email"
        placeholder="E-post"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="password"
        placeholder="Passord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />

      <br/>
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
        disabled={loading}
      >
        {loading ? "Laster..." : "Logg inn"}
      </button>

      &ensp;

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded mb-2"
      >
        Logg ut
      </button>

      &ensp;

      <button
        onClick={checkAdminRole}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Sjekk admin-rolle
      </button>

      {message && <p className="text-green-500 mt-4">{message}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {isAdmin !== null && (
        <p className="mt-4">
          {isAdmin ? "Brukeren er admin" : "Brukeren er ikke admin"}
        </p>
      )}

    </div>
  );
};

export default LoginTest;
