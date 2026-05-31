// src/components/Perfil.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './../styles/perfil.css';

const Perfil = () => {
  const [dados, setDados] = useState({ nome: '', email: '', foto_url: '', nova_senha: '' });
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const token = localStorage.getItem('@FocusBalance:token');
        if (!token) return navigate('/login');

        const res = await api.get('/perfil');
        setDados({ ...res.data, nova_senha: '' });
      } catch (err) {
        console.error(err);
        setMensagem({ texto: 'Erro ao carregar perfil.', tipo: 'erro' });
      }
    };
    buscarDados();
  }, [navigate]);

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      await api.put('/perfil', dados);
      
      const usuarioStorage = JSON.parse(localStorage.getItem('@FocusBalance:usuario') || '{}');
      usuarioStorage.nome = dados.nome;
      localStorage.setItem('@FocusBalance:usuario', JSON.stringify(usuarioStorage));

      setMensagem({ texto: 'Perfil atualizado com sucesso!', tipo: 'sucesso' });
    } catch (err) {
      setMensagem({ texto: 'Erro ao salvar alterações.', tipo: 'erro' });
    }
  };

  const handleDeletarConta = async () => {
    const confirmacao = window.confirm(
      'ALERTA VERMELHO: Tem certeza? Isso apagará sua conta e todo o seu histórico para sempre!'
    );

    if (confirmacao) {
      try {
        await api.delete('/perfil');
        
        localStorage.removeItem('@FocusBalance:token');
        localStorage.removeItem('@FocusBalance:usuario');
        navigate('/');
      } catch (err) {
        setMensagem({ texto: 'Erro ao excluir conta.', tipo: 'erro' });
      }
    }
  };

  return (
    <div className="profile-container">
      
      <header className="profile-header">
        <h2>Meu Perfil ⚙️</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          Voltar ao Dashboard
        </button>
      </header>

      {mensagem.texto && (
        <div className={`profile-alert ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}

      <div className="avatar-section">
        <img 
          src={dados.foto_url || 'https://via.placeholder.com/150'} 
          alt="Avatar do Usuário" 
          className="avatar-image"
        />
      </div>

      <form onSubmit={handleSalvar} className="profile-form">
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="nome">Nome</label>
          <input 
            type="text" 
            id="nome"
            name="nome" 
            value={dados.nome || ''} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="email">E-mail</label>
          <input 
            type="email" 
            id="email"
            name="email" 
            value={dados.email || ''} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="foto_url">URL da Foto de Perfil (Opcional)</label>
          <input 
            type="text" 
            id="foto_url"
            name="foto_url" 
            value={dados.foto_url || ''} 
            onChange={handleChange} 
            placeholder="https://site.com/sua-foto.jpg" 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="nova_senha">Nova Senha (deixe em branco para não alterar)</label>
          <input 
            type="password" 
            id="nova_senha"
            name="nova_senha" 
            value={dados.nova_senha || ''} 
            onChange={handleChange} 
            placeholder="Digite a nova senha" 
          />
        </div>

        <button type="submit" className="btn-save">
          Salvar Alterações
        </button>
      </form>

      <hr className="profile-divider" />

      <section className="danger-zone">
        <h4>Zona de Perigo</h4>
        <p>Ao excluir sua conta, todos os seus dados e históricos serão apagados permanentemente de nossos servidores.</p>
        <button onClick={handleDeletarConta} className="btn-delete">
          Excluir Minha Conta
        </button>
      </section>

    </div>
  );
};

export default Perfil;