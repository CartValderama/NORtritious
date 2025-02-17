import React from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from "../img/logo.jpg";

//import LoginTest from '../components/LoginTest';
//import '../css/NavMenu.css';

const NavMenu: React.FC = () => {
  return (
    <Navbar bg="light" expand="lg" className='navbar-custom mb3'>
      <Container>
          <Navbar.Brand as={Link} to="/">
          <img src={logo} className="img-logo img-fluid" alt="Logo" />{" "}
          </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/products">Products</Nav.Link>
            <Nav.Link as={Link} to="/calculator">Calculator</Nav.Link>
            <Nav.Link as={Link} to="/account/login">Login</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
      
    </Navbar>
  );
};

export default NavMenu;