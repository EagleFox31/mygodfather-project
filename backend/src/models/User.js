const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - prenom
 *         - age
 *         - service
 *         - fonction
 *         - anciennete
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email unique de l'utilisateur
 *           example: john.doe@godfather.com
 *         name:
 *           type: string
 *           description: Nom de l'utilisateur
 *           example: Doe
 *         prenom:
 *           type: string
 *           description: Prénom de l'utilisateur
 *           example: John
 *         age:
 *           type: number
 *           minimum: 18
 *           description: Âge de l'utilisateur
 *           example: 30
 *         service:
 *           type: string
 *           description: ID du service de l'utilisateur (référence à la collection Services)
 *           example: "507f1f77bcf86cd799439011"
 *         fonction:
 *           type: string
 *           description: Fonction de l'utilisateur
 *           example: "Développeur Senior"
 *         anciennete:
 *           type: number
 *           minimum: 0
 *           description: Ancienneté en années
 *           example: 5
 *         role:
 *           type: string
 *           enum: [admin, rh, mentor, mentee]
 *           description: Rôle de l'utilisateur
 *           example: "mentor"
 *         disponibilite:
 *           type: boolean
 *           default: true
 *           description: Disponibilité de l'utilisateur
 *         teams_id:
 *           type: string
 *           description: ID Microsoft Teams de l'utilisateur
 *         notification_preferences:
 *           type: object
 *           properties:
 *             email:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   default: true
 *             teams:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   default: true
 *             web:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   default: true
 */

const userSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    passwordVisible: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    fonction: {
        type: String,
        required: true
    },
    anciennete: {
        type: Number,
        required: true
    },
    teams_id: {
        type: String,
        required: false
    },
    disponibilite: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['admin', 'rh', 'mentor', 'mentee'],
        required: true
    },
    last_login: {
        type: Date
    },
    last_active: {
        type: Date
    },
    notification_preferences: {
        email: {
            enabled: { type: Boolean, default: true },
            categories: {
                matching: { type: Boolean, default: true },
                session: { type: Boolean, default: true },
                message: { type: Boolean, default: true },
                system: { type: Boolean, default: true }
            }
        },
        teams: {
            enabled: { type: Boolean, default: true },
            categories: {
                matching: { type: Boolean, default: true },
                session: { type: Boolean, default: true },
                message: { type: Boolean, default: true },
                system: { type: Boolean, default: true }
            }
        },
        web: {
            enabled: { type: Boolean, default: true },
            categories: {
                matching: { type: Boolean, default: true },
                session: { type: Boolean, default: true },
                message: { type: Boolean, default: true },
                system: { type: Boolean, default: true }
            }
        }
    },
    profile_settings: {
        language: {
            type: String,
            enum: ['fr', 'en'],
            default: 'fr'
        },
        timezone: {
            type: String,
            default: 'Europe/Paris'
        },
        calendar_sync: {
            enabled: { type: Boolean, default: false },
            provider: {
                type: String,
                enum: ['google', 'outlook', 'none'],
                default: 'none'
            },
            sync_token: String
        }
    },
    security_settings: {
        two_factor_enabled: {
            type: Boolean,
            default: false
        },
        two_factor_method: {
            type: String,
            enum: ['email', 'authenticator', 'none'],
            default: 'none'
        },
        two_factor_secret: String,
        password_last_changed: Date,
        failed_login_attempts: {
            type: Number,
            default: 0
        },
        account_locked_until: Date
    },
    hasCompletedOnboarding: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ service: 1 });
userSchema.index({ deletedAt: 1 });
userSchema.index({ last_login: -1 });
userSchema.index({ last_active: -1 });

// Middleware pour mettre à jour last_active
userSchema.pre('save', function (next) {
    this.last_active = new Date();
    next();
});

// Méthodes du modèle
userSchema.methods.updateLastActive = async function () {
    this.last_active = new Date();
    await this.save();
};

userSchema.methods.updateLastLogin = async function () {
    this.last_login = new Date();
    this.failed_login_attempts = 0;
    this.account_locked_until = null;
    await this.save();
};

userSchema.methods.isActiveRecently = function (minutes = 5) {
    if (!this.last_active) return false;
    const threshold = new Date(Date.now() - minutes * 60 * 1000);
    return this.last_active > threshold;
};

userSchema.methods.shouldChangePassword = function (maxAgeDays = 90) {
    if (!this.security_settings.password_last_changed) return true;
    const threshold = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    return this.security_settings.password_last_changed < threshold;
};

userSchema.methods.isAccountLocked = function () {
    if (!this.security_settings.account_locked_until) return false;
    return new Date() < this.security_settings.account_locked_until;
};

userSchema.methods.incrementFailedLoginAttempts = async function () {
    this.security_settings.failed_login_attempts += 1;
    if (this.security_settings.failed_login_attempts >= 5) {
        this.security_settings.account_locked_until = new Date(Date.now() + 30 * 60 * 1000);
    }
    await this.save();
};

userSchema.methods.updateNotificationPreferences = async function (channel, category, enabled) {
    if (!this.notification_preferences[channel]) return false;
    if (category) {
        this.notification_preferences[channel].categories[category] = enabled;
    } else {
        this.notification_preferences[channel].enabled = enabled;
    }
    await this.save();
    return true;
};

module.exports = mongoose.model('User', userSchema);
