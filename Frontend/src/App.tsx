import LoginTest from "./components/LoginTest"; // Hvis den ligger i src/components
import GetProducts from "./components/GetProducts";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';

  //    <LoginTest />
  //    <GetProducts />
function App() {
  return (
    <div className="App">
      <Container>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginTest />} />
            <Route path="/products" element={<GetProducts />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </Container>
      
    </div>
  );
}

export default App;
