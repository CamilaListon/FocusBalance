const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Nossa conexão com o MySQL

// Função de Cadastro (CREATE)
exports.cadastro = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // 1. Verifica se o e-mail já existe no banco
        const [usuariosExistentes] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (usuariosExistentes.length > 0) {
            return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
        }

        // 2. Criptografa a senha (NUNCA salvar senha em texto limpo)
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 3. Salva no banco de dados
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senhaHash]
        );

        res.status(201).json({ 
            mensagem: 'Usuário cadastrado com sucesso!',
            usuarioId: resultado.insertId 
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

        // 1. Busca o usuário pelo e-mail
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarios.length === 0) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const usuario = usuarios[0];

        // 2. Compara a senha digitada com o Hash do banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        // 3. Gera o Token JWT (O passaporte do usuário)
        // Colocamos o ID e o plano dentro do token para facilitar verificações futuras
        const token = jwt.sign(
            { id: usuario.id, tipo_plano: usuario.tipo_plano },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token expira em 7 dias
        );

        // 4. Retorna o token e os dados básicos (escondendo a senha)
        res.json({
            mensagem: 'Login realizado com sucesso!',
            token: token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo_plano: usuario.tipo_plano,
                streak_atual: usuario.streak_atual
            }
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro interno no servidor ao fazer login.' });
    }
};