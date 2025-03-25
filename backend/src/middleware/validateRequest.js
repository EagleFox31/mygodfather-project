const { validationResult } = require('express-validator');

/**
 * Middleware pour valider les requêtes avec express-validator
 * Vérifie les résultats de validation et renvoie une erreur 400 si des erreurs sont trouvées
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

module.exports = validateRequest;
