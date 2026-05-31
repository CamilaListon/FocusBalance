const db = require('../config/db');
const { ref, get, update, remove } = require("firebase/database");
const bcrypt = require('bcryptjs');

exports.obterPerfil = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const usuarioRef = ref(db, `usuarios/${usuario_id}`);
        const snapshot = await get(usuarioRef);
        
        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        const usuario = snapshot.val();
        
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

exports.atualizarPerfil = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { nome, email, foto_url, nova_senha } = req.body;

        const usuarioRef = ref(db, `usuarios/${usuario_id}`);
        
        let dadosAtualizados = {
            nome: nome,
            email: email.toLowerCase().trim(),
            foto_url: foto_url || ''
        };

        if (nova_senha && nova_senha.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(nova_senha, salt);
            dadosAtualizados.senha = senhaHash;
        }

        await update(usuarioRef, dadosAtualizados);

        res.status(200).json({ mensagem: 'Perfil updated com sucesso!' });
    } catch (erro) {
        console.error('Erro ao atualizar perfil:', erro);
        res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
    }
};

exports.deletarConta = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const registrosRef = ref(db, `registros/${usuario_id}`);
        await remove(registrosRef);
        
        const usuarioRef = ref(db, `usuarios/${usuario_id}`);
        await remove(usuarioRef);

        res.status(200).json({ mensagem: 'Conta e dados excluídos para sempre.' });
    } catch (erro) {
        console.error('Erro ao excluir conta:', erro);
        res.status(500).json({ erro: 'Erro ao excluir a conta.' });
    }
};