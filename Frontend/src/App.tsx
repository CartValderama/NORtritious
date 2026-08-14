import Calculator from "./pages/Calculator";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Container from "react-bootstrap/Container";
import NavMenu from "./components/NavMenu";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/login";
import ProductListPage from "./pages/ProductListPage";
import "./App.css";
import ProfilePage from "./pages/profile";
import ProductDetails from "./pages/ProductDetails";
import CalculatorUpdate from "./pages/CalculatorUpdate";
import CalculatorV2 from "./pages/CalculatorV2";
import CalculatorV3 from "./pages/CalculatorV3";
import "bootstrap/dist/css/bootstrap.min.css";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <NavMenu />

        <main className="main-content flex-grow-1">
          <Container className="d-flex flex-column flex-grow-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/calculator" element={<Calculator />} />
              <Route
                path="/products/calculator-v2"
                element={<CalculatorV2 />}
              />
              <Route
                path="/products/calculator-v3"
                element={<CalculatorV3 />}
              />
              <Route
                path="/products/calculatorUpdate/:productId"
                element={<CalculatorUpdate />}
              />
              <Route
                path="/products/details/:productId"
                element={<ProductDetails />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="account/login" element={<LoginPage />} />
              <Route path="account/profile" element={<ProfilePage />} />
            </Routes>
          </Container>
        </main>
      </div>
    </Router>
  );
};

export default App;
