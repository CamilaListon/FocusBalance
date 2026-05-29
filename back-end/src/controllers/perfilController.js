const db = require('../config/db');
const bcrypt = require('bcrypt');

// 1. Buscar os dados atuais do usuário
exports.obterPerfil = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const [rows] = await db.execute('SELECT nome, email, foto_url FROM usuarios WHERE id = ?', [usuario_id]);
        
        if (rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        
        res.status(200).json(rows[0]);
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

        // Atualiza os dados básicos
        await db.execute(
            'UPDATE usuarios SET nome = ?, email = ?, foto_url = ? WHERE id = ?',
            [nome, email, foto_url || '', usuario_id]
        );

        // Se o usuário digitou uma nova senha, atualizamos ela também
        if (nova_senha && nova_senha.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(nova_senha, salt);
            await db.execute('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaHash, usuario_id]);
        }

        res.status(200).json({ mensagem: 'Perfil atualizado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao atualizar perfil:', erro);
        res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
    }
};

// 3. Deletar a conta (e todos os registros atrelados a ela)
exports.deletarConta = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        // Primeiro deletamos o histórico para não dar erro de chave estrangeira
        await db.execute('DELETE FROM registros WHERE usuario_id = ?', [usuario_id]);
        
        // Depois deletamos o usuário
        await db.execute('DELETE FROM usuarios WHERE id = ?', [usuario_id]);

        res.status(200).json({ mensagem: 'Conta e dados excluídos para sempre.' });
    } catch (erro) {
        console.error('Erro ao excluir conta:', erro);
        res.status(500).json({ erro: 'Erro ao excluir a conta.' });
    }
};