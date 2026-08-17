import React, { useState, useEffect } from "react";
import { Nav, Navbar, Container } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/NavMenu.css";
import API_URL from "../apiConfig";
import { getUserInfo, logout } from "../services/accountService";

const NavMenu: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userInfo = await getUserInfo();
        if (userInfo) {
          setIsLoggedIn(true);
          setUsername(userInfo.name); // Brukernavn fra API
          setProfilePicture(userInfo.profilePicture); // Profilbilde fra API
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, [location.pathname]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUsername(""); // Tøm brukernavnet
      setProfilePicture(""); // Tøm profilbildet
      navigate("/account/login"); // Naviger tilbake til login-siden
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <Navbar bg="white" expand="lg" className="navbar-custom mb3">
      <Container className="d-flex justify-content-between align-items-center">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <span className="fw-semibold fs-5">NORtritious</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {location.pathname !== "/products/calculator-new" && (
              <>
                <Nav.Link as={Link} to="/" className="nav-link-custom">
                  Hjem
                </Nav.Link>
                <Nav.Link as={Link} to="/products" className="nav-link-custom">
                  Produkter
                </Nav.Link>
              </>
            )}
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
