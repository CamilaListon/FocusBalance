import { useState } from 'react';
import axios from 'axios';

const FormRegister = ({ aoAdicionar }) => {
  // 1. Estados para o aplicativo e o tempo
  const [formData, setFormData] = useState({
    aplicativo: '',
    tempoGasto: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ texto: '', tipo: '' });

  // 2. Atualiza os campos
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Envia o registro para a API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ texto: '', tipo: '' });
    setLoading(true);

    // Pega o token para provar quem está salvando o registro
    const token = localStorage.getItem('@FocusBalance:token');

    try {
      await axios.post('http://localhost:3000/api/registros', {
        nome_app: formData.aplicativo,
        tempo_minutos: Number(formData.tempoGasto),
        // A data o back-end geralmente pega a atual por padrão
      }, {
        headers: {
          Authorization: `Bearer ${token}` // Passaporte do usuário
        }
      });

      // Sucesso!
      setFeedback({ texto: 'Tempo registrado com sucesso! 📊', tipo: 'sucesso' });
      setFormData({ aplicativo: '', tempoGasto: '' }); // Limpa os campos
      
      // Se o Dashboard passou uma função para atualizar os gráficos, nós a chamamos
      if (aoAdicionar) {
        aoAdicionar();
      }

    } catch (err) {
      console.error(err);
      setFeedback({ texto: 'Erro ao salvar o registro. Tente novamente.', tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  // 4. Interface
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, color: '#333' }}>Registrar Uso de App</h3>
      
      {feedback.texto && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          borderRadius: '4px',
          backgroundColor: feedback.tipo === 'sucesso' ? '#DFF2BF' : '#FFBABA',
          color: feedback.tipo === 'sucesso' ? '#4F8A10' : '#D8000C'
        }}>
          {feedback.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>Qual aplicativo?</label>
          <input
            type="text"
            name="aplicativo"
            value={formData.aplicativo}
            onChange={handleChange}
            required
            placeholder="Ex: Instagram, TikTok"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>Tempo (minutos):</label>
          <input
            type="number"
            name="tempoGasto"
            value={formData.tempoGasto}
            onChange={handleChange}
            required
            min="1"
            placeholder="Ex: 45"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            height: '40px'
          }}
        >
          {loading ? 'Salvando...' : '+ Adicionar'}
        </button>
      </form>
    </div>
  );
};

export default FormRegister;