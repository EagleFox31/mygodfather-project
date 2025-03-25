const Joi = require('joi');

// Schéma de validation pour la configuration de la base de données
const databaseSchema = Joi.object({
    url: Joi.string().uri().required().messages({
        'string.uri': 'L\'URL de la base de données doit être une URI valide.',
        'any.required': 'Le champ database.url est requis.'
    }),
    options: Joi.object().optional()
});

// Schéma de validation pour la configuration JWT
const jwtSchema = Joi.object({
    secret: Joi.string().min(32).required().messages({
        'string.min': 'Le secret JWT doit contenir au moins 32 caractères pour la sécurité.',
        'any.required': 'Le champ jwt.secret est requis.'
    }),
    expiresIn: Joi.string().pattern(/^\d+[smhdwy]$/).default('24h').messages({
        'string.pattern.base': 'Le champ jwt.expiresIn doit être un format valide comme "60m", "24h", "7d".'
    })
});

// Schéma de validation pour la configuration de sécurité
const securitySchema = Joi.object({
    bcryptSaltRounds: Joi.number().integer().min(8).max(20).default(12).messages({
        'number.min': 'Le nombre de rounds bcrypt doit être au minimum 8.',
        'number.max': 'Le nombre de rounds bcrypt ne doit pas dépasser 20.'
    }),
    rateLimitWindow: Joi.number().min(1).default(15),
    rateLimitMax: Joi.number().min(1).max(1000).default(100).messages({
        'number.max': 'Le nombre maximal de requêtes ne doit pas dépasser 1000.'
    })
});

// ✅ Schéma de validation pour la configuration des uploads
const uploadsSchema = Joi.object({
    directory: Joi.string().default('uploads'),
    maxFileSize: Joi.number().min(1).default(5242880).messages({
        'number.min': 'La taille maximale du fichier doit être positive.'
    }),
    allowedTypes: Joi.array().items(
        Joi.string().valid(
            'image/jpeg',
            'image/png',
            'application/pdf',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        )
    ).default([
        'image/jpeg',
        'image/png',
        'application/pdf',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
    ]).messages({
        'any.only': 'Les types de fichiers autorisés sont: image/jpeg, image/png, application/pdf, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel.'
    })
});

// Schéma de validation pour la configuration des sessions
const sessionsSchema = Joi.object({
    minDuration: Joi.number().min(10).max(240).default(15).messages({
        'number.min': 'La durée minimale d\'une session doit être d\'au moins 10 minutes.',
        'number.max': 'La durée maximale d\'une session ne peut pas dépasser 240 minutes.'
    }),
    maxDuration: Joi.number().min(30).max(480).default(180),
    reminderDelay: Joi.number().min(1).default(24)
});

// Schéma de validation pour la configuration des notifications
const notificationsSchema = Joi.object({
    defaultChannels: Joi.array().items(Joi.string().valid('email', 'web', 'sms')).default(['email', 'web']).messages({
        'array.includes': 'Les canaux de notification doivent être parmi email, web, sms.'
    }),
    retentionDays: Joi.number().min(1).default(30).messages({
        'number.min': 'Le nombre de jours de rétention des notifications doit être d\'au moins 1.'
    })
});

// Schéma de validation pour la configuration complète
const configSchema = Joi.object({
    database: databaseSchema.required(),
    jwt: jwtSchema.required(),
    security: securitySchema.default(),
    uploads: uploadsSchema.default(),
    sessions: sessionsSchema.default(),
    notifications: notificationsSchema.default()
});

const matchingSchema = Joi.object({
    minMentorAge: Joi.number().min(18).required(),
    minMentorAnciennete: Joi.number().min(0).required(),
    maxMenteesPerMentor: Joi.number().min(1).required(),
    matchingThreshold: Joi.number().min(0).max(1).required()
});
function validateConfig(config) {
    const { error, value } = configSchema.validate(config, {
        abortEarly: false,
        allowUnknown: true
    });

    if (error) {
        const errors = error.details.map(detail => ({
            path: detail.path.join('.'),
            message: detail.message
        }));

        throw new Error(`❌ Configuration invalide:\n${JSON.stringify(errors, null, 2)}`);
    }

    return value;
}

module.exports = {
    validateConfig,
    schemas: {
        database: databaseSchema,
        jwt: jwtSchema,
        security: securitySchema,
        uploads: uploadsSchema,
        sessions: sessionsSchema,
        notifications: notificationsSchema,
        config: configSchema,
         matching : matchingSchema
    }
};
