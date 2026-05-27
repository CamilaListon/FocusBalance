import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route 
          path="*" 
          element={
            <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
              <h2>Erro 404</h2>
              <p>Página não encontrada.</p>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;