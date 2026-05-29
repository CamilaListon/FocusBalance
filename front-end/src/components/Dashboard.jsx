import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormRegister from './Form-register';

const Dashboard = () => {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const buscarDadosDashboard = async () => {
    const token = localStorage.getItem('@FocusBalance:token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDados(response.data);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar os dados. Sua sessão pode ter expirado.');
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('@FocusBalance:token');
        localStorage.removeItem('@FocusBalance:usuario');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDadosDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('@FocusBalance:token');
    localStorage.removeItem('@FocusBalance:usuario');
    navigate('/');
  };

  const atualizarAppNoBanco = async (registroId, nomeApp, novoTempo, acao) => {
    try {
      const token = localStorage.getItem('@FocusBalance:token');
      await axios.put('http://localhost:3000/api/registros/app', {
        registro_id: registroId, // <-- Agora mandamos o ID!
        nome_app: nomeApp,
        novo_tempo: novoTempo,
        acao: acao
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      buscarDadosDashboard();
    } catch (error) {
      console.error(error);
      alert('Erro ao processar sua solicitação.');
    }
  };

  const handleEditarApp = (registroId, nomeApp, tempoAtual) => {
    const novoTempo = prompt(`Qual o novo tempo (em minutos) para o app ${nomeApp}?`, tempoAtual);
    if (novoTempo === null || novoTempo === "") return;

    const tempoNum = parseInt(novoTempo, 10);
    if (isNaN(tempoNum) || tempoNum <= 0) {
      alert("Por favor, insira um tempo válido maior que zero.");
      return;
    }
    atualizarAppNoBanco(registroId, nomeApp, tempoNum, 'editar');
  };

  const handleExcluirApp = (registroId, nomeApp) => {
    if (window.confirm(`Tem certeza que deseja excluir o registro do app ${nomeApp}?`)) {
      atualizarAppNoBanco(registroId, nomeApp, 0, 'excluir');
    }
  };

  const formatarDetalhesApps = (observacao, registroId) => {
    if (!observacao) return '-';

    if (observacao.includes('[')) {
      const apps = observacao.split(' + ');
      const somaApps = {};

      apps.forEach(appString => {
        const textoLimpo = appString.replace(/\[|\]/g, '');
        const partes = textoLimpo.split(':');

        if (partes.length === 2) {
          const nomeRaw = partes[0].trim();
          const nomeApp = nomeRaw.charAt(0).toUpperCase() + nomeRaw.slice(1).toLowerCase();
          const tempo = parseInt(partes[1].replace('m', '').trim(), 10);
          somaApps[nomeApp] = (somaApps[nomeApp] || 0) + tempo;
        }
      });

      return Object.entries(somaApps).map(([nome, tempo], index) => (
        <div key={index} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ minWidth: '150px' }}>• {nome}: {tempo} minutos</span>
          <button
            onClick={() => handleEditarApp(registroId, nome, tempo)}
            style={{ cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '16px' }}
            title="Editar tempo"
          >✏️</button>
          <button
            onClick={() => handleExcluirApp(registroId, nome)}
            style={{ cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '16px' }}
            title="Excluir app"
          >🗑️</button>
        </div>
      ));
    }

    return observacao;
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Carregando seu painel...</div>;
  if (erro) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{erro}</div>;

  const usuarioStorage = JSON.parse(localStorage.getItem('@FocusBalance:usuario') || '{}');
  const nomeExibicao = usuarioStorage.nome || dados?.usuario_nome || 'Visitante';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '10px', borderBottom: '1px solid #ccc' }}>
        <h2>Olá, {nomeExibicao}! 👋</h2>
        {/* Substitua o botão de sair atual por estes dois botões lado a lado */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/perfil')}
            style={{ padding: '8px 15px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            ⚙️ Meu Perfil
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Cartões de Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>🔥 Streak Atual</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff8c00', margin: 0 }}>{dados?.streak_atual} dias</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>⏱️ Média Diária</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007BFF', margin: 0 }}>{dados?.media_diaria_minutos} min</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>📱 App Mais Usado</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>{dados?.app_mais_utilizado || 'Nenhum'}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>📅 Dias Registrados</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1', margin: 0 }}>{dados?.total_dias_registrados}</p>
        </div>
      </div>

      <FormRegister aoAdicionar={buscarDadosDashboard} />

      {/* Histórico */}
      <div style={{ marginTop: '40px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>📅 Histórico de Registros</h3>

        {dados?.historico && dados.historico.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ccc' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#555' }}>Data</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#555' }}>Tempo Total Diário</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#555' }}>Detalhes dos Apps</th>
                </tr>
              </thead>
              <tbody>
                {dados.historico.map((registro, index) => {
                  const dataFormatada = new Date(registro.data_registro).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{dataFormatada}</td>
                      <td style={{ padding: '12px', color: '#007BFF', fontWeight: 'bold' }}>{registro.tempo_total_minutos} min</td>
                      <td style={{ padding: '12px', color: '#666' }}>
                        {formatarDetalhesApps(registro.observacoes, registro.id)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#777' }}>Nenhum registro encontrado. Comece a adicionar seu tempo de tela acima!</p>
        )}
      </div>

    </div>
  );
};

export default Dashboard;