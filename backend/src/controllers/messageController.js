const messageService = require('../services/messageService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class MessageController {
    /**
     * @desc    Obtenir les messages d'une conversation
     * @route   GET /api/messages
     * @access  Private
     */
    async getMessages(req, res, next) {
        try {
            const { receiverId, page = 1, limit = 10 } = req.query;
            const userId = req.user.id;

            const messages = await messageService.getMessages(userId, receiverId, page, limit);

            res.json({
                success: true,
                data: messages
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir les messages non lus
     * @route   GET /api/messages/unread
     * @access  Private
     */
    async getUnreadMessages(req, res, next) {
        try {
            const userId = req.user.id;
            const unreadMessages = await messageService.getUnreadMessages(userId);

            res.json({
                success: true,
                data: unreadMessages
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Envoyer un message
     * @route   POST /api/messages
     * @access  Private
     */
    async sendMessage(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const { receiverId, content, attachments } = req.body;
            const senderId = req.user.id;

            if (receiverId === senderId) {
                throw createError(400, 'Vous ne pouvez pas vous envoyer un message à vous-même.');
            }

            const message = await messageService.sendMessage(senderId, receiverId, content, attachments);

            res.status(201).json({
                success: true,
                data: message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Marquer un message comme lu
     * @route   PUT /api/messages/:id/read
     * @access  Private
     */
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const message = await messageService.markAsRead(id, userId);

            res.json({
                success: true,
                data: message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Supprimer un message (soft delete)
     * @route   DELETE /api/messages/:id
     * @access  Private
     */
    async deleteMessage(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            await messageService.deleteMessage(id, userId);

            res.json({
                success: true,
                message: 'Message supprimé avec succès'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MessageController();
