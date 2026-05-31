import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './../styles/register.css';

const Register = () => {
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (formData.senha !== formData.confirmarSenha) {
      return setErro('As senhas não coincidem!');
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/cadastro', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha
      });

      setSucesso(response.data.mensagem || 'Conta criada com sucesso! Redirecionando...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.erro) {
        setErro(err.response.data.erro);
      } else {
        setErro('Erro no servidor. Verifique se a API está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        
        <div className="register-header">
          <h2>Criar Conta</h2>
          <p>Junte-se ao FocusBalance e comece a controlar seu tempo de tela de forma saudável.</p>
        </div>

        {/* Alertas de Feedback */}
        {erro && <div className="alert alert-error">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="form-input"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Ex: João Silva"
            />
          </div>

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
              minLength="6"
              placeholder="No mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              name="confirmarSenha"
              className="form-input"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
              placeholder="Digite a senha novamente"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-submit"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="register-footer">
          Já tem uma conta? <Link to="/login">Faça Login aqui</Link>
        </p>
        
      </div>
    </div>
  );
};

export default Register;