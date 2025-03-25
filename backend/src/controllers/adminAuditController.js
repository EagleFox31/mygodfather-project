const auditService = require('../services/admin/auditService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class AdminAuditController {
    /**
     * @desc    Obtenir les logs d'audit
     * @route   GET /api/admin/audit/logs
     * @access  Private (Admin)
     */
    async getAuditLogs(req, res, next) {
        try {
            const { startDate, endDate, action, userId } = req.query;
            const logs = await auditService.getAuditLogs({ startDate, endDate, action, userId });

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir les statistiques d'audit
     * @route   GET /api/admin/audit/stats
     * @access  Private (Admin)
     */
    async getAuditStats(req, res, next) {
        try {
            const stats = await auditService.getAuditStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Exporter les logs d'audit
     * @route   POST /api/admin/audit/export
     * @access  Private (Admin)
     */
    async exportAuditLogs(req, res, next) {
        try {
            const { format, filters } = req.body;
            const data = await auditService.exportAuditLogs(format, filters);

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Nettoyer les anciens logs d'audit
     * @route   DELETE /api/admin/audit/cleanup
     * @access  Private (Admin)
     */
    async clearOldLogs(req, res, next) {
        try {
            const result = await auditService.clearOldLogs();

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminAuditController();
