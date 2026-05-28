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