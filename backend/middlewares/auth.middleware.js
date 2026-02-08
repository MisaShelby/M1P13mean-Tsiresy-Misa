const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded;
            
            next();
        } catch (error) {
            console.error('Token invalide:', error);
            return res.status(401).json({
                success: false,
                message: 'Non autorisé, token invalide'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Non autorisé, aucun token'
        });
    }
};

module.exports = { protect };