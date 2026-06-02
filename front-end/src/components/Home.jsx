import { Link } from 'react-router-dom';
import { useTheme } from './theme';
import './../styles/home.css';

const Home = () => {
  const { theme, toggleTheme } = useTheme(); 

  return (
    <div className="home-container">

      <header className="navbar">
        <h1 className="navbar-logo">FocusBalance</h1>
      
        <nav className="navbar-nav">
          <button 
            onClick={toggleTheme} 
            className="btn-theme-toggle" 
            title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '20px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <Link to="/login" className="link-login">
            Entrar
          </Link>
          <Link to="/register" className="btn-register">
            Cadastrar-se
          </Link>
        </nav>
      </header>

      <main className="hero">
        <h2 className="hero-title">
          Recupere o controle do seu tempo de tela
        </h2>
        <p className="hero-text">
          O FocusBalance ajuda você a monitorar seus hábitos digitais, estabelecer metas de redução de tela e aumentar drasticamente sua produtividade diária.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="btn-hero">
            Comece Agora (Gratuito)
          </Link>
        </div>
      </main>

      <section className="features">
        <div className="feature-card">
          <h3 className="feature-title">Análise de Uso</h3>
          <p className="feature-desc">
            Registre o tempo gasto em cada aplicativo e descubra exatamente para onde vai a sua atenção ao longo do dia.
          </p>
        </div>

        <div className="feature-card">
          <h3 className="feature-title">🎯 Defina Metas</h3>
          <p className="feature-desc">
            Crie limites de uso diário para aplicativos específicos e acabe com o ciclo de rolagem infinita e procrastinação.
          </p>
        </div>

        <div className="feature-card">
          <h3 className="feature-title">🏆 Gamificação</h3>
          <p className="feature-desc">
            Mantenha suas ofensivas (streaks) em alta e seja recompensado visualmente por cumprir suas metas de foco.
          </p>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 FocusBalance. Desenvolvido para transformar hábitos.</p>
      </footer>

    </div>
  );
};

export default Home;