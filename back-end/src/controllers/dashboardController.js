const db = require('../config/db');

exports.obterResumo = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const [registros] = await db.execute(
            'SELECT id, data_registro, tempo_total_minutos, observacoes FROM registros WHERE usuario_id = ? ORDER BY data_registro DESC',
            [usuario_id]
        );

        if (registros.length === 0) {
            return res.status(200).json({
                streak_atual: 0,
                media_diaria_minutos: 0,
                app_mais_utilizado: 'Nenhum',
                total_dias_registrados: 0,
                historico: [] 
            });
        }

        let somaTotalMinutos = 0;
        const appCounts = {};

        registros.forEach(reg => {
            somaTotalMinutos += Number(reg.tempo_total_minutos);

            if (reg.observacoes) {
                const regex = /\[([^:]+):\s*(\d+)m\]/g;
                let match;
                while ((match = regex.exec(reg.observacoes)) !== null) {
                    const nomeRaw = match[1].trim();
                    // O SEGREDO AQUI: Padroniza o nome para não duplicar no cálculo
                    const appName = nomeRaw.charAt(0).toUpperCase() + nomeRaw.slice(1).toLowerCase();
                    const time = parseInt(match[2], 10);
                    
                    appCounts[appName] = (appCounts[appName] || 0) + time;
                }
            }
        });

        const total_dias_registrados = registros.length;
        const media_diaria_minutos = Math.round(somaTotalMinutos / total_dias_registrados);

        let app_mais_utilizado = 'Nenhum';
        let maxTime = 0;
        for (const [app, time] of Object.entries(appCounts)) {
            if (time > maxTime) { 
                maxTime = time; 
                app_mais_utilizado = app; 
            }
        }

        let streak_atual = 1;
        for (let i = 0; i < registros.length - 1; i++) {
            const dataAtual = new Date(registros[i].data_registro);
            const dataAnterior = new Date(registros[i+1].data_registro);
            const diffDays = Math.round(Math.abs(dataAtual - dataAnterior) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak_atual++;
            } else {
                break;
            }
        }

        res.status(200).json({
            streak_atual,
            media_diaria_minutos,
            app_mais_utilizado,
            total_dias_registrados,
            historico: registros 
        });

    } catch (erro) {
        console.error('Erro no Dashboard:', erro);
        res.status(500).json({ erro: 'Erro interno ao carregar o dashboard.' });
    }
};