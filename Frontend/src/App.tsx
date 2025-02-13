import LoginTest from "./components/LoginTest"; // Hvis den ligger i src/components
import GetProducts from "./components/GetProducts";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import NavMenu from './shared/NavMenu';

  //    <LoginTest />
  //    <GetProducts />
function App() {
  return (
        <Router>
        <div className='app-container'>

        <NavMenu />
        <div className='content-wrap'>
              <main className='main-content'>

        <Container>

          <Routes>
          <Route path="/products" element={<GetProducts />} />
            <Route path="/login" element={<LoginTest />} />
            <Route path="*" element={<Navigate to="/" replace/>} />
          </Routes>
          </Container>
              </main>
        </div>
        </div>  

        </Router>
      
  );
}

export default App;
