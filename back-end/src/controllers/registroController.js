const db = require('../config/db');
const { ref, set, get, remove, update } = require("firebase/database");

const mapearRegistrosParaFront = (dataRegistro, dadosDoDia) => {
    const apps = dadosDoDia.apps || {};
    const observacoesString = Object.keys(apps)
        .map(nomeApp => `[${nomeApp}: ${apps[nomeApp]}m]`)
        .join(' + ');

    return {
        id: dataRegistro,
        data_registro: dataRegistro,
        tempo_total_minutos: dadosDoDia.tempo_total_minutos || 0,
        nivel_produtividade: dadosDoDia.nivel_produtividade || 3,
        observacoes: observacoesString
    };
};

exports.criar = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { nome_app, tempo_minutos } = req.body;
        
        const data_registro = new Date().toISOString().split('T')[0];
        const nivel_produtividade = 3;

        const registroRef = ref(db, `registros/${usuario_id}/${data_registro}`);
        const snapshot = await get(registroRef);

        let dadosAtualizados = {
            tempo_total_minutos: parseInt(tempo_minutos, 10),
            nivel_produtividade: nivel_produtividade,
            apps: {
                [nome_app]: parseInt(tempo_minutos, 10)
            }
        };

        if (snapshot.exists()) {
            const dadosAtuais = snapshot.val();
            const tempoAppAntigo = dadosAtuais.apps?.[nome_app] || 0;

            dadosAtualizados.tempo_total_minutos = (dadosAtuais.tempo_total_minutos || 0) + parseInt(tempo_minutos, 10);
            dadosAtualizados.apps = {
                ...dadosAtuais.apps,
                [nome_app]: tempoAppAntigo + parseInt(tempo_minutos, 10)
            };
        }

        await set(registroRef, dadosAtualizados);
        res.status(201).json({ mensagem: 'Tempo registrado com sucesso!', id: data_registro });

    } catch (erro) {
        console.error('Erro ao criar registro:', erro);
        res.status(500).json({ erro: 'Erro interno ao salvar no banco de dados.' });
    }
};

exports.listar = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const usuarioRegistrosRef = ref(db, `registros/${usuarioId}`);
        const snapshot = await get(usuarioRegistrosRef);

        if (!snapshot.exists()) {
            return res.json([]);
        }

        const todosOsDias = snapshot.val();
        
        const registrosFormatados = Object.keys(todosOsDias).map(dataKey => {
            return mapearRegistrosParaFront(dataKey, todosOsDias[dataKey]);
        });

        registrosFormatados.sort((a, b) => b.data_registro.localeCompare(a.data_registro));

        res.json(registrosFormatados);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar registros.' });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { tempo_total_minutos, nivel_produtividade } = req.body;
        const usuarioId = req.usuario.id;

        const registroRef = ref(db, `registros/${usuarioId}/${id}`);
        const snapshot = await get(registroRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Registro não encontrado ou você não tem permissão.' });
        }

        await update(registroRef, {
            tempo_total_minutos: parseInt(tempo_total_minutos, 10),
            nivel_produtividade: parseInt(nivel_produtividade, 10)
        });

        res.json({ mensagem: 'Registro atualizado com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar registro.' });
    }
};

exports.excluir = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;

        const registroRef = ref(db, `registros/${usuarioId}/${id}`);
        const snapshot = await get(registroRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Registro não encontrado ou você não tem permissão.' });
        }

        await remove(registroRef);
        res.json({ mensagem: 'Registro excluído com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao excluir registro.' });
    }
};

exports.editarOuExcluirApp = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { registro_id, nome_app, novo_tempo, acao } = req.body;

        const registroRef = ref(db, `registros/${usuario_id}/${registro_id}`);
        const snapshot = await get(registroRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Registro não encontrado no banco de dados.' });
        }

        let dadosDoDia = snapshot.val();
        let apps = dadosDoDia.apps || {};

        if (apps[nome_app]) {
            delete apps[nome_app];
        }

        if (acao === 'editar' && novo_tempo > 0) {
            apps[nome_app] = parseInt(novo_tempo, 10);
        }

        const chavesRestantes = Object.keys(apps);

        if (chavesRestantes.length === 0) {
            await remove(registroRef);
            return res.status(200).json({ mensagem: 'Último app removido, registro apagado.' });
        }

        let novoTempoTotal = chavesRestantes.reduce((soma, key) => soma + apps[key], 0);

        await update(registroRef, {
            apps: apps,
            tempo_total_minutos: novoTempoTotal
        });

        res.status(200).json({ mensagem: 'App atualizado com sucesso!' });

    } catch (erro) {
        console.error('Erro exato no Back-end:', erro);
        res.status(500).json({ erro: 'Erro interno ao atualizar.' });
    }
};