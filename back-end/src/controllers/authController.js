// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { ref, set, get } = require("firebase/database"); // Removeu query, orderByChild, equalTo

// Função de Cadastro
exports.cadastro = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
        }

        const emailFormatado = email.toLowerCase().trim();
        // Substitui pontos por underline para criar uma chave válida no Firebase (ex: joao_gmail_com)
        const emailChave = emailFormatado.replace(/\./g, '_'); 

        // 1. Busca direta pela chave (Muito mais rápido e não precisa de Query/Índice)
        const usuarioRef = ref(db, `usuarios/${emailChave}`);
        const snapshot = await get(usuarioRef);

        if (snapshot.exists()) {
            return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const novoUsuario = {
            id: emailChave, // O próprio e-mail tratado vira o ID unico
            nome: nome,
            email: emailFormatado,
            senha: senhaHash,
            tipo_plano: 'gratuito',
            streak_atual: 0,
            criadoEm: new Date().toISOString()
        };

        await set(ref(db, `usuarios/${emailChave}`), novoUsuario);

        res.status(201).json({ 
            mensagem: 'Usuário cadastrado com sucesso!',
            usuarioId: emailChave 
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
        const emailChave = emailFormatado.replace(/\./g, '_');

        // 1. Busca direta instantânea pela rota da chave
        const usuarioRef = ref(db, `usuarios/${emailChave}`);
        const snapshot = await get(usuarioRef);

        if (!snapshot.exists()) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const usuario = snapshot.val();

        // 2. Compara a senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        // 3. Gera o Token JWT
        const token = jwt.sign(
            { id: usuario.id, tipo_plano: usuario.tipo_plano },
            process.env.JWT_SECRET || 'fallback_secret_local', // Evita quebrar se esquecer o env local
            { expiresIn: '7d' }
        );

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