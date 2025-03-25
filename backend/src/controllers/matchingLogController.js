const MatchingLog = require('../models/MatchingLog');
const MatchingRejectionLog = require('../models/MatchingRejectionLog');
const User = require('../models/User');
const createError = require('http-errors');
const { validationResult } = require('express-validator');

class MatchingLogController {
    /**
     * @desc    Obtenir tous les logs de matching
     * @route   GET /api/matching/logs
     * @access  Private (Admin, RH)
     */
    async getMatchingLogs(req, res, next) {
        try {
            const { page = 1, limit = 20, menteeId, startDate, endDate } = req.query;

            // Construire la requête avec filtres optionnels
            const query = {};

            if (menteeId) {
                query.menteeId = menteeId;
            }

            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) {
                    query.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    query.createdAt.$lte = new Date(endDate);
                }
            }

            // Exécuter la requête avec pagination
            const logs = await MatchingLog.find(query)
                .populate('menteeId', 'name prenom email')
                .populate('suggestions.mentorId', 'name prenom email')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            // Obtenir le nombre total pour la pagination
            const total = await MatchingLog.countDocuments(query);

            res.json({
                success: true,
                data: {
                    logs,
                    pagination: {
                        total,
                        page: parseInt(page),
                        pages: Math.ceil(total / limit),
                        limit: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir un log de matching spécifique
     * @route   GET /api/matching/logs/:id
     * @access  Private (Admin, RH)
     */
    async getMatchingLogById(req, res, next) {
        try {
            const { id } = req.params;

            const log = await MatchingLog.findById(id)
                .populate('menteeId', 'name prenom email service fonction')
                .populate('suggestions.mentorId', 'name prenom email service fonction');

            if (!log) {
                throw createError(404, '❌ Log de matching introuvable');
            }

            res.json({
                success: true,
                data: log
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir tous les logs de rejet de matching
     * @route   GET /api/matching/rejection-logs
     * @access  Private (Admin, RH)
     */
    async getRejectionLogs(req, res, next) {
        try {
            const { page = 1, limit = 20, mentorId, menteeId, startDate, endDate } = req.query;

            // Construire la requête avec filtres optionnels
            const query = {};

            if (mentorId) {
                query.mentor_id = mentorId;
            }

            if (menteeId) {
                query.mentee_id = menteeId;
            }

            if (startDate || endDate) {
                query.created_at = {};
                if (startDate) {
                    query.created_at.$gte = new Date(startDate);
                }
                if (endDate) {
                    query.created_at.$lte = new Date(endDate);
                }
            }

            // Exécuter la requête avec pagination
            const logs = await MatchingRejectionLog.find(query)
                .populate('mentor_id', 'name prenom email')
                .populate('mentee_id', 'name prenom email')
                .populate('rejected_by', 'name prenom email role')
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            // Obtenir le nombre total pour la pagination
            const total = await MatchingRejectionLog.countDocuments(query);

            res.json({
                success: true,
                data: {
                    logs,
                    pagination: {
                        total,
                        page: parseInt(page),
                        pages: Math.ceil(total / limit),
                        limit: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir un log de rejet spécifique
     * @route   GET /api/matching/rejection-logs/:id
     * @access  Private (Admin, RH)
     */
    async getRejectionLogById(req, res, next) {
        try {
            const { id } = req.params;

            const log = await MatchingRejectionLog.findById(id)
                .populate('mentor_id', 'name prenom email service fonction')
                .populate('mentee_id', 'name prenom email service fonction')
                .populate('rejected_by', 'name prenom email role');

            if (!log) {
                throw createError(404, '❌ Log de rejet introuvable');
            }

            res.json({
                success: true,
                data: log
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir les statistiques des logs de matching
     * @route   GET /api/matching/logs/stats
     * @access  Private (Admin, RH)
     */
    async getMatchingLogStats(req, res, next) {
        try {
            // Statistiques des matchings
            const matchingStats = await MatchingLog.aggregate([
                {
                    $unwind: '$suggestions'
                },
                {
                    $group: {
                        _id: null,
                        totalLogs: { $addToSet: '$_id' },
                        totalSuggestions: { $sum: 1 },
                        averageScore: { $avg: '$suggestions.compatibilityScore' },
                        scoreDistribution: {
                            $push: '$suggestions.compatibilityScore'
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalLogs: { $size: '$totalLogs' },
                        totalSuggestions: 1,
                        averageScore: { $round: ['$averageScore', 2] },
                        scoreDistribution: 1
                    }
                }
            ]);

            // Statistiques des rejets
            const rejectionStats = await MatchingRejectionLog.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRejections: { $sum: 1 },
                        averageScore: { $avg: '$matching_score' },
                        reasonDistribution: {
                            $push: '$rejection_reason'
                        },
                        categoryDistribution: {
                            $push: '$feedback_categories.category'
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRejections: 1,
                        averageScore: { $round: ['$averageScore', 2] },
                        reasonDistribution: 1,
                        categoryDistribution: 1
                    }
                }
            ]);

            // Préparer les résultats
            const stats = {
                matching: matchingStats.length ? matchingStats[0] : {
                    totalLogs: 0,
                    totalSuggestions: 0,
                    averageScore: 0,
                    scoreDistribution: []
                },
                rejection: rejectionStats.length ? rejectionStats[0] : {
                    totalRejections: 0,
                    averageScore: 0,
                    reasonDistribution: [],
                    categoryDistribution: []
                }
            };

            // Traiter la distribution des scores pour le frontend
            if (stats.matching.scoreDistribution.length) {
                // Grouper par tranches de 10 (0-10, 11-20, etc.)
                const scoreGroups = {
                    '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0,
                    '51-60': 0, '61-70': 0, '71-80': 0, '81-90': 0, '91-100': 0
                };

                stats.matching.scoreDistribution.forEach(score => {
                    const groupKey = `${Math.floor(score / 10) * 10 + 1}-${Math.min(Math.floor(score / 10) * 10 + 10, 100)}`;
                    if (score === 0) {
                        scoreGroups['0-10']++;
                    } else if (scoreGroups[groupKey] !== undefined) {
                        scoreGroups[groupKey]++;
                    }
                });

                stats.matching.scoreDistribution = Object.entries(scoreGroups).map(([range, count]) => ({
                    range,
                    count
                }));
            }

            // Traiter la distribution des raisons de rejet
            if (stats.rejection.reasonDistribution.length) {
                const reasonCounts = {};
                stats.rejection.reasonDistribution.forEach(reason => {
                    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
                });

                stats.rejection.reasonDistribution = Object.entries(reasonCounts).map(([reason, count]) => ({
                    reason,
                    count
                }));
            }

            // Traiter la distribution des catégories de rejet
            if (stats.rejection.categoryDistribution.length) {
                const categoryCounts = {};
                stats.rejection.categoryDistribution.flat().forEach(category => {
                    if (category) {
                        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                    }
                });

                stats.rejection.categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
                    category,
                    count
                }));
            }

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MatchingLogController(); 