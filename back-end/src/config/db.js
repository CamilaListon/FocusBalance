const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão assim que o arquivo é chamado
pool.getConnection()
    .then(conexao => {
        console.log('Banco de dados MySQL conectado com sucesso ao FocusBalance!');
        conexao.release(); // Libera a conexão de volta para o pool
    })
    .catch(erro => {
        console.error('Erro crítico ao conectar no banco de dados:', erro.message);
    });

module.exports = pool;