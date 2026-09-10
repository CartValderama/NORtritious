import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import NavMenu from "./components/NavMenu";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/login";
import ProductListPage from "./pages/ProductListPage";
import "./App.css";
import ProfilePage from "./pages/profile";
import ProductDetails from "./pages/ProductDetails";
import Calculator from "./pages/Calculator";
import "bootstrap/dist/css/bootstrap.min.css";

const AppRoutes: React.FC = () => {
  return (
    <div className="app-container">
      <NavMenu />
      <main className="main-content flex-grow-1 d-flex flex-column">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route
            path="/products/calculator"
            element={<Calculator />}
          />
          <Route
            path="/products/calculator/:productId"
            element={<Calculator />}
          />
          <Route
            path="/products/details/:productId"
            element={<ProductDetails />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="account/login" element={<LoginPage />} />
          <Route path="account/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
