const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class NotificationController {
    /**
     * @desc    Obtenir les notifications d'un utilisateur
     * @route   GET /api/notifications
     * @access  Private
     */
    async getNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const { status, type, category } = req.query;

            const filters = {};
            if (status) filters.status = status;
            if (type) filters.type = type;
            if (category) filters.category = category;

            const notifications = await notificationService.getUserNotifications(userId, filters);

            res.json({
                success: true,
                data: notifications
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Marquer une notification comme lue
     * @route   PUT /api/notifications/:id/read
     * @access  Private
     */
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const notification = await notificationService.markAsRead(id, userId);

            res.json({
                success: true,
                data: notification
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour les préférences de notification
     * @route   PUT /api/notifications/preferences
     * @access  Private
     */
    async updatePreferences(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const userId = req.user.id;
            const preferences = req.body;

            const result = await notificationService.updatePreferences(userId, preferences);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Envoyer une notification globale
     * @route   POST /api/notifications/global
     * @access  Private (Admin)
     */
    async sendGlobalNotification(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const { message, options } = req.body;
            const senderId = req.user.id;

            const notification = await notificationService.sendGlobal(message, options, senderId);

            res.status(201).json({
                success: true,
                data: notification
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationController();
