const User = require('../../models/User');
const MentorMenteePair = require('../../models/MentorMenteePair');
const MentoringSession = require('../../models/MentoringSession');
const TeamsChat = require('../../models/TeamsChat');
const MatchingLog = require('../../models/MatchingLog');
const StatisticsUtils = require('./utils');

class StatisticsAggregator {
    constructor() {
        this.utils = new StatisticsUtils();
    }

    // Statistiques des utilisateurs
    async getUserStats() {
        try {
            const stats = await User.aggregate([
                {
                    $match: { deletedAt: null }
                },
                {
                    $group: {
                        _id: '$role',
                        total: { $sum: 1 },
                        activeUsers: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$role', 'mentor'] },
                                    { $cond: ['$disponibilite', 1, 0] },
                                    1
                                ]
                            }
                        }
                    }
                }
            ]);

            const mentors = stats.find(s => s._id === 'mentor')?.total || 0;
            const mentees = stats.find(s => s._id === 'mentee')?.total || 0;
            const availableMentors = stats.find(s => s._id === 'mentor')?.activeUsers || 0;

            return {
                byRole: stats,
                mentors: {
                    total: mentors,
                    active: availableMentors,
                    availability_rate: this.utils.calculatePercentage(availableMentors, mentors)
                },
                mentees: {
                    total: mentees,
                    waiting: await this.getWaitingMenteesCount()
                },
                ratios: {
                    mentorMentee: mentors > 0 ? (mentees / mentors).toFixed(2) : 0,
                    availableMentors: mentors > 0 ? (availableMentors / mentors * 100).toFixed(2) : 0
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Statistiques des paires
    async getPairStats() {
        try {
            const stats = await MentorMenteePair.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        avgDuration: {
                            $avg: {
                                $cond: [
                                    { $eq: ['$status', 'inactive'] },
                                    {
                                        $divide: [
                                            { $subtract: ['$end_date', '$created_at'] },
                                            1000 * 60 * 60 * 24 // Convertir en jours
                                        ]
                                    },
                                    null
                                ]
                            }
                        }
                    }
                }
            ]);

            // Tendances mensuelles
            const monthlyTrends = await MentorMenteePair.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: '$created_at' },
                            month: { $month: '$created_at' }
                        },
                        newPairs: { $sum: 1 },
                        endedPairs: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$status', 'inactive'] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            return {
                current: stats,
                trends: monthlyTrends
            };
        } catch (error) {
            throw error;
        }
    }

    // Statistiques des sessions
    async getSessionStats() {
        try {
            const stats = await MentoringSession.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalDuration: { $sum: '$duration' },
                        avgDuration: { $avg: '$duration' }
                    }
                }
            ]);

            const completed = stats.find(s => s._id === 'completed')?.count || 0;
            const total = stats.reduce((acc, curr) => acc + curr.count, 0);

            // Tendances hebdomadaires
            const weeklyTrends = await MentoringSession.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: '$date' },
                            week: { $week: '$date' }
                        },
                        sessions: { $sum: 1 },
                        completedSessions: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$status', 'completed'] },
                                    1,
                                    0
                                ]
                            }
                        },
                        totalDuration: { $sum: '$duration' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.week': 1 } }
            ]);

            return {
                current: stats,
                total,
                completed,
                completion_rate: this.utils.calculatePercentage(completed, total),
                avg_duration: Math.round(stats.find(s => s._id === 'completed')?.avgDuration || 0),
                trends: weeklyTrends
            };
        } catch (error) {
            throw error;
        }
    }

    // Statistiques du matching
    async getMatchingStats() {
        try {
            const stats = await MatchingLog.aggregate([
                {
                    $unwind: '$suggestions'
                },
                {
                    $group: {
                        _id: null,
                        total_matches: { $sum: 1 },
                        successful_matches: {
                            $sum: {
                                $cond: [
                                    { $gte: ['$suggestions.compatibilityScore', 80] },
                                    1,
                                    0
                                ]
                            }
                        },
                        avg_score: { $avg: '$suggestions.compatibilityScore' }
                    }
                }
            ]);

            // Distribution des scores
            const scoreDistribution = await MatchingLog.aggregate([
                {
                    $unwind: '$suggestions'
                },
                {
                    $group: {
                        _id: {
                            $switch: {
                                branches: [
                                    { case: { $lt: ['$suggestions.compatibilityScore', 20] }, then: '0-20' },
                                    { case: { $lt: ['$suggestions.compatibilityScore', 40] }, then: '20-40' },
                                    { case: { $lt: ['$suggestions.compatibilityScore', 60] }, then: '40-60' },
                                    { case: { $lt: ['$suggestions.compatibilityScore', 80] }, then: '60-80' },
                                    { case: { $lte: ['$suggestions.compatibilityScore', 100] }, then: '80-100' }
                                ]
                            }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);

            const stat = stats[0] || { total_matches: 0, successful_matches: 0, avg_score: 0 };

            return {
                total: stat.total_matches,
                successful: stat.successful_matches,
                success_rate: this.utils.calculatePercentage(stat.successful_matches, stat.total_matches),
                avg_score: Math.round(stat.avg_score * 10) / 10,
                distribution: scoreDistribution
            };
        } catch (error) {
            throw error;
        }
    }

    // Statistiques d'activité
    async getActivityStats() {
        try {
            // Activité Teams
            const teamsActivity = await TeamsChat.aggregate([
                {
                    $group: {
                        _id: null,
                        totalMessages: { $sum: '$messages_count' },
                        avgMessagesPerChannel: { $avg: '$messages_count' },
                        activeChannels: {
                            $sum: {
                                $cond: [
                                    {
                                        $gte: [
                                            '$last_activity',
                                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 jours
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            // Tendances d'activité par jour
            const dailyActivity = await TeamsChat.aggregate([
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$last_activity' } }
                        },
                        messageCount: { $sum: '$messages_count' }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ]);

            return {
                teams: teamsActivity[0],
                daily: dailyActivity
            };
        } catch (error) {
            throw error;
        }
    }

    // Statistiques de feedback
    async getFeedbackStats() {
        try {
            const stats = await MentoringSession.aggregate([
                {
                    $unwind: '$feedback'
                },
                {
                    $group: {
                        _id: null,
                        total_feedback: { $sum: 1 },
                        avg_score: { $avg: '$feedback.rating' },
                        satisfaction: {
                            $sum: {
                                $cond: [
                                    { $gte: ['$feedback.rating', 4] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            const stat = stats[0] || { total_feedback: 0, avg_score: 0, satisfaction: 0 };

            return {
                total: stat.total_feedback,
                avg_score: Math.round(stat.avg_score * 10) / 10,
                satisfaction_rate: this.utils.calculatePercentage(stat.satisfaction, stat.total_feedback)
            };
        } catch (error) {
            throw error;
        }
    }

    // Obtenir le nombre de mentorés en attente
    async getWaitingMenteesCount() {
        return await User.countDocuments({
            role: 'mentee',
            _id: {
                $nin: await MentorMenteePair.distinct('mentee_id', {
                    status: { $in: ['active', 'completed'] }
                })
            }
        });
    }

    // Obtenir les statistiques par période
    async getStatsByPeriod(startDate, endDate) {
        // Implémenter les statistiques filtrées par période
        return null;
    }

    // Obtenir les tendances
    async getTrends(period = 'month') {
        // Implémenter les tendances
        return null;
    }
}

module.exports = StatisticsAggregator;
