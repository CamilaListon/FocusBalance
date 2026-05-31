const db = require('../config/db');
const { ref, get } = require("firebase/database");

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

exports.obterResumo = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const usuarioRegistrosRef = ref(db, `registros/${usuario_id}`);
        const snapshot = await get(usuarioRegistrosRef);

        if (!snapshot.exists()) {
            return res.status(200).json({
                streak_atual: 0,
                media_diaria_minutos: 0,
                app_mais_utilizado: 'Nenhum',
                total_dias_registrados: 0,
                historico: [] 
            });
        }

        const todosOsDias = snapshot.val();
        
        const registrosFormatados = Object.keys(todosOsDias).map(dataKey => {
            return mapearRegistrosParaFront(dataKey, todosOsDias[dataKey]);
        });
        registrosFormatados.sort((a, b) => b.data_registro.localeCompare(a.data_registro));

        let somaTotalMinutos = 0;
        const appCounts = {};

        Object.keys(todosOsDias).forEach(dataKey => {
            const dia = todosOsDias[dataKey];
            somaTotalMinutos += Number(dia.tempo_total_minutos || 0);

            if (dia.apps) {
                Object.entries(dia.apps).forEach(([nomeRaw, time]) => {
                    const appName = nomeRaw.charAt(0).toUpperCase() + nomeRaw.slice(1).toLowerCase();
                    appCounts[appName] = (appCounts[appName] || 0) + Number(time);
                });
            }
        });

        const total_dias_registrados = registrosFormatados.length;
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
        for (let i = 0; i < registrosFormatados.length - 1; i++) {
            const dataAtual = new Date(registrosFormatados[i].data_registro);
            const dataAnterior = new Date(registrosFormatados[i+1].data_registro);
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
            historico: registrosFormatados 
        });

    } catch (erro) {
        console.error('Erro no Dashboard:', erro);
        res.status(500).json({ erro: 'Erro interno ao carregar o dashboard.' });
    }
};