const db = require('../config/db');

// 1. CREATE: Criar um novo registro diário
exports.criar = async (req, res) => {
    // Pegamos uma conexão dedicada para usar Transação (garante que tudo salva ou nada salva)
    const conexao = await db.getConnection();
    
    try {
        const { data_registro, tempo_total_minutos, nivel_produtividade, observacoes, aplicativos } = req.body;
        const usuarioId = req.usuario.id; // Vem do authMiddleware!

        await conexao.beginTransaction();

        // 1. Salva o registro principal
        const [resultadoRegistro] = await conexao.query(
            `INSERT INTO registros (usuario_id, data_registro, tempo_total_minutos, nivel_produtividade, observacoes) 
             VALUES (?, ?, ?, ?, ?)`,
            [usuarioId, data_registro, tempo_total_minutos, nivel_produtividade, observacoes]
        );

        const registroId = resultadoRegistro.insertId;

        // 2. Se o usuário enviou a lista de apps, salvamos eles vinculados a este registro
        if (aplicativos && aplicativos.length > 0) {
            const valoresApps = aplicativos.map(app => [
                registroId, 
                app.nome_app, 
                app.tempo_uso_minutos
            ]);
            
            // Inserção em massa (muito mais rápido e profissional)
            await conexao.query(
                `INSERT INTO aplicativos (registro_id, nome_app, tempo_uso_minutos) VALUES ?`,
                [valoresApps]
            );
        }

        await conexao.commit();
        res.status(201).json({ mensagem: 'Registro salvo com sucesso!', id: registroId });

    } catch (erro) {
        await conexao.rollback(); // Se der erro, desfaz tudo para não sujar o banco
        console.error(erro);
        
        // Verifica se o erro é a trava de 1 registro por dia (UNIQUE KEY do MySQL)
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ erro: 'Você já tem um registro para esta data. Edite-o em vez de criar outro.' });
        }
        res.status(500).json({ erro: 'Erro ao salvar o registro.' });
    } finally {
        conexao.release(); // Libera a conexão de volta pro banco
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