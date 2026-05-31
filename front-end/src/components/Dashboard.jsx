import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormRegister from './Form-register';
import './../styles/dashboard.css'; 

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
      const response = await api.get('/dashboard');
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
      await api.put('/registros/app', {
        registro_id: registroId,
        nome_app: nomeApp,
        novo_tempo: novoTempo,
        acao: acao
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
        <div key={index} className="app-detail-item">
          <span className="app-detail-text">• {nome}: {tempo} minutos</span>
          <div>
            <button
              onClick={() => handleEditarApp(registroId, nome, tempo)}
              className="btn-inline-action"
              title="Editar tempo"
            >✏️</button>
            <button
              onClick={() => handleExcluirApp(registroId, nome)}
              className="btn-inline-action"
              title="Excluir app"
            >🗑️</button>
          </div>
        </div>
      ));
    }

    return observacao;
  };

  if (loading) return <div className="dash-loading">Carregando seu painel...</div>;
  if (erro) return <div className="dash-error">{erro}</div>;

  const usuarioStorage = JSON.parse(localStorage.getItem('@FocusBalance:usuario') || '{}');
  const nomeExibicao = usuarioStorage.nome || dados?.usuario_nome || 'Visitante';

  return (
    <div className="dash-container">

      {/* Cabeçalho */}
      <header className="dash-header">
        <h2>Olá, {nomeExibicao}! 👋</h2>
        <div className="header-actions">
          <button onClick={() => navigate('/perfil')} className="btn-profile">
            ⚙️ Meu Perfil
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      {/* Cartões de Estatísticas */}
      <section className="cards-grid">
        <div className="stat-card">
          <h4>🔥 Streak Atual</h4>
          <p className="stat-value streak">{dados?.streak_atual} dias</p>
        </div>
        <div className="stat-card">
          <h4>⏱️ Média Diária</h4>
          <p className="stat-value media">{dados?.media_diaria_minutos} min</p>
        </div>
        <div className="stat-card">
          <h4>📱 App Mais Usado</h4>
          <p className="stat-value app">{dados?.app_mais_utilizado || 'Nenhum'}</p>
        </div>
        <div className="stat-card">
          <h4>📅 Dias Registrados</h4>
          <p className="stat-value dias">{dados?.total_dias_registrados}</p>
        </div>
      </section>

      <FormRegister aoAdicionar={buscarDadosDashboard} />

      {/* Histórico */}
      <section className="history-section">
        <h3>📅 Histórico de Registros</h3>

        {dados?.historico && dados.historico.length > 0 ? (
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tempo Total Diário</th>
                  <th>Detalhes dos Apps</th>
                </tr>
              </thead>
              <tbody>
                {dados.historico.map((registro, index) => {
                  const dataFormatada = new Date(registro.data_registro).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

                  return (
                    <tr key={index}>
                      <td className="td-date">{dataFormatada}</td>
                      <td className="td-total-time">{registro.tempo_total_minutos} min</td>
                      <td>
                        {formatarDetalhesApps(registro.observacoes, registro.id)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-history">Nenhum registro encontrado. Comece a adicionar seu tempo de tela acima!</p>
        )}
      </section>

    </div>
  );
};

export default Dashboard;