const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    const partes = authHeader.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({ erro: 'Erro no formato do token.' });
    }

    const token = partes[1];

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        req.usuario = decodificado;
        
        next();
    } catch (erro) {
        res.status(401).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
    }
};