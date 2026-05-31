// controllers/perfilController.js
const db = require('../config/db'); // Conexão com o Firebase
const { ref, get, update, remove } = require("firebase/database");
const bcrypt = require('bcryptjs'); // Mantendo o padrão do bcryptjs do seu pacote

// 1. Buscar os dados atuais do usuário
exports.obterPerfil = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        // Aponta direto para o nó do usuário específico
        const usuarioRef = ref(db, `usuarios/${usuario_id}`);
        const snapshot = await get(usuarioRef);
        
        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        const usuario = snapshot.val();
        
        // Retorna apenas o que o front-end precisa (escondendo a senha)
        res.status(200).json({
            nome: usuario.nome,
            email: usuario.email,
            foto_url: usuario.foto_url || ''
        });
    } catch (erro) {
        console.error('Erro ao buscar perfil:', erro);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};

// 2. Atualizar os dados do usuário
exports.atualizarPerfil = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { nome, email, foto_url, nova_senha } = req.body;

        const usuarioRef = ref(db, `usuarios/${usuario_id}`);
        
        // Monta o objeto de atualização com os dados básicos
        let dadosAtualizados = {
            nome: nome,
            email: email.toLowerCase().trim(),
            foto_url: foto_url || ''
        };

        // Se o usuário digitou uma nova senha, gera o hash e anexa ao objeto
        if (nova_senha && nova_senha.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(nova_senha, salt);
            dadosAtualizados.senha = senhaHash;
        }

        // O método update altera apenas os campos enviados sem apagar o resto do nó
        await update(usuarioRef, dadosAtualizados);

        res.status(200).json({ mensagem: 'Perfil updated com sucesso!' });
    } catch (erro) {
        console.error('Erro ao atualizar perfil:', erro);
        res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
    }
};

// 3. Deletar a conta (e todos os registros atrelados a ela)
exports.deletarConta = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        // 1. Deleta o histórico de registros do usuário
        const registrosRef = ref(db, `registros/${usuario_id}`);
        await remove(registrosRef);
        
        // 2. Deleta as informações cadastrais do usuário
        const usuarioRef = ref(db, `usuarios/${usuario_id}`);
        await remove(usuarioRef);

        res.status(200).json({ mensagem: 'Conta e dados excluídos para sempre.' });
    } catch (erro) {
        console.error('Erro ao excluir conta:', erro);
        res.status(500).json({ erro: 'Erro ao excluir a conta.' });
    }
};