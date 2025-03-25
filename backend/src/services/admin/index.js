const UserService = require('../userService');
const StatisticsService = require('../statistics');
const NotificationService = require('../notificationService');
const ConfigService = require('./configService');
const SecurityService = require('./securityService');
const AuditService = require('./auditService');

class AdminService {
    constructor() {
        this.configService = new ConfigService();
        this.securityService = new SecurityService();
        this.auditService = new AuditService();
    }

    // Gestion des configurations système
    async getSystemConfig() {
        return await this.configService.getAll();
    }

    async updateSystemConfig(config, adminId) {
        const result = await this.configService.update(config);
        await this.auditService.log('CONFIG_UPDATE', adminId, { 
            old: result.previous, 
            new: result.current 
        });
        return result.current;
    }

    // Gestion des seuils et paramètres
    async updateThresholds(thresholds, adminId) {
        const result = await this.configService.updateThresholds(thresholds);
        await this.auditService.log('THRESHOLDS_UPDATE', adminId, {
            old: result.previous,
            new: result.current
        });
        return result.current;
    }

    // Gestion des utilisateurs
    async getAllUsers(filters = {}, pagination = {}) {
        return await UserService.getUsers(filters, pagination);
    }

    async updateUserRole(userId, newRole, adminId) {
        const result = await UserService.updateRole(userId, newRole);
        await this.auditService.log('ROLE_UPDATE', adminId, {
            userId,
            oldRole: result.previous,
            newRole: result.current
        });
        return result;
    }

    async disableUser(userId, reason, adminId) {
        const result = await UserService.disableUser(userId, reason);
        await this.auditService.log('USER_DISABLE', adminId, {
            userId,
            reason
        });
        return result;
    }

    // Gestion de la sécurité
    async getSecurityLogs(filters = {}) {
        return await this.securityService.getLogs(filters);
    }

    async updateSecurityPolicy(policy, adminId) {
        const result = await this.securityService.updatePolicy(policy);
        await this.auditService.log('SECURITY_POLICY_UPDATE', adminId, {
            old: result.previous,
            new: result.current
        });
        return result.current;
    }

    // Gestion des backups
    async createBackup(adminId) {
        const backup = await this.securityService.createBackup();
        await this.auditService.log('BACKUP_CREATED', adminId, {
            backupId: backup.id,
            size: backup.size
        });
        return backup;
    }

    async restoreBackup(backupId, adminId) {
        await this.auditService.log('BACKUP_RESTORE_STARTED', adminId, { backupId });
        const result = await this.securityService.restoreBackup(backupId);
        await this.auditService.log('BACKUP_RESTORE_COMPLETED', adminId, {
            backupId,
            status: result.status
        });
        return result;
    }

    // Gestion des logs et audit
    async getAuditLogs(filters = {}) {
        return await this.auditService.getLogs(filters);
    }

    async getSystemStats() {
        return await this.securityService.getSystemStats();
    }

    // Gestion des notifications globales
    async sendGlobalNotification(message, options, adminId) {
        const notification = await NotificationService.sendGlobal(message, options);
        await this.auditService.log('GLOBAL_NOTIFICATION_SENT', adminId, {
            messageId: notification.id,
            recipients: notification.recipientCount
        });
        return notification;
    }

    // Maintenance système
    async performMaintenance(tasks, adminId) {
        await this.auditService.log('MAINTENANCE_STARTED', adminId, { tasks });
        const results = await Promise.all(tasks.map(task => 
            this.configService.executeMaintenanceTask(task)
        ));
        await this.auditService.log('MAINTENANCE_COMPLETED', adminId, { results });
        return results;
    }

    // Rapports système
    async generateSystemReport(options, adminId) {
        const report = await StatisticsService.generateReport(options);
        await this.auditService.log('SYSTEM_REPORT_GENERATED', adminId, {
            reportId: report.id,
            type: options.type
        });
        return report;
    }

    // Gestion des erreurs système
    async getErrorLogs(filters = {}) {
        return await this.securityService.getErrorLogs(filters);
    }

    async clearErrorLogs(adminId) {
        await this.auditService.log('ERROR_LOGS_CLEARED', adminId);
        return await this.securityService.clearErrorLogs();
    }
}

module.exports = new AdminService();
