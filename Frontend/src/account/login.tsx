import React, { useState, useEffect } from "react";
import axios from "axios";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Static list of roles
  const roles = ["Producer", "Researcher"];

  useEffect(() => {
    // Check if the user is already logged in when the component mounts
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5047/api/account/check-login",
          { withCredentials: true }
        );
        if (response.data.isLoggedIn) {
          setIsLoggedIn(true);
          await checkAdminRole(); // Check if the user is an admin
        }
      } catch (error) {
        setMessage("Failed to check login status.");
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
        "http://localhost:5047/api/account/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      setMessage("Login successful");
      setIsLoggedIn(true);
      await checkAdminRole(); // Check if the user is an admin
    } catch (error) {
      setMessage("Login failed. Please check your credentials.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5047/api/account/register",
        {
          email,
          password,
          role,
        }
      );
      setMessage(response.data.message);
      // Automatically log in the user after successful registration
      await handleLogin(e);
    } catch (error) {
      setMessage("Registration failed. Please try again.");
    }
  };

  const checkAdminRole = async () => {
    try {
      const response = await axios.get<{ message: string }>(
        "http://localhost:5047/api/account/admin-role-test",
        { withCredentials: true }
      );
      setIsAdmin(true);
      setMessage(response.data.message);
    } catch (err: any) {
      setIsAdmin(false);
      setError("You are not Admin.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5047/api/account/logout",
        {},
        { withCredentials: true }
      );
      setMessage("Logout successful");
      setIsLoggedIn(false);
      setIsAdmin(false);
    } catch (error) {
      setMessage("Logout failed. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">
                {isRegister ? "Register" : "Login"}
              </h1>
              {isLoggedIn ? (
                <div>
                  <p>Welcome! You are logged in.</p>
                  <button
                    className="btn btn-secondary mt-3"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <form onSubmit={isRegister ? handleRegister : handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
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
                      Password
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
                        Role
                      </label>
                      <select
                        className="form-select"
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select a role
                        </option>
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {isRegister ? "Register" : "Login"}
                  </button>
                </form>
              )}
              <p className="mt-3">
                {isRegister ? "Already have an account?" : "Need an account?"}
                <button
                  className="btn btn-link"
                  onClick={() => setIsRegister(!isRegister)}
                >
                  {isRegister ? "Login" : "Register"}
                </button>
              </p>
              {message && (
                <div className="alert alert-info mt-3">{message}</div>
              )}
              {error && <div className="alert alert-warning mt-3">{error}</div>}
              {isAdmin && (
                <div className="alert alert-success mt-3">
                  You are an admin!
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
