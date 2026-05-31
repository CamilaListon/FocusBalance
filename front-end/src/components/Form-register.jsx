import { useState } from 'react';
import axios from 'axios';
import './../styles/form-register.css';
const FormRegister = ({ aoAdicionar }) => {
  const [formData, setFormData] = useState({
    aplicativo: '',
    tempoGasto: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ texto: '', tipo: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ texto: '', tipo: '' });
    setLoading(true);

    const token = localStorage.getItem('@FocusBalance:token');

    try {
      await axios.post('http://localhost:3000/api/registros', {
        nome_app: formData.aplicativo,
        tempo_minutos: Number(formData.tempoGasto),
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setFeedback({ texto: 'Tempo registrado com sucesso! 📊', tipo: 'sucesso' });
      setFormData({ aplicativo: '', tempoGasto: '' });
      
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

  return (
    <div className="form-register-card">
      <h3>Registrar Uso de App</h3>
      
      {feedback.texto && (
        <div className={`form-feedback ${feedback.tipo}`}>
          {feedback.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="inline-form">
        <div className="input-group-app">
          <label htmlFor="aplicativo">Qual aplicativo?</label>
          <input
            type="text"
            id="aplicativo"
            name="aplicativo"
            value={formData.aplicativo}
            onChange={handleChange}
            required
            placeholder="Ex: Instagram, TikTok"
            className="register-input"
          />
        </div>

        <div className="input-group-time">
          <label htmlFor="tempoGasto">Tempo (minutos)</label>
          <input
            type="number"
            id="tempoGasto"
            name="tempoGasto"
            value={formData.tempoGasto}
            onChange={handleChange}
            required
            min="1"
            placeholder="Ex: 45"
            className="register-input"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="btn-add-register"
        >
          {loading ? 'Salvando...' : '+ Adicionar'}
        </button>
      </form>
    </div>
  );
};

export default FormRegister;