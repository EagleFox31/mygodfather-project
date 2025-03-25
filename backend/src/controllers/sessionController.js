const sessionService = require('../services/sessionService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class SessionController {
    /**
     * @desc    Obtenir toutes les sessions
     * @route   GET /api/sessions
     * @access  Private
     */
    async getSessions(req, res, next) {
        try {
            const { pairId, status } = req.query;
            const filters = {};
            if (pairId) filters.pair_id = pairId;
            if (status) filters.status = status;

            const sessions = await sessionService.getSessions(filters);

            res.json({
                success: true,
                data: sessions
            });
        } catch ( error) {
            next(error);
        }
    }

    /**
     * @desc    Créer une nouvelle session
     * @route   POST /api/sessions
     * @access  Private
     */
    async createSession(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const sessionData = req.body;
            const createdBy = req.user.id;

            const session = await sessionService.createSession(sessionData, createdBy);

            res.status(201).json({
                success: true,
                data: session
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir une session spécifique
     * @route   GET /api/sessions/:id
     * @access  Private
     */
    async getSession(req, res, next) {
        try {
            const { id } = req.params;
            const session = await sessionService.getSession(id);

            if (!session) {
                throw createError(404, 'Session non trouvée');
            }

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour une session
     * @route   PUT /api/sessions/:id
     * @access  Private
     */
    async updateSession(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const session = await sessionService.updateSession(id, updateData);

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Annuler une session
     * @route   POST /api/sessions/:id/cancel
     * @access  Private
     */
    async cancelSession(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const session = await sessionService.cancelSession(id, reason);

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Ajouter un feedback à une session
     * @route   POST /api/sessions/:id/feedback
     * @access  Private
     */
    async addSessionFeedback(req, res, next) {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user.id;

            const session = await sessionService.addFeedback(id, userId, rating, comment);

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SessionController();
