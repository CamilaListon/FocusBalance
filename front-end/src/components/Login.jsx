import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  // 1. Controle de Estados
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 2. Função para atualizar os dados do formulário
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Função disparada ao enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // Fazendo a requisição para a nossa API de Login
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: formData.email,
        senha: formData.senha
      });

      // Se o login for um sucesso, a API devolve o Token e os dados do usuário
      const { token, usuario } = response.data;

      // 4. Salvando os dados no Local Storage para usar no resto do app
      localStorage.setItem('@FocusBalance:token', token);
      localStorage.setItem('@FocusBalance:usuario', JSON.stringify(usuario));

      // 5. Redirecionando para a área logada (ex: Dashboard)
      navigate('/dashboard');

    } catch (err) {
      // Tratamento de erro (ex: Senha incorreta ou e-mail não existe)
      if (err.response && err.response.data && err.response.data.erro) {
        setErro(err.response.data.erro);
      } else {
        setErro('Erro de conexão com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 6. Estrutura Visual
  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#007BFF', marginBottom: '10px' }}>Bem-vindo de volta!</h2>
        <p style={{ color: '#666' }}>Acesse sua conta do FocusBalance</p>
      </div>

      {/* Alerta de Erro */}
      {erro && (
        <div style={{ color: '#D8000C', backgroundColor: '#FFBABA', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>E-mail:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Senha:</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            placeholder="Sua senha secreta"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            marginTop: '10px',
            padding: '12px', 
            backgroundColor: loading ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Ainda não tem uma conta? <Link to="/register" style={{ color: '#007BFF', textDecoration: 'none' }}>Cadastre-se</Link>
      </p>
    </div>
  );
};

export default Login;