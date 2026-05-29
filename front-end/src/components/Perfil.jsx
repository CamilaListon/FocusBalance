import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Perfil = () => {
  const [dados, setDados] = useState({ nome: '', email: '', foto_url: '', nova_senha: '' });
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const token = localStorage.getItem('@FocusBalance:token');
        if (!token) return navigate('/login');

        const res = await axios.get('http://localhost:3000/api/perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDados({ ...res.data, nova_senha: '' }); // Mantém a senha em branco na tela
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
      const token = localStorage.getItem('@FocusBalance:token');
      await axios.put('http://localhost:3000/api/perfil', dados, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Atualiza o nome salvo no navegador para o Header do Dashboard continuar certo
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
        const token = localStorage.getItem('@FocusBalance:token');
        await axios.delete('http://localhost:3000/api/perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        localStorage.removeItem('@FocusBalance:token');
        localStorage.removeItem('@FocusBalance:usuario');
        navigate('/'); // Joga pra tela inicial após deletar
      } catch (err) {
        setMensagem({ texto: 'Erro ao excluir conta.', tipo: 'erro' });
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Meu Perfil ⚙️</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 15px', cursor: 'pointer' }}>
          Voltar ao Dashboard
        </button>
      </div>

      {mensagem.texto && (
        <div style={{ padding: '10px', marginBottom: '20px', borderRadius: '4px', backgroundColor: mensagem.tipo === 'sucesso' ? '#d4edda' : '#f8d7da', color: mensagem.tipo === 'sucesso' ? '#155724' : '#721c24' }}>
          {mensagem.texto}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img 
          src={dados.foto_url || 'https://via.placeholder.com/150'} 
          alt="Avatar" 
          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #007BFF' }} 
        />
      </div>

      <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          Nome:
          <input type="text" name="nome" value={dados.nome || ''} onChange={handleChange} required style={{ padding: '10px', marginTop: '5px' }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          E-mail:
          <input type="email" name="email" value={dados.email || ''} onChange={handleChange} required style={{ padding: '10px', marginTop: '5px' }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          URL da Foto de Perfil (Opcional):
          <input type="text" name="foto_url" value={dados.foto_url || ''} onChange={handleChange} placeholder="https://site.com/sua-foto.jpg" style={{ padding: '10px', marginTop: '5px' }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          Nova Senha (deixe em branco para não alterar):
          <input type="password" name="nova_senha" value={dados.nova_senha || ''} onChange={handleChange} placeholder="Digite a nova senha" style={{ padding: '10px', marginTop: '5px' }} />
        </label>

        <button type="submit" style={{ padding: '12px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
          Salvar Alterações
        </button>
      </form>

      <hr style={{ margin: '30px 0' }} />

      <div style={{ backgroundColor: '#fff3f3', padding: '20px', borderRadius: '8px', border: '1px solid #ffcccc', textAlign: 'center' }}>
        <h4 style={{ color: '#dc3545', marginTop: 0 }}>Zona de Perigo</h4>
        <p style={{ color: '#666', fontSize: '14px' }}>Ao excluir sua conta, todos os seus dados e históricos serão apagados permanentemente.</p>
        <button onClick={handleDeletarConta} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Excluir Minha Conta
        </button>
      </div>

    </div>
  );
};

export default Perfil;