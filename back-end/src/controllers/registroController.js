// controllers/registroController.js
const db = require('../config/db');
const { ref, set, get, remove, update } = require("firebase/database");

// Função auxiliar para transformar a estrutura de objeto do Firebase na string que seu Front-end espera
const mapearRegistrosParaFront = (dataRegistro, dadosDoDia) => {
    const apps = dadosDoDia.apps || {};
    const observacoesString = Object.keys(apps)
        .map(nomeApp => `[${nomeApp}: ${apps[nomeApp]}m]`)
        .join(' + ');

    return {
        id: dataRegistro, // Usamos a própria data como ID único por dia do usuário
        data_registro: dataRegistro,
        tempo_total_minutos: dadosDoDia.tempo_total_minutos || 0,
        nivel_produtividade: dadosDoDia.nivel_produtividade || 3,
        observacoes: observacoesString
    };
};

// 1. CREATE / UPDATE (Antigo INSERT ON DUPLICATE KEY UPDATE)
exports.criar = async (req, res) => {
    try {
        const usuario_id = req.usuario.id; // Ex: "user_123"
        const { nome_app, tempo_minutos } = req.body;
        
        const data_registro = new Date().toISOString().split('T')[0]; // Ex: "2026-05-31"
        const nivel_produtividade = 3;

        // Caminho no Firebase: registros/usuario_id/data_registro
        const registroRef = ref(db, `registros/${usuario_id}/${data_registro}`);
        const snapshot = await get(registroRef);

        let dadosAtualizados = {
            tempo_total_minutos: parseInt(tempo_minutos, 10),
            nivel_produtividade: nivel_produtividade,
            apps: {
                [nome_app]: parseInt(tempo_minutos, 10)
            }
        };

        // Se o dia já existe, fazemos a soma (Equivalente ao ON DUPLICATE KEY)
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

// 2. READ: Listar os registros do usuário logado
exports.listar = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const usuarioRegistrosRef = ref(db, `registros/${usuarioId}`);
        const snapshot = await get(usuarioRegistrosRef);

        if (!snapshot.exists()) {
            return res.json([]);
        }

        const todosOsDias = snapshot.val(); // Retorna um objeto onde as chaves são as datas
        
        // Mapeia e transforma no formato de array que o MySQL entregava
        const registrosFormatados = Object.keys(todosOsDias).map(dataKey => {
            return mapearRegistrosParaFront(dataKey, todosOsDias[dataKey]);
        });

        // Ordena por data decrescente (mais recente primeiro)
        registrosFormatados.sort((a, b) => b.data_registro.localeCompare(a.data_registro));

        res.json(registrosFormatados);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar registros.' });
    }
};

// 3. UPDATE: Atualizar um registro existente
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params; // Aqui o id recebido será a data (ex: 2026-05-31)
        const { tempo_total_minutos, nivel_produtividade } = req.body;
        const usuarioId = req.usuario.id;

        const registroRef = ref(db, `registros/${usuarioId}/${id}`);
        const snapshot = await get(registroRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Registro não encontrado ou você não tem permissão.' });
        }

        // Atualiza apenas os campos gerais do dia
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

// 4. DELETE: Excluir um registro completo do dia
exports.excluir = async (req, res) => {
    try {
        const { id } = req.params; // Data do registro
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

// 5. EDITAR OU EXCLUIR APP ESPECÍFICO (Seu algoritmo, agora muito mais simples!)
exports.editarOuExcluirApp = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { registro_id, nome_app, novo_tempo, acao } = req.body; // registro_id é a data

        const registroRef = ref(db, `registros/${usuario_id}/${registro_id}`);
        const snapshot = await get(registroRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ erro: 'Registro não encontrado no banco de dados.' });
        }

        let dadosDoDia = snapshot.val();
        let apps = dadosDoDia.apps || {};

        // Remove o app alvo da lista do objeto de forma nativa e limpa
        if (apps[nome_app]) {
            delete apps[nome_app];
        }

        // Se a ação for editar, reinsere com o tempo atualizado
        if (acao === 'editar' && novo_tempo > 0) {
            apps[nome_app] = parseInt(novo_tempo, 10);
        }

        const chavesRestantes = Object.keys(apps);

        // Se não sobrou nenhum aplicativo no dia, deleta o nó daquela data por completo
        if (chavesRestantes.length === 0) {
            await remove(registroRef);
            return res.status(200).json({ mensagem: 'Último app removido, registro apagado.' });
        }

        // Recalcula o novo tempo total somando os apps que ficaram
        let novoTempoTotal = chavesRestantes.reduce((soma, key) => soma + apps[key], 0);

        // Atualiza o Firebase com a nova lista estruturada
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