const createError = require('http-errors');

const errorHandler = (err, req, res, next) => {
    // Log l'erreur
    console.error('🔴 Erreur:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        token: req.headers.authorization,
        timestamp: new Date().toISOString()
    });

    // Erreurs de validation Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Erreurs JWT
    if (err.name === 'JsonWebTokenError') {
        console.log('❌ Token invalide reçu:', req.headers.authorization);
        return res.status(401).json({
            success: false,
            message: 'Token invalide',
            error: {
                type: 'JWT_INVALID',
                details: err.message
            }
        });
    }

    if (err.name === 'TokenExpiredError') {
        console.log('⌛ Token expiré:', {
            token: req.headers.authorization,
            expiredAt: err.expiredAt
        });
        return res.status(401).json({
            success: false,
            message: 'Token expiré',
            error: {
                type: 'JWT_EXPIRED',
                expiredAt: err.expiredAt
            }
        });
    }

    // Erreurs HTTP personnalisées (créées avec http-errors)
    if (err.status && err.message) {
        return res.status(err.status).json({
            success: false,
            message: err.message,
            error: {
                type: err.name,
                details: err.details || null
            }
        });
    }

    // Erreurs de base de données MongoDB
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        if (err.code === 11000) { // Erreur de doublon (unique constraint)
            return res.status(409).json({
                success: false,
                message: 'Conflit de données',
                error: {
                    type: 'DUPLICATE_KEY',
                    field: Object.keys(err.keyPattern)[0]
                }
            });
        }
    }

    // Erreur par défaut
    const statusCode = err.status || 500;
    const response = {
        success: false,
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Une erreur est survenue',
    };

    // Ajouter la stack trace en développement
    if (process.env.NODE_ENV === 'development') {
        response.error = {
            type: err.name,
            stack: err.stack,
            details: err.details || null
        };
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
