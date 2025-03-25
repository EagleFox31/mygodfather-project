const pairService = require('../services/pairService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class PairController {
    /**
     * @desc    Obtenir toutes les paires
     * @route   GET /api/pairs
     * @access  Private
     */
    async getPairs(req, res, next) {
        try {
            const { status, mentorId, menteeId } = req.query;
            const filters = {};
            if (status) filters.status = status;
            if (mentorId) filters.mentor_id = mentorId;
            if (menteeId) filters.mentee_id = menteeId;

            const pairs = await pairService.getPairs(filters);

            res.json({
                success: true,
                data: pairs
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Créer une nouvelle paire
     * @route   POST /api/pairs
     * @access  Private (RH)
     */
    async createPair(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const pairData = req.body;
            const createdBy = req.user.id;

            const pair = await pairService.createPair(pairData, createdBy);

            res.status(201).json({
                success: true,
                data: pair
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir une paire spécifique
     * @route   GET /api/pairs/:id
     * @access  Private
     */
    async getPair(req, res, next) {
        try {
            const { id } = req.params;
            const pair = await pairService.getPair(id);

            if (!pair) {
                throw createError(404, 'Paire non trouvée');
            }

            res.json({
                success: true,
                data: pair
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour le statut d'une paire
     * @route   PUT /api/pairs/:id/status
     * @access  Private (RH)
     */
    async updatePairStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const pair = await pairService.updatePairStatus(id, status, req.user.id);

            res.json({
                success: true,
                data: pair
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Ajouter un feedback à une paire
     * @route   POST /api/pairs/:id/feedback
     * @access  Private
     */
    async addFeedback(req, res, next) {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user.id;

            const pair = await pairService.addFeedback(id, userId, rating, comment);

            res.json({
                success: true,
                data: pair
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Terminer une relation de mentorat
     * @route   POST /api/pairs/:id/end
     * @access  Private (RH)
     */
    async endMentorship(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const pair = await pairService.endMentorship(id, reason, req.user.id);

            res.json({
                success: true,
                data: pair
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PairController();
