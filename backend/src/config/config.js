require('dotenv').config();
const database = require('./database');
const { validateConfig } = require('./validator');

const config = {
    // Configuration de la base de données
    database,

    // Configuration du serveur
    server: {
        port: parseInt(process.env.PORT) || 3000,
        env: process.env.NODE_ENV || 'development'
    },

    // Configuration JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'development-secret-key-do-not-use-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Configuration Teams
    teams: {
        clientId: process.env.TEAMS_CLIENT_ID || '',
        clientSecret: process.env.TEAMS_CLIENT_SECRET || '',
        tenantId: process.env.TEAMS_TENANT_ID || ''
    },

    // Configuration Email
    email: {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    },

    // Configuration de sécurité
    security: {
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100
    },

    // Configuration des logs
    logs: {
        level: process.env.LOG_LEVEL || 'debug',
        file: process.env.LOG_FILE || 'logs/app.log'
    },

    // Configuration des uploads
    uploads: {
        directory: process.env.UPLOAD_DIR || 'uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel', 'text/csv']
    },

    // Configuration du matching
    matching: {
        minMentorAge: 30,
        minMentorAnciennete: 3,
        maxMenteesPerMentor: 3,
        matchingThreshold: 0.7
    },

    // Configuration des sessions
    sessions: {
        minDuration: 15, // minutes
        maxDuration: 180, // minutes
        reminderDelay: 24 // heures avant la session
    },

    // Configuration des notifications
    notifications: {
        defaultChannels: ['email', 'web'],
        retentionDays: 30
    }
};

// Valider la configuration
try {
    validateConfig(config);
    console.log('✅ Configuration validée');

    // Avertissements pour la production
    if (config.server.env === 'production') {
        const warnings = [];

        if (config.jwt.secret === 'development-secret-key-do-not-use-in-production') {
            warnings.push('⚠️ Le secret JWT par défaut ne doit pas être utilisé en production');
        }

        if (!config.teams.clientId || !config.teams.clientSecret || !config.teams.tenantId) {
            warnings.push('⚠️ Les informations d\'authentification Teams sont manquantes');
        }

        if (!config.email.host || !config.email.user || !config.email.pass) {
            warnings.push('⚠️ Les informations SMTP sont manquantes');
        }

        if (warnings.length > 0) {
            console.warn('\n⚠️ Avertissements pour la production :');
            warnings.forEach(warning => console.warn(warning));
        }
    }
} catch (error) {
    console.error('❌ Erreur de configuration :', error.message);
    if (process.env.NODE_ENV !== 'test') { // ✅ Ne quitte pas Jest en mode test
        process.exit(1);
    } else {
        throw error; // ✅ Permet à Jest de capturer l'erreur normalement
    }
}


module.exports = config;
