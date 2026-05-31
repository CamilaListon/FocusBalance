import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './../styles/login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        senha: formData.senha
      });

      const { token, usuario } = response.data;

      localStorage.setItem('@FocusBalance:token', token);
      localStorage.setItem('@FocusBalance:usuario', JSON.stringify(usuario));

      navigate('/dashboard');

    } catch (err) {
      if (err.response && err.response.data && err.response.data.erro) {
        setErro(err.response.data.erro);
      } else {
        setErro('Erro de conexão com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        
        <div className="login-header">
          <h2>Bem-vindo de volta!</h2>
          <p>Acesse sua conta do FocusBalance</p>
        </div>

        {/* Alerta de Erro */}
        {erro && (
          <div className="error-alert">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              className="form-input"
              value={formData.senha}
              onChange={handleChange}
              required
              placeholder="Sua senha secreta"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-submit"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="login-footer">
          Ainda não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
        
      </div>
    </div>
  );
};

export default Login;