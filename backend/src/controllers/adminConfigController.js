const configService = require('../services/admin/configService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class AdminConfigController {
    /**
     * @desc    Obtenir la configuration système
     * @route   GET /api/admin/config
     * @access  Private (Admin)
     */
    async getConfig(req, res, next) {
        try {
            const config = await configService.getSystemConfig();

            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour la configuration système
     * @route   PUT /api/admin/config
     * @access  Private (Admin)
     */
    async updateConfig(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const config = req.body;
            const updatedBy = req.user.id;

            const result = await configService.updateSystemConfig(config, updatedBy);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir le statut du système
     * @route   GET /api/admin/status
     * @access  Private (Admin)
     */
    async getSystemStatus(req, res, next) {
        try {
            const status = await configService.getSystemStatus();

            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Exécuter une tâche de maintenance
     * @route   POST /api/admin/maintenance
     * @access  Private (Admin)
     */
    async performMaintenance(req, res, next) {
        try {
            const { tasks } = req.body;
            const performedBy = req.user.id;

            const results = await configService.performMaintenance(tasks, performedBy);

            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminConfigController();
