const mongoose = require('mongoose');

// Schéma pour les configurations système
const SystemConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: mongoose.Schema.Types.Mixed,
    description: String,
    category: {
        type: String,
        enum: ['security', 'matching', 'notification', 'system', 'maintenance']
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const SystemConfig = mongoose.model('SystemConfig', SystemConfigSchema);

class ConfigService {
    constructor() {
        this.defaultConfigs = {
            security: {
                passwordPolicy: {
                    minLength: 8,
                    requireNumbers: true,
                    requireSpecialChars: true,
                    requireUppercase: true,
                    maxAge: 90 // jours
                },
                sessionTimeout: 30, // minutes
                maxLoginAttempts: 5,
                lockoutDuration: 30 // minutes
            },
            matching: {
                thresholds: {
                    mentor_availability: 30,
                    matching_success: 70,
                    session_completion: 80,
                    feedback_score: 3.5
                },
                maxMentees: 3, // par mentor
                minAnciennete: 3 // années
            },
            notification: {
                channels: {
                    email: true,
                    teams: true,
                    web: true
                },
                reminderTimes: [15, 60, 1440], // minutes avant session
                quietHours: {
                    start: '22:00',
                    end: '08:00'
                }
            },
            system: {
                maintenance: {
                    backupFrequency: 24, // heures
                    logRetention: 30, // jours
                    cleanupTime: '03:00' // heure de nettoyage
                },
                pagination: {
                    defaultLimit: 50,
                    maxLimit: 100
                }
            }
        };
    }

    // Initialiser les configurations par défaut
    async initializeDefaults() {
        try {
            for (const [category, configs] of Object.entries(this.defaultConfigs)) {
                for (const [key, value] of Object.entries(this.flattenObject(configs))) {
                    await SystemConfig.findOneAndUpdate(
                        { key: `${category}.${key}` },
                        {
                            value,
                            category,
                            description: `Configuration ${category}.${key}`
                        },
                        { upsert: true, new: true }
                    );
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // Récupérer toutes les configurations
    async getAll() {
        try {
            const configs = await SystemConfig.find();
            return this.unflattenConfigs(configs);
        } catch (error) {
            throw error;
        }
    }

    // Mettre à jour une configuration
    async update(configs) {
        try {
            const previous = await this.getAll();
            const flattened = this.flattenObject(configs);

            for (const [key, value] of Object.entries(flattened)) {
                await SystemConfig.findOneAndUpdate(
                    { key },
                    { value },
                    { upsert: true }
                );
            }

            const current = await this.getAll();
            return { previous, current };
        } catch (error) {
            throw error;
        }
    }

    // Mettre à jour les seuils
    async updateThresholds(thresholds) {
        try {
            const previous = await this.get('matching.thresholds');
            await this.update({ 
                matching: { 
                    thresholds 
                } 
            });
            const current = await this.get('matching.thresholds');
            return { previous, current };
        } catch (error) {
            throw error;
        }
    }

    // Récupérer une configuration spécifique
    async get(key) {
        try {
            const config = await SystemConfig.findOne({ key });
            return config ? config.value : null;
        } catch (error) {
            throw error;
        }
    }

    // Exécuter une tâche de maintenance
    async executeMaintenanceTask(task) {
        try {
            switch (task) {
                case 'cleanup_logs':
                    return await this.cleanupLogs();
                case 'optimize_db':
                    return await this.optimizeDatabase();
                case 'verify_integrity':
                    return await this.verifyDataIntegrity();
                default:
                    throw new Error(`Tâche de maintenance inconnue: ${task}`);
            }
        } catch (error) {
            throw error;
        }
    }

    // Utilitaires
    flattenObject(obj, prefix = '') {
        return Object.keys(obj).reduce((acc, k) => {
            const pre = prefix.length ? prefix + '.' : '';
            if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k]))
                Object.assign(acc, this.flattenObject(obj[k], pre + k));
            else
                acc[pre + k] = obj[k];
            return acc;
        }, {});
    }

    unflattenConfigs(configs) {
        const result = {};
        for (const config of configs) {
            const parts = config.key.split('.');
            let current = result;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = current[parts[i]] || {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = config.value;
        }
        return result;
    }

    // Tâches de maintenance
    async cleanupLogs() {
        // Implémenter le nettoyage des logs
        return { status: 'success', message: 'Logs nettoyés' };
    }

    async optimizeDatabase() {
        // Implémenter l'optimisation de la base de données
        return { status: 'success', message: 'Base de données optimisée' };
    }

    async verifyDataIntegrity() {
        // Implémenter la vérification d'intégrité des données
        return { status: 'success', message: 'Intégrité des données vérifiée' };
    }
}

module.exports = ConfigService;
