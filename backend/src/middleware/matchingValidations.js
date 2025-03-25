
const { body, query, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Fonction pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateMatchId = [
    param('matchId')
        .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID du match invalide');
            }
            return true;
        }),
    handleValidationErrors
];

// -- Exemple validation "validateMenteeId" --
const validateMenteeId = [
    param('menteeId')
        .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID du mentoré invalide');
            }
            return true;
        }),
    handleValidationErrors
];

// -- Exemple validation "validateMenteeAccess" --
const validateMenteeAccess = [
    param('menteeId')
        .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID du mentoré invalide');
            }
            return true;
        }),
    // ...Possibilité de checks supplémentaires
    handleValidationErrors
];
// Validations pour les routes de matching
const recommendationsValidation = [
    query('menteeId')
        .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID du mentoré invalide');
            }
            return true;
        }),
    handleValidationErrors
];

const confirmMatchValidation = [
    body('mentorId')
        .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID du mentor invalide');
            }
            return true;
        }),
    body('menteeId')
        .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID du mentoré invalide');
            }
            return true;
        }),
    body('score')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Score de compatibilité invalide'),
    handleValidationErrors
];

// Validations pour les routes de gestion des paires
const createPairValidation = [
    body('mentorId')
        .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID du mentor invalide');
            }
            return true;
        }),
    body('menteeId')
        .custom(value => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID du mentoré invalide');
            }
            return true;
        }),
    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Date de début invalide'),
    body('notes')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage('Notes trop longues (max 500 caractères)'),
    handleValidationErrors
];

const deletePairValidation = [
    param('id')
        .matches(/^[0-9a-fA-F]{24}$/)
        .withMessage('ID de la paire invalide'),
    handleValidationErrors
];



module.exports = {
    validateMatchId,  
    validateMenteeId,
    validateMenteeAccess,
    recommendationsValidation,
    confirmMatchValidation,
    createPairValidation,
    deletePairValidation
};
