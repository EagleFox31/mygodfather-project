const matchingService = require('../services/matchingService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class MatchingController {
    /**
     * @desc    Générer des suggestions de matching pour un mentoré
     * @route   POST /api/matching/generate/:menteeId
     * @access  Private (RH)
     */
    async generateMatches(req, res, next) {
        try {
            const { menteeId } = req.params;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const result = await matchingService.generateSuggestions(menteeId);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir les suggestions de matching pour un mentoré
     * @route   GET /api/matching/suggestions/:menteeId
     * @access  Private
     */
    async getSuggestions(req, res, next) {
        try {
            const { menteeId } = req.params;
            const suggestions = await matchingService.getSuggestions(menteeId);

            res.json({
                success: true,
                data: suggestions
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Valider un matching
     * @route   POST /api/matching/validate/:matchId
     * @access  Private (RH)
     */
    async validateMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const result = await matchingService.validateMatch(matchId, req.user.id);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Rejeter un matching
     * @route   POST /api/matching/reject/:matchId
     * @access  Private (RH)
     */
    async rejectMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const { reason } = req.body;

            const result = await matchingService.rejectMatch(matchId, reason, req.user.id);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir les statistiques de matching
     * @route   GET /api/matching/stats
     * @access  Private (Admin, RH)
     */
    async getStats(req, res, next) {
        try {
            const stats = await matchingService.getMatchingStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MatchingController();
