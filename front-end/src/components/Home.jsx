import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', margin: '0', padding: '0', color: '#333' }}>
      
      {/* Cabeçalho de Navegação (Navbar) */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '20px 40px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #e9ecef',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#007BFF' }}>FocusBalance</h1>
        
        <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
            Entrar
          </Link>
          <Link to="/register" style={{ 
            textDecoration: 'none', 
            backgroundColor: '#007BFF', 
            color: 'white', 
            padding: '8px 15px', 
            borderRadius: '4px', 
            fontWeight: 'bold' 
          }}>
            Cadastrar-se
          </Link>
        </nav>
      </header>

      {/* Destaque Principal (Hero Section) */}
      <main style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '48px', marginBottom: '20px', color: '#1a1a1a' }}>
          Recupere o controle do seu tempo de tela
        </h2>
        <p style={{ fontSize: '20px', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
          O FocusBalance ajuda você a monitorar seus hábitos digitais, estabelecer metas de redução de tela e aumentar drasticamente sua produtividade diária.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="/register" style={{ 
            textDecoration: 'none', 
            backgroundColor: '#28a745', 
            color: 'white', 
            padding: '15px 30px', 
            borderRadius: '8px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            Comece Agora (Gratuito)
          </Link>
        </div>
      </main>

      {/* Seção de Funcionalidades (Features) */}
      <section style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '60px 20px', 
        backgroundColor: '#f8f9fa', 
        flexWrap: 'wrap', 
        gap: '40px' 
      }}>
        <div style={{ maxWidth: '300px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', color: '#007BFF', marginBottom: '15px' }}>📊 Monitore o Uso</h3>
          <p style={{ color: '#555', lineHeight: '1.5' }}>
            Registre o tempo gasto em cada aplicativo e descubra exatamente para onde vai a sua atenção ao longo do dia.
          </p>
        </div>
        
        <div style={{ maxWidth: '300px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', color: '#007BFF', marginBottom: '15px' }}>🎯 Defina Metas</h3>
          <p style={{ color: '#555', lineHeight: '1.5' }}>
            Crie limites de uso diário para aplicativos específicos e acabe com o ciclo de rolagem infinita e procrastinação.
          </p>
        </div>
        
        <div style={{ maxWidth: '300px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', color: '#007BFF', marginBottom: '15px' }}>🏆 Gamificação</h3>
          <p style={{ color: '#555', lineHeight: '1.5' }}>
            Mantenha suas ofensivas (streaks) em alta e seja recompensado visualmente por cumprir suas metas de foco.
          </p>
        </div>
      </section>

      {/* Rodapé Simples */}
      <footer style={{ textAlign: 'center', padding: '20px', color: '#888', borderTop: '1px solid #e9ecef' }}>
        <p>&copy; 2026 FocusBalance. Desenvolvido para transformar hábitos.</p>
      </footer>
      
    </div>
  );
};

export default Home;