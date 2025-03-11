import LoginTest from "./components/LoginTest"; // Hvis den ligger i src/components
//import GetProducts from "./components/GetProducts";
import Calculator from "./Calculator";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Container from "react-bootstrap/Container";
import NavMenu from "./shared/NavMenu";
import HomePage from "./home/HomePage";
import LoginPage from "./account/login";
import ProductListPage from "./products/ProductListPage";
import "./App.css";
import ProfilePage from "./account/profile";
import ProductDetails from "./products/ProductDetails";
import CalculatorUpdate from "./CalculatorUpdate";
import "bootstrap/dist/css/bootstrap.min.css";

//    <LoginTest />
//    <GetProducts />
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
                <Route path="/login" element={<LoginTest />} />
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
