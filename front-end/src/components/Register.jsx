import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Usando Axios em vez de fetch

const Register = () => {
  // 1. Controle de Estados
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
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
    setSucesso('');

    // Validação de senhas no front-end
    if (formData.senha !== formData.confirmarSenha) {
      return setErro('As senhas não coincidem!');
    }

    setLoading(true);

    try {
      // Usando Axios: mais limpo e envia JSON automaticamente
      const response = await axios.post('http://localhost:3000/api/auth/cadastro', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha
      });

      // Se chegou aqui, o back-end retornou status 201 (Sucesso)
      setSucesso(response.data.mensagem || 'Conta criada com sucesso! Redirecionando...');
      
      // Limpa o formulário e redireciona após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      // O Axios guarda a resposta de erro do back-end dentro de err.response.data
      if (err.response && err.response.data && err.response.data.erro) {
        setErro(err.response.data.erro); // Exibe o erro exato do back-end (ex: E-mail já em uso)
      } else {
        setErro('Erro no servidor. Verifique se a API está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Renderização
  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Criar Conta - FocusBalance</h2>
      <p>Junte-se a nós e comece a controlar seu tempo de tela.</p>

      {/* Alertas de Feedback */}
      {erro && <div style={{ color: '#D8000C', backgroundColor: '#FFBABA', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{erro}</div>}
      {sucesso && <div style={{ color: '#4F8A10', backgroundColor: '#DFF2BF', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{sucesso}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nome Completo:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>E-mail:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            minLength="6"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirmar Senha:</label>
          <input
            type="password"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px', 
            backgroundColor: loading ? '#ccc' : '#007BFF', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Já tem uma conta? <Link to="/login" style={{ color: '#007BFF', textDecoration: 'none' }}>Faça Login aqui</Link>
      </p>
    </div>
  );
};

export default Register;