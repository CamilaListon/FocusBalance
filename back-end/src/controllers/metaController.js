// controllers/metaController.js
const db = require('../config/db'); // Conexão com o Firebase
const { ref, push, set, get, update, remove } = require("firebase/database");

// 1. CREATE: Criar uma nova meta
exports.criar = async (req, res) => {
    try {
        const { nome_app, limite_diario_minutos, objetivo_descricao } = req.body;
        const usuarioId = req.usuario.id;

        if (!limite_diario_minutos) {
            return res.status(400).json({ erro: 'O limite diário de minutos é obrigatório.' });
        }

        // Aponta para o nó de metas do usuário
        const metasUsuarioRef = ref(db, `metas/${usuarioId}`);
        
        // push() gera uma nova chave única no nó (simulando o ID autoincremento)
        const novaMetaRef = push(metasUsuarioRef);
        const novaMetaId = novaMetaRef.key;

        const novaMeta = {
            id: novaMetaId,
            nome_app: nome_app || null,
            limite_diario_minutos: parseInt(limite_diario_minutos, 10),
            objetivo_descricao: objetivo_descricao || null,
            ativa: true, // Padrão ativa como true no cadastro
            criado_em: new Date().toISOString()
        };

        // Salva os dados na referência recém-criada
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

// 2. READ: Listar todas as metas do usuário logado
exports.listar = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const metasUsuarioRef = ref(db, `metas/${usuarioId}`);
        const snapshot = await get(metasUsuarioRef);

        if (!snapshot.exists()) {
            return res.json([]);
        }

        const dadosMetas = snapshot.val();
        
        // Transforma o objeto do Firebase em um array para o front-end
        const listaMetas = Object.keys(dadosMetas).map(metaId => dadosMetas[metaId]);

        // Ordena: Ativas primeiro (true vem antes de false no sort booleano invertido) 
        // e depois por data de criação decrescente
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

// 3. UPDATE: Atualizar uma meta
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params; // ID único gerado pelo push()
        const { nome_app, limite_diario_minutos, objetivo_descricao, ativa } = req.body;
        const usuarioId = req.usuario.id;

        const metaRef = ref(db, `metas/${usuarioId}/${id}`);
        const snapshot = await get(metaRef);

        // Se o nó não existir para aquele usuário específico, barra a alteração
        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Meta não encontrada ou você não tem permissão para editá-la.' });
        }

        const dadosAtualizados = {
            nome_app: nome_app || null,
            limite_diario_minutos: parseInt(limite_diario_minutos, 10),
            objetivo_descricao: objetivo_descricao || null,
            ativa: ativa !== undefined ? ativa : true
        };

        // Atualiza apenas as propriedades enviadas sem afetar o resto (como o criado_em)
        await update(metaRef, dadosAtualizados);

        res.json({ mensagem: 'Meta updated com sucesso!' });
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

        const metaRef = ref(db, `metas/${usuarioId}/${id}`);
        const snapshot = await get(metaRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Meta não encontrada ou você não tem permissão para excluí-la.' });
        }

        // Remove o nó permanentemente do Firebase
        await remove(metaRef);

        res.json({ mensagem: 'Meta excluída com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao excluir a meta.' });
    }
};