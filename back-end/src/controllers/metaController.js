const db = require('../config/db');

// 1. CREATE: Criar uma nova meta
exports.criar = async (req, res) => {
    try {
        const { nome_app, limite_diario_minutos, objetivo_descricao } = req.body;
        const usuarioId = req.usuario.id; // Pegamos do token (authMiddleware)

        if (!limite_diario_minutos) {
            return res.status(400).json({ erro: 'O limite diário de minutos é obrigatório.' });
        }

        const [resultado] = await db.query(
            `INSERT INTO metas (usuario_id, nome_app, limite_diario_minutos, objetivo_descricao) 
             VALUES (?, ?, ?, ?)`,
            [usuarioId, nome_app || null, limite_diario_minutos, objetivo_descricao || null]
        );

        res.status(201).json({ 
            mensagem: 'Meta criada com sucesso!', 
            id: resultado.insertId 
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao criar a meta.' });
    }
};

// 2. READ: Listar todas as metas do usuário logado
exports.listar = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        // Traz as metas ativas primeiro, depois as inativas, ordenadas pela mais recente
        const [metas] = await db.query(
            `SELECT id, nome_app, limite_diario_minutos, objetivo_descricao, ativa, criado_em 
             FROM metas 
             WHERE usuario_id = ? 
             ORDER BY ativa DESC, criado_em DESC`,
            [usuarioId]
        );

        res.json(metas);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar as metas.' });
    }
};

// 3. UPDATE: Atualizar uma meta (editar limite, descrição ou desativar/ativar)
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_app, limite_diario_minutos, objetivo_descricao, ativa } = req.body;
        const usuarioId = req.usuario.id;

        const [resultado] = await db.query(
            `UPDATE metas 
             SET nome_app = ?, limite_diario_minutos = ?, objetivo_descricao = ?, ativa = ? 
             WHERE id = ? AND usuario_id = ?`,
            [nome_app || null, limite_diario_minutos, objetivo_descricao || null, ativa, id, usuarioId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Meta não encontrada ou você não tem permissão para editá-la.' });
        }

        res.json({ mensagem: 'Meta atualizada com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar a meta.' });
    }
};

// 4. DELETE: Excluir uma meta permanentemente
exports.excluir = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;

        const [resultado] = await db.query(
            `DELETE FROM metas WHERE id = ? AND usuario_id = ?`,
            [id, usuarioId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Meta não encontrada ou você não tem permissão para excluí-la.' });
        }

        res.json({ mensagem: 'Meta excluída com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao excluir a meta.' });
    }
};