import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  // 1. Estados
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  // 2. Efeito colateral (Roda assim que a tela abre)
  useEffect(() => {
    const carregarDashboard = async () => {
      const token = localStorage.getItem('@FocusBalance:token');

      // Se não tem token, bloqueia a entrada e manda pro login
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Envia o token no "Cabeçalho" (Header) da requisição, como um passaporte
        const response = await axios.get('http://localhost:3000/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setDados(response.data);
      } catch (err) {
        console.error(err);
        setErro('Erro ao carregar os dados. Sua sessão pode ter expirado.');
        // Se o token for inválido/expirado, limpamos tudo e forçamos o login
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('@FocusBalance:token');
          localStorage.removeItem('@FocusBalance:usuario');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    carregarDashboard();
  }, [navigate]);

  // 3. Função de Logout
  const handleLogout = () => {
    localStorage.removeItem('@FocusBalance:token');
    localStorage.removeItem('@FocusBalance:usuario');
    navigate('/');
  };

  // 4. Telas de Carregamento e Erro
  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Carregando seu painel...</div>;
  if (erro) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{erro}</div>;

  // 5. Interface Principal (Quando os dados chegam com sucesso)
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Cabeçalho do Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '10px', borderBottom: '1px solid #ccc' }}>
        <h2>Olá, {dados?.usuario_nome}! 👋</h2>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>

      {/* Grid de Cartões de Estatísticas (Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>🔥 Streak Atual</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff8c00', margin: 0 }}>
            {dados?.streak_atual} dias
          </p>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>⏱️ Média Diária</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007BFF', margin: 0 }}>
            {dados?.media_diaria_minutos} min
          </p>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>📱 App Mais Usado</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>
            {dados?.app_mais_utilizado || 'Nenhum ainda'}
          </p>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>📅 Dias Registrados</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1', margin: 0 }}>
            {dados?.total_dias_registrados}
          </p>
        </div>

      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <p style={{ margin: 0, textAlign: 'center', color: '#555' }}>
          Em breve: Aqui você poderá visualizar os gráficos detalhados e adicionar novos registros diários!
        </p>
      </div>

    </div>
  );
};

export default Dashboard;