// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Nossa conexão com o Firebase agora
const { ref, set, get, query, orderByChild, equalTo } = require("firebase/database");

// Função de Cadastro (CREATE)
exports.cadastro = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
        }

        const emailFormatado = email.toLowerCase().trim();

        // 1. Verifica se o e-mail já existe na árvore 'usuarios'
        const usuariosRef = ref(db, 'usuarios');
        const emailQuery = query(usuariosRef, orderByChild('email'), equalTo(emailFormatado));
        const snapshot = await get(emailQuery);

        if (snapshot.exists()) {
            return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
        }

        // 2. Criptografa a senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 3. Cria um ID único simulando o autoincremento (Ex: user_1717142400000)
        const novoUsuarioId = 'user_' + Date.now();

        // Dados padrão de um novo usuário para bater com seu banco antigo
        const novoUsuario = {
            id: novoUsuarioId,
            nome: nome,
            email: emailFormatado,
            senha: senhaHash,
            tipo_plano: 'gratuito', // Valor padrão simulando a coluna do MySQL
            streak_atual: 0,        // Valor padrão simulando a coluna do MySQL
            criadoEm: new Date().toISOString()
        };

        // Salva no Firebase no caminho 'usuarios/user_xxxx'
        await set(ref(db, `usuarios/${novoUsuarioId}`), novoUsuario);

        res.status(201).json({ 
            mensagem: 'Usuário cadastrado com sucesso!',
            usuarioId: novoUsuarioId 
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor ao cadastrar.' });
    }
};

// Função de Login
exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
        }

        const emailFormatado = email.toLowerCase().trim();

        // 1. Busca o usuário pelo e-mail usando Query
        const usuariosRef = ref(db, 'usuarios');
        const emailQuery = query(usuariosRef, orderByChild('email'), equalTo(emailFormatado));
        const snapshot = await get(emailQuery);

        if (!snapshot.exists()) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        // Como a query retorna uma lista de chaves, pegamos o primeiro resultado encontrado
        const chaves = Object.keys(snapshot.val());
        const usuarioId = chaves[0];
        const usuario = snapshot.val()[usuarioId];

        // 2. Compara a senha digitada com o Hash do banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        // 3. Gera o Token JWT usando o ID do Firebase
        const token = jwt.sign(
            { id: usuario.id, tipo_plano: usuario.tipo_plano },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Retorna o token e os dados básicos (escondendo a senha)
        res.json({
            mensagem: 'Login realizado com sucesso!',
            token: token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo_plano: usuario.tipo_plano || 'gratuito',
                streak_atual: usuario.streak_atual || 0
            }
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor ao fazer login.' });
    }
};