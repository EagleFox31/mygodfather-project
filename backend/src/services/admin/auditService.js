const mongoose = require('mongoose');

// Schéma pour les logs d'audit
const AuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            // Actions de configuration
            'CONFIG_UPDATE',
            'THRESHOLDS_UPDATE',
            'MAINTENANCE_STARTED',
            'MAINTENANCE_COMPLETED',

            // Actions utilisateurs
            'USER_CREATE',
            'USER_UPDATE',
            'USER_DELETE',
            'ROLE_UPDATE',
            'USER_DISABLE',
            'PASSWORD_RESET',

            // Actions de sécurité
            'SECURITY_POLICY_UPDATE',
            'BACKUP_CREATED',
            'BACKUP_RESTORE_STARTED',
            'BACKUP_RESTORE_COMPLETED',
            'SECURITY_ALERT',

            // Actions système
            'SYSTEM_REPORT_GENERATED',
            'ERROR_LOGS_CLEARED',
            'GLOBAL_NOTIFICATION_SENT',
            'SYSTEM_MAINTENANCE'
        ]
    },
    performed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    details: mongoose.Schema.Types.Mixed,
    ip_address: String,
    user_agent: String,
    status: {
        type: String,
        enum: ['success', 'failure', 'pending'],
        default: 'success'
    },
    affected_users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    affected_resources: [{
        type: String
    }],
    changes: {
        previous: mongoose.Schema.Types.Mixed,
        current: mongoose.Schema.Types.Mixed
    }
});

// Index pour améliorer les performances des requêtes
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ performed_by: 1 });
AuditLogSchema.index({ 'affected_users': 1 });
AuditLogSchema.index({ status: 1 });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

class AuditService {
    // Enregistrer une action
    async log(action, adminId, details = {}, req = null) {
        try {
            const logEntry = new AuditLog({
                action,
                performed_by: adminId,
                details,
                ip_address: req?.ip,
                user_agent: req?.headers['user-agent']
            });

            if (details.affected_users) {
                logEntry.affected_users = Array.isArray(details.affected_users) 
                    ? details.affected_users 
                    : [details.affected_users];
            }

            if (details.affected_resources) {
                logEntry.affected_resources = Array.isArray(details.affected_resources)
                    ? details.affected_resources
                    : [details.affected_resources];
            }

            if (details.previous !== undefined && details.current !== undefined) {
                logEntry.changes = {
                    previous: details.previous,
                    current: details.current
                };
            }

            await logEntry.save();
            return logEntry;
        } catch (error) {
            console.error('Erreur lors de la journalisation d\'audit:', error);
            throw error;
        }
    }

    // Récupérer les logs d'audit
    async getLogs(filters = {}) {
        try {
            let query = {};

            // Filtres de base
            if (filters.action) {
                query.action = Array.isArray(filters.action) 
                    ? { $in: filters.action }
                    : filters.action;
            }
            if (filters.status) query.status = filters.status;
            if (filters.adminId) query.performed_by = filters.adminId;

            // Filtres de date
            if (filters.startDate || filters.endDate) {
                query.timestamp = {};
                if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
                if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
            }

            // Filtres d'utilisateurs affectés
            if (filters.affectedUser) {
                query.affected_users = filters.affectedUser;
            }

            // Pagination
            const page = filters.page || 1;
            const limit = filters.limit || 50;
            const skip = (page - 1) * limit;

            // Exécution de la requête
            const logs = await AuditLog.find(query)
                .populate('performed_by', 'name prenom email')
                .populate('affected_users', 'name prenom email')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit);

            // Compter le total pour la pagination
            const total = await AuditLog.countDocuments(query);

            return {
                logs,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Obtenir un résumé des actions par administrateur
    async getAdminActionsSummary(startDate, endDate) {
        try {
            return await AuditLog.aggregate([
                {
                    $match: {
                        timestamp: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                },
                {
                    $group: {
                        _id: '$performed_by',
                        totalActions: { $sum: 1 },
                        actionsByType: {
                            $push: '$action'
                        },
                        successCount: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
                            }
                        },
                        failureCount: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'failure'] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'admin'
                    }
                },
                {
                    $unwind: '$admin'
                },
                {
                    $project: {
                        admin: {
                            name: '$admin.name',
                            prenom: '$admin.prenom',
                            email: '$admin.email'
                        },
                        totalActions: 1,
                        successRate: {
                            $multiply: [
                                { $divide: ['$successCount', '$totalActions'] },
                                100
                            ]
                        },
                        actionsByType: 1,
                        successCount: 1,
                        failureCount: 1
                    }
                }
            ]);
        } catch (error) {
            throw error;
        }
    }

    // Obtenir les actions récentes sur une ressource
    async getResourceHistory(resourceType, resourceId, limit = 10) {
        try {
            return await AuditLog.find({
                affected_resources: resourceType + ':' + resourceId
            })
            .populate('performed_by', 'name prenom email')
            .sort({ timestamp: -1 })
            .limit(limit);
        } catch (error) {
            throw error;
        }
    }

    // Obtenir les statistiques d'audit
    async getAuditStats(period = '24h') {
        try {
            const startDate = new Date();
            switch (period) {
                case '24h':
                    startDate.setHours(startDate.getHours() - 24);
                    break;
                case '7d':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(startDate.getDate() - 30);
                    break;
                default:
                    throw new Error('Période non valide');
            }

            return await AuditLog.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalActions: { $sum: 1 },
                        uniqueAdmins: { $addToSet: '$performed_by' },
                        actionsByStatus: {
                            $push: '$status'
                        },
                        actionsByType: {
                            $push: '$action'
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalActions: 1,
                        uniqueAdmins: { $size: '$uniqueAdmins' },
                        successRate: {
                            $multiply: [
                                {
                                    $divide: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$actionsByStatus',
                                                    as: 'status',
                                                    cond: { $eq: ['$$status', 'success'] }
                                                }
                                            }
                                        },
                                        '$totalActions'
                                    ]
                                },
                                100
                            ]
                        },
                        actionTypes: {
                            $reduce: {
                                input: '$actionsByType',
                                initialValue: {},
                                in: {
                                    $mergeObjects: [
                                        '$$value',
                                        { $literal: { '$$this': 1 } }
                                    ]
                                }
                            }
                        }
                    }
                }
            ]);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuditService;
