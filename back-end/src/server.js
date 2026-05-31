const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const registroRoutes = require('./routes/registroRoutes');
const metaRoutes = require('./routes/metaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); // Faremos em seguida!

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.options('*', cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Definição dos caminhos base (Endpoints)
app.use('/api/auth', authRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/metas', metaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/perfil', require('./routes/perfilRoutes'));

// Rota de teste (Health Check) para ver se a API está no ar
app.get('/', (req, res) => {
    res.json({ mensagem: 'API do FocusBalance rodando com sucesso!' });
});

// Configuração da porta e inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;