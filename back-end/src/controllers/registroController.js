const db = require('../config/db');

exports.criar = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { nome_app, tempo_minutos } = req.body;
        
        // Data atual
        const data_registro = new Date().toISOString().split('T')[0];
        
        // Formata a observação
        const observacoes = `[${nome_app}: ${tempo_minutos}m]`;
        const nivel_produtividade = 3; 

        // O SEGREDO ESTÁ AQUI: Se o dia já existir, ele soma o tempo e concatena os apps!
        const query = `
            INSERT INTO registros (usuario_id, data_registro, tempo_total_minutos, nivel_produtividade, observacoes) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                tempo_total_minutos = tempo_total_minutos + VALUES(tempo_total_minutos),
                observacoes = CONCAT(observacoes, ' + ', VALUES(observacoes))
        `;
        
        const valores = [usuario_id, data_registro, tempo_minutos, nivel_produtividade, observacoes];

        const [resultado] = await db.execute(query, valores);

        res.status(201).json({ mensagem: 'Tempo registrado com sucesso!', id: resultado.insertId });

    } catch (erro) {
        console.error('Erro ao criar registro:', erro);
        res.status(500).json({ erro: 'Erro interno ao salvar no banco de dados.' });
    }
};

// 2. READ: Listar os registros do usuário logado
exports.listar = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const [registros] = await db.query(
            `SELECT id, data_registro, tempo_total_minutos, nivel_produtividade, observacoes 
             FROM registros 
             WHERE usuario_id = ? 
             ORDER BY data_registro DESC`,
            [usuarioId]
        );

        res.json(registros);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar registros.' });
    }
};

// 3. UPDATE: Atualizar um registro existente
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { tempo_total_minutos, nivel_produtividade, observacoes } = req.body;
        const usuarioId = req.usuario.id;

        // O "AND usuario_id = ?" é essencial para evitar que um hacker edite o registro de outra pessoa
        const [resultado] = await db.query(
            `UPDATE registros 
             SET tempo_total_minutos = ?, nivel_produtividade = ?, observacoes = ? 
             WHERE id = ? AND usuario_id = ?`,
            [tempo_total_minutos, nivel_produtividade, observacoes, id, usuarioId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Registro não encontrado ou você não tem permissão.' });
        }

        res.json({ mensagem: 'Registro atualizado com sucesso!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar registro.' });
    }
};

// 4. DELETE: Excluir um registro
exports.excluir = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;

        // Graças ao "ON DELETE CASCADE" que configuramos no MySQL, 
        // deletar isso vai automaticamente deletar os aplicativos vinculados na outra tabela!
        const [resultado] = await db.query(
            `DELETE FROM registros WHERE id = ? AND usuario_id = ?`,
            [id, usuarioId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Registro não encontrado ou você não tem permissão.' });
        }

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

        // Busca o registro diretamente pelo ID único
        const [rows] = await db.execute(
            'SELECT id, observacoes FROM registros WHERE id = ? AND usuario_id = ?',
            [registro_id, usuario_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Registro não encontrado no banco de dados.' });
        }

        const registroId = rows[0].id;
        let observacaoAtual = rows[0].observacoes || '';
        let apps = [];

        if (observacaoAtual.includes('[')) {
            const parts = observacaoAtual.split(' + ');
            parts.forEach(p => {
                const clean = p.replace(/\[|\]/g, '');
                const [nome, tempoStr] = clean.split(':');
                if (nome && tempoStr) {
                    apps.push({ 
                        nome: nome.trim(), 
                        tempo: parseInt(tempoStr.replace('m','').trim(), 10) 
                    });
                }
            });
        }

        // Remove o aplicativo modificado
        apps = apps.filter(a => a.nome.toLowerCase() !== nome_app.toLowerCase());

        // Se for edição, adiciona ele de volta com o novo tempo
        if (acao === 'editar' && novo_tempo > 0) {
            const nomeFormatado = nome_app.charAt(0).toUpperCase() + nome_app.slice(1).toLowerCase();
            apps.push({ nome: nomeFormatado, tempo: novo_tempo });
        }

        // Se não sobrar mais nenhum app, deleta o registro inteiro daquele dia
        if (apps.length === 0) {
            await db.execute('DELETE FROM registros WHERE id = ?', [registroId]);
            return res.status(200).json({ mensagem: 'Último app removido, registro apagado.' });
        }

        // Se ainda tem apps, recalcula e atualiza
        let novoTempoTotal = 0;
        let novaObservacao = apps.map(a => {
            novoTempoTotal += a.tempo;
            return `[${a.nome}: ${a.tempo}m]`;
        }).join(' + ');

        await db.execute(
            'UPDATE registros SET observacoes = ?, tempo_total_minutos = ? WHERE id = ?',
            [novaObservacao, novoTempoTotal, registroId]
        );

        res.status(200).json({ mensagem: 'App atualizado com sucesso!' });

    } catch (erro) {
        // Se der erro, ele vai imprimir AQUI no terminal do seu VS Code
        console.error('Erro exato no Back-end:', erro);
        res.status(500).json({ erro: 'Erro interno ao atualizar.' });
    }
};