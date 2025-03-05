import React, { useState, useEffect } from "react";
import { Nav, Navbar, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../img/logo.jpg";
import "../css/NavMenu.css";
import API_URL from "../apiConfig";

const NavMenu: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const navigate = useNavigate(); // Bruk useNavigate her

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/account/get-user-info`,
          { withCredentials: true }
        );
        if (response.data) {
          setIsLoggedIn(true);
          setUsername(response.data.name); // Brukernavn fra API
          setProfilePicture(response.data.profilePicture); // Profilbilde fra API
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Kall til backend for å logge ut (f.eks. fjerne token eller session)
      await axios.post(
        `${API_URL}/api/account/logout`,
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      setUsername(""); // Tøm brukernavnet
      setProfilePicture(""); // Tøm profilbildet
      navigate("/account/login"); // Naviger tilbake til login-siden
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <Navbar bg="light" expand="lg" className="navbar-custom mb3">
      <Container className="d-flex justify-content-between align-items-center">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src={logo}
            className="img-logo img-fluid"
            alt="Fremtidsmat logo"
            style={{ height: "50px" }}
          />{" "}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link-custom">
              Hjem
            </Nav.Link>
            <Nav.Link as={Link} to="/products" className="nav-link-custom">
              Produkter
            </Nav.Link>
            {/*<Nav.Link as={Link} to="/calculator">Calculator</Nav.Link>*/}
          </Nav>
          <Nav className="ms-auto">
            {isLoggedIn ? (
              <>
                <Nav.Link
                  as={Link}
                  to="/account/profile"
                  className="d-flex align-items-center"
                >
                  <img
                    src={
                      profilePicture
                        ? `${API_URL}${profilePicture}`
                        : `${API_URL}/images/profile_pictures/male-placeholder-image.png`
                    }
                    alt="Profile picture"
                    className="rounded-circle object-fit-cover"
                    style={{
                      width: "30px",
                      height: "30px",
                      marginRight: "10px",
                    }}
                  />

                  {username}
                </Nav.Link>
                <Nav.Link as="button" onClick={handleLogout}>
                  Logout
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/account/login">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavMenu;
