const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Schéma pour les logs de sécurité
const SecurityLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['login', 'logout', 'failed_login', 'password_change', 'role_change', 'backup', 'restore', 'security_alert'],
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ip_address: String,
    user_agent: String,
    details: mongoose.Schema.Types.Mixed,
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const SecurityLog = mongoose.model('SecurityLog', SecurityLogSchema);

class SecurityService {
    constructor() {
        this.backupDir = path.join(__dirname, '../../../backups');
        this.ensureBackupDirectory();
    }

    // Gestion des logs de sécurité
    async logSecurityEvent(type, userId, details, severity = 'low', req = null) {
        try {
            const logEntry = new SecurityLog({
                type,
                user_id: userId,
                ip_address: req?.ip,
                user_agent: req?.headers['user-agent'],
                details,
                severity
            });

            await logEntry.save();

            // Si c'est un événement critique, notifier immédiatement
            if (severity === 'critical') {
                await this.notifyCriticalEvent(logEntry);
            }

            return logEntry;
        } catch (error) {
            console.error('Erreur lors de la journalisation de sécurité:', error);
            throw error;
        }
    }

    // Récupérer les logs de sécurité
    async getLogs(filters = {}) {
        try {
            let query = {};

            if (filters.type) query.type = filters.type;
            if (filters.severity) query.severity = filters.severity;
            if (filters.startDate) query.created_at = { $gte: new Date(filters.startDate) };
            if (filters.endDate) {
                query.created_at = { 
                    ...query.created_at, 
                    $lte: new Date(filters.endDate) 
                };
            }

            return await SecurityLog.find(query)
                .populate('user_id', 'name prenom email')
                .sort({ created_at: -1 })
                .limit(filters.limit || 100);
        } catch (error) {
            throw error;
        }
    }

    // Créer une sauvegarde de la base de données
    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup_${timestamp}.gz`;
            const filepath = path.join(this.backupDir, filename);

            // Créer la sauvegarde MongoDB
            const cmd = `mongodump --db ${process.env.DB_NAME} --archive=${filepath} --gzip`;
            await execAsync(cmd);

            // Chiffrer le fichier de sauvegarde
            await this.encryptFile(filepath);

            const stats = fs.statSync(filepath);
            const backup = {
                id: timestamp,
                filename,
                size: stats.size,
                created_at: new Date(),
                checksum: await this.calculateChecksum(filepath)
            };

            return backup;
        } catch (error) {
            throw error;
        }
    }

    // Restaurer une sauvegarde
    async restoreBackup(backupId) {
        try {
            const filename = `backup_${backupId}.gz`;
            const filepath = path.join(this.backupDir, filename);

            if (!fs.existsSync(filepath)) {
                throw new Error('Sauvegarde non trouvée');
            }

            // Vérifier l'intégrité du fichier
            const currentChecksum = await this.calculateChecksum(filepath);
            if (currentChecksum !== backup.checksum) {
                throw new Error('Intégrité de la sauvegarde compromise');
            }

            // Déchiffrer le fichier
            await this.decryptFile(filepath);

            // Restaurer la base de données
            const cmd = `mongorestore --db ${process.env.DB_NAME} --archive=${filepath} --gzip --drop`;
            await execAsync(cmd);

            return {
                status: 'success',
                message: 'Restauration terminée avec succès',
                timestamp: new Date()
            };
        } catch (error) {
            throw error;
        }
    }

    // Mettre à jour la politique de sécurité
    async updatePolicy(policy) {
        try {
            // Implémenter la mise à jour des politiques de sécurité
            return {
                previous: {},
                current: policy
            };
        } catch (error) {
            throw error;
        }
    }

    // Obtenir les statistiques système
    async getSystemStats() {
        try {
            const stats = {
                activeUsers: await this.getActiveUserCount(),
                failedLogins: await this.getFailedLoginCount(),
                diskUsage: await this.getDiskUsage(),
                backupStats: await this.getBackupStats(),
                securityAlerts: await this.getSecurityAlertCount()
            };

            return stats;
        } catch (error) {
            throw error;
        }
    }

    // Méthodes privées
    async encryptFile(filepath) {
        // Implémenter le chiffrement du fichier
    }

    async decryptFile(filepath) {
        // Implémenter le déchiffrement du fichier
    }

    async calculateChecksum(filepath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filepath);

            stream.on('error', err => reject(err));
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }

    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async notifyCriticalEvent(logEntry) {
        // Implémenter la notification des événements critiques
    }

    // Méthodes de statistiques
    async getActiveUserCount() {
        return await mongoose.model('User').countDocuments({
            last_active: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
    }

    async getFailedLoginCount() {
        return await SecurityLog.countDocuments({
            type: 'failed_login',
            created_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
    }

    async getDiskUsage() {
        const { stdout } = await execAsync('df -h ' + this.backupDir);
        return stdout;
    }

    async getBackupStats() {
        const files = fs.readdirSync(this.backupDir);
        return {
            count: files.length,
            latest: files[files.length - 1],
            totalSize: files.reduce((acc, file) => {
                return acc + fs.statSync(path.join(this.backupDir, file)).size;
            }, 0)
        };
    }

    async getSecurityAlertCount() {
        return await SecurityLog.countDocuments({
            severity: { $in: ['high', 'critical'] },
            created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
    }
}

module.exports = SecurityService;
