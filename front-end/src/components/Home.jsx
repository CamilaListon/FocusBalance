import { Link } from 'react-router-dom';
import './../styles/home.css';

const Home = () => {
  return (
    <div className="home-container">
      
      {/* Cabeçalho de Navegação (Navbar) */}
      <header className="navbar">
        <h1 className="navbar-logo">FocusBalance</h1>
        
        <nav className="navbar-nav">
          <Link to="/login" className="link-login">
            Entrar
          </Link>
          <Link to="/register" className="btn-register">
            Cadastrar-se
          </Link>
        </nav>
      </header>

      {/* Destaque Principal (Hero Section) */}
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

      {/* Seção de Funcionalidades (Features) */}
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

      {/* Rodapé Simples */}
      <footer className="footer">
        <p>&copy; 2026 FocusBalance. Desenvolvido para transformar hábitos.</p>
      </footer>
      
    </div>
  );
};

export default Home;