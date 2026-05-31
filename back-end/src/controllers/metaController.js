const db = require('../config/db');
const { ref, push, set, get, update, remove } = require("firebase/database");

exports.criar = async (req, res) => {
    try {
        const { nome_app, limite_diario_minutos, objetivo_descricao } = req.body;
        const usuarioId = req.usuario.id;

        if (!limite_diario_minutos) {
            return res.status(400).json({ erro: 'O limite diário de minutos é obrigatório.' });
        }

        const metasUsuarioRef = ref(db, `metas/${usuarioId}`);
        
        const novaMetaRef = push(metasUsuarioRef);
        const novaMetaId = novaMetaRef.key;

        const novaMeta = {
            id: novaMetaId,
            nome_app: nome_app || null,
            limite_diario_minutos: parseInt(limite_diario_minutos, 10),
            objetivo_descricao: objetivo_descricao || null,
            ativa: true,
            criado_em: new Date().toISOString()
        };

        await set(novaMetaRef, novaMeta);

        res.status(201).json({ 
            mensagem: 'Meta criada com sucesso!', 
            id: novaMetaId 
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao criar a meta.' });
    }
};

exports.listar = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const metasUsuarioRef = ref(db, `metas/${usuarioId}`);
        const snapshot = await get(metasUsuarioRef);

        if (!snapshot.exists()) {
            return res.json([]);
        }

        const dadosMetas = snapshot.val();
        
        const listaMetas = Object.keys(dadosMetas).map(metaId => dadosMetas[metaId]);

        listaMetas.sort((a, b) => {
            if (a.ativa !== b.ativa) {
                return a.ativa ? -1 : 1;
            }
            return b.criado_em.localeCompare(a.criado_em);
        });

        res.json(listaMetas);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar as metas.' });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_app, limite_diario_minutos, objetivo_descricao, ativa } = req.body;
        const usuarioId = req.usuario.id;

        const metaRef = ref(db, `metas/${usuarioId}/${id}`);
        const snapshot = await get(metaRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Meta não encontrada ou você não tem permissão para editá-la.' });
        }

        const dadosAtualizados = {
            nome_app: nome_app || null,
            limite_diario_minutos: parseInt(limite_diario_minutos, 10),
            objetivo_descricao: objetivo_descricao || null,
            ativa: ativa !== undefined ? ativa : true
        };

        await update(metaRef, dadosAtualizados);

        res.json({ mensagem: 'Meta updated com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar a meta.' });
    }
};

exports.excluir = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;

        const metaRef = ref(db, `metas/${usuarioId}/${id}`);
        const snapshot = await get(metaRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Meta não encontrada ou você não tem permissão para excluí-la.' });
        }

        await remove(metaRef);

        res.json({ mensagem: 'Meta excluída com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao excluir a meta.' });
    }
};