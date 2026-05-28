const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const registroRoutes = require('./routes/registroRoutes');
const metaRoutes = require('./routes/metaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); // Faremos em seguida!

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json()); // Permite receber dados no formato JSON

// Definição dos caminhos base (Endpoints)
app.use('/api/auth', authRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/metas', metaRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de teste (Health Check) para ver se a API está no ar
app.get('/', (req, res) => {
    res.json({ mensagem: 'API do FocusBalance rodando com sucesso!' });
});

// Configuração da porta e inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});