const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Pega o token do cabeçalho da requisição
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    // O padrão do header é "Bearer <token>", então separamos pelo espaço
    const partes = authHeader.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({ erro: 'Erro no formato do token.' });
    }

    const token = partes[1];

    try {
        // 2. Verifica se o token é válido usando a senha secreta do .env
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Coloca os dados do usuário dentro de req.usuario para as próximas rotas usarem
        req.usuario = decodificado;
        
        // 4. Libera a passagem para a rota solicitada
        next();
    } catch (erro) {
        res.status(401).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
    }
};