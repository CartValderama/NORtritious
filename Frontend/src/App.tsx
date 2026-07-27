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
import "bootstrap/dist/css/bootstrap.min.css";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <NavMenu />
        <div className="content-wrap">
          <main className="main-content">
            <Container>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/calculator" element={<Calculator />} />
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
      </div>
    </Router>
  );
};

export default App;
