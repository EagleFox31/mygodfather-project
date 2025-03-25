const teamsService = require('../services/teamsService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class TeamsController {
    /**
     * @desc    Créer un canal Teams pour une paire
     * @route   POST /api/teams/channels
     * @access  Private (RH)
     */
    async createChannel(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const { pairId } = req.body;
            const channel = await teamsService.createChannel(pairId);

            res.status(201).json({
                success: true,
                data: channel
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Créer une réunion Teams
     * @route   POST /api/teams/meetings
     * @access  Private
     */
    async createMeeting(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const { title, startTime, duration, participants } = req.body;
            const meeting = await teamsService.createMeeting({
                title,
                startTime,
                duration,
                participants
            });

            res.status(201).json({
                success: true,
                data: meeting
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour une réunion Teams
     * @route   PUT /api/teams/meetings/:id
     * @access  Private
     */
    async updateMeeting(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const meeting = await teamsService.updateMeeting(id, updateData);

            res.json({
                success: true,
                data: meeting
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Archiver un canal Teams
     * @route   POST /api/teams/channels/:id/archive
     * @access  Private (RH)
     */
    async archiveChannel(req, res, next) {
        try {
            const { id } = req.params;
            const channel = await teamsService.archiveChannel(id);

            res.json({
                success: true,
                data: channel
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TeamsController();
