// /src/services/statisticsService.js

const MentorMenteePair = require('../models/MentorMenteePair');
const MentoringSession = require('../models/MentoringSession');
const User = require('../models/User');
const MatchingLog = require('../models/MatchingLog');
const NotificationService = require('./notificationService');
const StatisticsHistory = require('../models/StatisticsHistory');
const Message = require('../models/Message');

const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const createError = require('http-errors');

class StatisticsService {
    constructor() {
        this.alertThresholds = {
            mentor_availability: 30, // Alerte si < 30% de mentors dispos
            matching_success: 70,    // Alerte si < 70% de matchings réussis
            session_completion: 80,  // Alerte si < 80% de sessions complétées
            feedback_score: 3.5      // Alerte si score moyen < 3.5/5
        };
    }

    // -------------------------------------------------------------
    // 1) GESTION DES DATES
    // -------------------------------------------------------------

    getDateRangeForDay(date = new Date()) {
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        return { start, end };
    }

    /**
     * day: la journée courante
     * week: 7 derniers jours
     * month: depuis le 1er du mois
     * => Ajuste selon tes besoins
     */
    getDateRangeForPeriod(period = 'day') {
        const now = new Date();
        let start, end;

        switch (period) {
            case 'week':
                start = new Date(now);
                start.setDate(start.getDate() - 7);
                start.setHours(0, 0, 0, 0);
                break;
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                break;
            case 'day':
            default:
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        }
        end = new Date();
        end.setHours(23, 59, 59, 999);

        return { start, end };
    }

    // -------------------------------------------------------------
    // 2) RÉCUPÉRATION DES STATS
    // -------------------------------------------------------------

    /**
     * Récupère un "pack" de stats (users, matching, sessions, feedback),
     * + le nombre de sessions/messages sur la plage [startDate, endDate].
     */
    async getStatsForDateRange(startDate, endDate) {
        try {
            // Pour un "vrai" historique, tu peux filtrer User/MatchingLog
            // selon createdAt <= endDate, etc. 
            // Ici, on fait simple + on compte juste sessions/messages par date.
            const [
                userStats,
                matchingStats,
                sessionStats,
                feedbackStats,
                sessionsCount,
                messagesCount
            ] = await Promise.all([
                this.getUserStats(),
                this.getMatchingStats(),
                this.getSessionStats(),
                this.getFeedbackStats(),
                MentoringSession.countDocuments({ date: { $gte: startDate, $lte: endDate } }),
                Message.countDocuments({ created_at: { $gte: startDate, $lte: endDate } })
            ]);

            return {
                users: userStats,
                matching: matchingStats,
                sessions: {
                    ...sessionStats,
                    today: sessionsCount
                },
                messages: {
                    totalToday: messagesCount
                },
                feedback: feedbackStats
            };
        } catch (error) {
            console.error(`❌ Erreur getStatsForDateRange(${startDate.toISOString()} - ${endDate.toISOString()}):`, error);
            throw error;
        }
    }

    // -------------------------------------------------------------
    // 3) GÉNÉRATION DES STATS (période) + ALERTES
    // -------------------------------------------------------------

    async generateStats(period = 'day') {
        try {
            const { start, end } = this.getDateRangeForPeriod(period);
            const stats = await this.getStatsForDateRange(start, end);

            // Check alertes
            const alerts = await this.checkAlerts(stats);
            if (alerts.length > 0) {
                stats.alerts = alerts;
                await this.notifyAlerts(alerts);
            }

            return {
                period,
                timestamp: new Date(),
                ...stats
            };
        } catch (error) {
            console.error('❌ Erreur lors de la génération des statistiques:', error);
            throw error;
        }
    }

    /**
     * getDashboardStats: stats "aujourd'hui" + compare à "hier" => trend
     */
    async getDashboardStats(queryParams = {}) {
        // statsToday
        const statsToday = await this.generateStats(queryParams.period || 'day');

        // snapshot d'hier
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const { start: startOfYesterday, end: endOfYesterday } = this.getDateRangeForDay(yesterday);

        const snapshotYesterday = await StatisticsHistory.findOne({
            date: { $gte: startOfYesterday, $lte: endOfYesterday }
        }).sort({ date: -1 });

        let usersTrend = 0, mentorsTrend = 0, sessionsTrend = 0, messagesTrend = 0;
        let feedbackTrend = 0, matchingTrend = 0;

        if (snapshotYesterday) {
            const totalUsersToday = (statsToday.users.mentors.total + statsToday.users.mentees.total) || 0;
            const totalUsersYesterday = snapshotYesterday.users_total || 0;
            usersTrend = this.calculateTrend(totalUsersToday, totalUsersYesterday);

            const mentorsActiveToday = statsToday.users.mentors.active || 0;
            const mentorsActiveYesterday = snapshotYesterday.mentors_active || 0;
            mentorsTrend = this.calculateTrend(mentorsActiveToday, mentorsActiveYesterday);

            const sessionsTodayCount = statsToday.sessions.today || 0;
            const sessionsYesterdayCount = snapshotYesterday.sessions_today || 0;
            sessionsTrend = this.calculateTrend(sessionsTodayCount, sessionsYesterdayCount);

            const messagesTodayCount = statsToday.messages.totalToday || 0;
            const messagesYesterdayCount = snapshotYesterday.messages_today || 0;
            messagesTrend = this.calculateTrend(messagesTodayCount, messagesYesterdayCount);

            const feedbackToday = statsToday.feedback.avg_score || 0;
            const feedbackYesterday = snapshotYesterday.feedback_avg_score || 0;
            feedbackTrend = this.calculateTrend(feedbackToday, feedbackYesterday);

            const matchingToday = statsToday.matching.success_rate || 0;
            const matchingYesterday = snapshotYesterday.matching_success_rate || 0;
            matchingTrend = this.calculateTrend(matchingToday, matchingYesterday);
        }

        statsToday.trends = {
            users: usersTrend,
            activeMentors: mentorsTrend,
            sessionsToday: sessionsTrend,
            messagesToday: messagesTrend,
            feedback: feedbackTrend,
            matching: matchingTrend
        };

        return statsToday;
    }

    // -------------------------------------------------------------
    // 4) SNAPSHOT (cron) 
    // -------------------------------------------------------------

    async snapshotDailyStats() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const { start, end } = this.getDateRangeForDay(yesterday);
            const stats = await this.getStatsForDateRange(start, end);

            const totalUsers = (stats.users.mentors.total || 0) + (stats.users.mentees.total || 0);
            const alertsCount = stats.alerts ? stats.alerts.length : 0;

            const sessionsCompleted = stats.sessions.completed || 0;
            const sessionCompletionRate = stats.sessions.completion_rate || 0;
            const totalMatches = stats.matching.total || 0;
            const matchingSuccessRate = stats.matching.success_rate || 0;

            await StatisticsHistory.create({
                date: start, // ex: "2025-03-30T00:00:00.000Z"
                users_total: totalUsers,
                mentors_active: stats.users.mentors.active,
                mentor_availability: stats.users.mentors.availability_rate,
                mentees_total: stats.users.mentees.total,

                total_matches: totalMatches,
                matching_success_rate: matchingSuccessRate,

                sessions_today: stats.sessions.today,
                sessions_completed: sessionsCompleted,
                session_completion_rate: sessionCompletionRate,

                messages_today: stats.messages.totalToday,

                feedback_avg_score: stats.feedback.avg_score,
                feedback_satisfaction_rate: stats.feedback.satisfaction_rate,

                alerts_count: alertsCount
            });

            console.log(`✅ Snapshot daily stats enregistré pour le ${start.toDateString()}`);
        } catch (error) {
            console.error('❌ Erreur snapshotDailyStats:', error);
        }
    }

    // -------------------------------------------------------------
    // 5) GESTION DES RAPPORTS (generateReport), ALERTES (getAlerts), EXPORT
    // -------------------------------------------------------------

    /**
     * Générer un rapport (PDF ou Excel) sur la base d’une période
     * + sections demandées (ex: ['users', 'matching', 'sessions', 'feedback', 'activity'])
     */
    async generateReport(type, period, startDate, endDate, sections = []) {
        try {
            // 1) Déterminer la plage de dates
            let start, end;
            if (startDate && endDate) {
                // Si l’utilisateur fournit startDate/endDate
                start = new Date(startDate);
                end = new Date(endDate);
            } else {
                // Sinon on calcule via period
                const range = this.getDateRangeForPeriod(period || 'month');
                start = range.start;
                end = range.end;
            }

            // 2) Récupérer les stats sur la plage
            const stats = await this.getStatsForDateRange(start, end);

            // 3) Construire le rapport
            if (type === 'pdf') {
                // Générer un PDF (ex: PDFDocument)
                const doc = new PDFDocument({ margin: 30 });
                const filePath = path.join(__dirname, `../../reports/report-${Date.now()}.pdf`);
                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);

                doc.fontSize(18).text(`Rapport Statistiques (${period})`, { underline: true });
                doc.moveDown();

                // Selon sections, tu affiches ce que tu veux
                if (sections.includes('users') || sections.length === 0) {
                    doc.fontSize(14).text(`Users:`);
                    doc.fontSize(12).text(` - Mentors: ${stats.users.mentors.total}`);
                    doc.text(` - Mentees: ${stats.users.mentees.total}`);
                    doc.moveDown();
                }
                // etc. matching, sessions, feedback...

                doc.end();

                // On attend la fin de l’écriture
                await new Promise((resolve) => writeStream.on('finish', resolve));
                return {
                    success: true,
                    filePath,
                    message: 'Rapport PDF généré'
                };
            }
            else if (type === 'excel') {
                // Générer un Excel (ex: ExcelJS)
                const workbook = new ExcelJS.Workbook();
                const sheet = workbook.addWorksheet('Statistiques');

                sheet.addRow([`Rapport Statistiques (${period})`]);
                sheet.addRow([]);

                if (sections.includes('users') || sections.length === 0) {
                    sheet.addRow(['Users', 'Mentors', 'Mentees']);
                    sheet.addRow(['', stats.users.mentors.total, stats.users.mentees.total]);
                    sheet.addRow([]);
                }
                // etc. matching, sessions, feedback...

                const filePath = path.join(__dirname, `../../reports/report-${Date.now()}.xlsx`);
                await workbook.xlsx.writeFile(filePath);

                return {
                    success: true,
                    filePath,
                    message: 'Rapport Excel généré'
                };
            }

            // Sinon, type inconnu
            throw createError(400, `Type de rapport invalide: ${type}`);
        } catch (error) {
            console.error('❌ Erreur generateReport:', error);
            throw error;
        }
    }

    /**
     * getAlerts(query): renvoie des alertes (ex: stockées en base ? ou recalculées ?)
     * Ici, on propose un simple recalcul sur la période ou un mode "live"
     */
    async getAlerts(query) {
        try {
            // Ex: si on veut un mode "live", on calcule un generateStats => checkAlerts
            // Sinon, on stockerait des alertes en DB, qu'on filtre
            const period = query.period || 'day';
            const stats = await this.generateStats(period);
            return stats.alerts || [];
        } catch (error) {
            console.error('❌ Erreur getAlerts:', error);
            throw error;
        }
    }

    /**
     * exportData(format, data, filters, startDate, endDate, includeHeaders)
     * => renvoie CSV, Excel ou JSON pour la "liste" demandée (users, pairs, sessions, matching, feedback, activity)
     */
    async exportData(format, data, filters = {}, startDate, endDate, includeHeaders = true) {
        try {
            // 1) Déterminer la plage
            let s, e;
            if (startDate && endDate) {
                s = new Date(startDate);
                e = new Date(endDate);
            } else {
                // Par défaut, on prend "day"
                const range = this.getDateRangeForPeriod('day');
                s = range.start;
                e = range.end;
            }

            // 2) Selon "data" (ex: ['users','pairs','sessions','matching','feedback','activity']), on récupère
            //   - Soit via getStatsForDateRange(s,e)
            //   - Soit via d'autres queries + filters
            const stats = await this.getStatsForDateRange(s, e);

            // 3) Construire la sortie
            // Pour l'exemple, on fait un JSON direct ou CSV
            if (format === 'json') {
                // Filtrer "sections" => ex: on renvoie seulement stats.users si "users" in data
                const result = {};
                if (data.includes('users')) result.users = stats.users;
                if (data.includes('sessions')) result.sessions = stats.sessions;
                if (data.includes('matching')) result.matching = stats.matching;
                if (data.includes('feedback')) result.feedback = stats.feedback;
                // etc.

                return result;
            }
            else if (format === 'csv') {
                // On fait un CSV "simpliste"
                let csvContent = '';

                if (data.includes('users')) {
                    csvContent += 'USERS,MENTORS,MENTEES\n';
                    csvContent += `,${stats.users.mentors.total},${stats.users.mentees.total}\n\n`;
                }
                // etc.

                return csvContent; // Tu renverras au contrôleur, qui fera res.send(...) ou un fichier
            }
            else if (format === 'excel') {
                // Pareil qu'au-dessus: un Workbook
                const workbook = new ExcelJS.Workbook();
                const sheet = workbook.addWorksheet('Export');

                // ex:
                if (data.includes('users')) {
                    sheet.addRow(['Users', 'Mentors', 'Mentees']);
                    sheet.addRow(['', stats.users.mentors.total, stats.users.mentees.total]);
                }

                const filePath = path.join(__dirname, `../../exports/export-${Date.now()}.xlsx`);
                await workbook.xlsx.writeFile(filePath);

                return { filePath };
            }

            throw createError(400, `Format d'export invalide: ${format}`);
        } catch (error) {
            console.error('❌ Erreur exportData:', error);
            throw error;
        }
    }

    // -------------------------------------------------------------
    // 6) ALERTES + UTILS
    // -------------------------------------------------------------

    async checkAlerts(stats) {
        const alerts = [];

        // Mentor availability
        if (stats.users.mentors.availability_rate < this.alertThresholds.mentor_availability) {
            alerts.push({
                type: 'warning',
                category: 'mentors',
                message: `La disponibilité des mentors est basse (${stats.users.mentors.availability_rate}%)`,
                threshold: this.alertThresholds.mentor_availability,
                current_value: stats.users.mentors.availability_rate
            });
        }
        // Matching
        if (stats.matching.success_rate < this.alertThresholds.matching_success) {
            alerts.push({
                type: 'warning',
                category: 'matching',
                message: `Le taux de réussite du matching est bas (${stats.matching.success_rate}%)`,
                threshold: this.alertThresholds.matching_success,
                current_value: stats.matching.success_rate
            });
        }
        // Sessions
        if (stats.sessions.completion_rate < this.alertThresholds.session_completion) {
            alerts.push({
                type: 'warning',
                category: 'sessions',
                message: `Le taux de complétion des sessions est bas (${stats.sessions.completion_rate}%)`,
                threshold: this.alertThresholds.session_completion,
                current_value: stats.sessions.completion_rate
            });
        }
        // Feedback
        if (stats.feedback.avg_score < this.alertThresholds.feedback_score) {
            alerts.push({
                type: 'warning',
                category: 'feedback',
                message: `Le score moyen de feedback est bas (${stats.feedback.avg_score}/5)`,
                threshold: this.alertThresholds.feedback_score,
                current_value: stats.feedback.avg_score
            });
        }

        return alerts;
    }

    async notifyAlerts(alerts) {
        for (const alert of alerts) {
            await NotificationService.notifyHR(
                `Alerte : ${alert.category}`,
                alert.message,
                'warning',
                'statistics'
            );
        }
    }

    // -------------------------------------------------------------
    // 7) FONCTIONS INDIVIDUELLES
    // -------------------------------------------------------------

    async getUserStats() {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    total: { $sum: 1 },
                    active: {
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

        return {
            mentors: {
                total: stats.find(s => s._id === 'mentor')?.total || 0,
                active: stats.find(s => s._id === 'mentor')?.active || 0,
                availability_rate: this.calculatePercentage(
                    stats.find(s => s._id === 'mentor')?.active || 0,
                    stats.find(s => s._id === 'mentor')?.total || 0
                )
            },
            mentees: {
                total: stats.find(s => s._id === 'mentee')?.total || 0,
                waiting: await this.getWaitingMenteesCount()
            }
        };
    }

    async getMatchingStats() {
        // Reprend votre agrégation existante
        const stats = await MatchingLog.aggregate([
          { $unwind: '$suggestions' },
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
      
        const stat = stats[0] || {
          total_matches: 0,
          successful_matches: 0,
          avg_score: 0
        };
      
        // On calcule la “dernière suggestion” en se basant
        // sur le champ createdAt de MatchingLog (ou suggestions.createdAt).
        // On récupère le plus récent MatchingLog :
        const lastLog = await MatchingLog
          .findOne({})
          .sort({ createdAt: -1 }) // tri descendant par createdAt
          .lean();
      
        let lastScore = 0;
        if (lastLog && lastLog.suggestions && lastLog.suggestions.length > 0) {
          // on peut prendre la 1ère suggestion ou la suggestion la plus haute
          // selon votre logique métier. Ex. la suggestion 0 :
          lastScore = lastLog.suggestions[0].compatibilityScore;
        }
      
        // On renvoie maintenant last_score dans l’objet final
        return {
          total: stat.total_matches,
          successful: stat.successful_matches,
          success_rate: this.calculatePercentage(stat.successful_matches, stat.total_matches),
          avg_score: Math.round(stat.avg_score * 10) / 10,
          last_score: lastScore, // <-- on ajoute ceci
        };
      }
      
    async getSessionStats() {
        const stats = await MentoringSession.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avg_duration: { $avg: '$duration' }
                }
            }
        ]);

        const completed = stats.find(s => s._id === 'completed')?.count || 0;
        const total = stats.reduce((acc, curr) => acc + curr.count, 0);

        return {
            total,
            completed,
            completion_rate: this.calculatePercentage(completed, total),
            avg_duration: Math.round(stats.find(s => s._id === 'completed')?.avg_duration || 0)
        };
    }

    async getFeedbackStats() {
        const stats = await MentoringSession.aggregate([
            { $unwind: '$feedback' },
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
            satisfaction_rate: this.calculatePercentage(stat.satisfaction, stat.total_feedback)
        };
    }

    // -------------------------------------------------------------
    // 8) UTILS
    // -------------------------------------------------------------

    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    }

    calculateTrend(current, previous) {
        if (!previous || previous === 0) return 0;
        const diff = current - previous;
        return Math.round((diff / previous) * 1000) / 10;
    }

    async getWaitingMenteesCount() {
        return User.countDocuments({
            role: 'mentee',
            _id: {
                $nin: await MentorMenteePair.distinct('mentee_id', {
                    status: { $in: ['active', 'completed'] }
                })
            }
        });
    }

    /**
 * getMatchingDistribution:
 *  - Calcule la distribution des scores (bucket) sur la période demandée (ou jour/7j/mois).
 */
    async getMatchingDistribution(query) {
        try {
            // 1) Déterminer la plage [startDate, endDate]
            let { startDate, endDate, period } = query;

            let start, end;
            if (startDate && endDate) {
                start = new Date(startDate);
                end = new Date(endDate);
            } else {
                // Sinon, on calcule par rapport à "period"
                const now = new Date();
                end = new Date(now); // ex: aujourd'hui
                end.setHours(23, 59, 59, 999);

                if (period === 'week') {
                    start = new Date(now);
                    start.setDate(start.getDate() - 7);
                    start.setHours(0, 0, 0, 0);
                } else if (period === 'month') {
                    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                } else {
                    // period = 'day' par défaut
                    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                }
            }

            // 2) Pipeline d'agrégation
            const pipeline = [
                // Déplie d’abord le tableau suggestions
                { $unwind: '$suggestions' },

                // Ensuite, on match sur la date DANS suggestions
                {
                    $match: {
                        'suggestions.createdAt': { $gte: start, $lte: end }
                    }
                },

                // Bucket sur suggestions.compatibilityScore
                {
                    $bucket: {
                        groupBy: '$suggestions.compatibilityScore',
                        boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                        default: 'OutOfRange',
                        output: {
                            count: { $sum: 1 }
                        }
                    }
                },

                // Tri par _id pour avoir l’ordre
                { $sort: { _id: 1 } }
            ];
            const result = await MatchingLog.aggregate(pipeline);

            // 3) Formater un peu le résultat
            // Par ex, renvoyer un tableau: [ { range: '0-10', count: 5 }, ... ]
            // _id = '0 - 10' (Mongo le formatte ainsi), ou bien c'est { lower, upper } si tu veux
            const distribution = result.map((bin) => {
                // Si bin._id = 'OutOfRange', on peut l'ignorer ou le renvoyer
                if (bin._id === 'OutOfRange') {
                    return {
                        range: 'OutOfRange',
                        count: bin.count
                    };
                }
                return {
                    range: bin._id, // ex: '0 - 10'
                    count: bin.count
                };
            });

            return {
                startDate: start,
                endDate: end,
                distribution
            };
        } catch (error) {
            console.error('❌ Erreur getMatchingDistribution:', error);
            throw createError(500, 'Impossible de calculer la distribution');
        }
    }

    async getTimeSeriesData(metric = 'sessions', period = 'week') {
        const { start, end } = this.getDateRangeForPeriod(period);
      
        const days = [];
        let cursor = new Date(start);
      
        while (cursor <= end) {
          const { start: dStart, end: dEnd } = this.getDateRangeForDay(cursor);
      
          let value = 0;
      
          switch (metric) {
            case 'sessions':
              value = await MentoringSession.countDocuments({ date: { $gte: dStart, $lte: dEnd } });
              break;
      
            case 'messages':
              value = await Message.countDocuments({ created_at: { $gte: dStart, $lte: dEnd } });
              break;
      
            case 'users':
              value = await User.countDocuments({ createdAt: { $gte: dStart, $lte: dEnd } });
              break;
      
            case 'feedback':
              const feedbackStats = await MentoringSession.aggregate([
                { $match: { 'feedback.createdAt': { $gte: dStart, $lte: dEnd } } },
                { $unwind: '$feedback' },
                {
                  $match: { 'feedback.createdAt': { $gte: dStart, $lte: dEnd } }
                },
                {
                  $group: {
                    _id: null,
                    avg: { $avg: '$feedback.rating' }
                  }
                }
              ]);
              value = Math.round((feedbackStats[0]?.avg || 0) * 10) / 10;
              break;
      
            case 'matchings':
              const matchingStats = await MatchingLog.aggregate([
                { $unwind: '$suggestions' },
                {
                  $match: { 'suggestions.createdAt': { $gte: dStart, $lte: dEnd } }
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 }
                  }
                }
              ]);
              value = matchingStats[0]?.count || 0;
              break;
      
            default:
              throw new Error(`Métrique inconnue : ${metric}`);
          }
      
          days.push({
            date: dStart.toISOString().slice(0, 10), // format YYYY-MM-DD
            value
          });
      
          cursor.setDate(cursor.getDate() + 1);
        }
      
        return days;
      }


    /**
     * Récupère les derniers événements (User, Session, MatchingLog, Message)
     * avec pagination (limit, offset) et filtre par type.
     * Chaque item est formaté comme { id, type, severity, message, timestamp }.
     * @param {Object} query - Peut contenir limit, offset, type (user, session, matching, message)
     * @returns {Array} Liste paginée des événements récents
     */
    async getRecentActivity(query = {}) {
        try {
        const limit = parseInt(query.limit) || 10;
        const offset = parseInt(query.offset) || 0;
        const filterType = query.type; // 'user' | 'session' | 'matching' | 'message' ou undefined pour tout

        const activities = [];

        // 1) Derniers utilisateurs
        if (!filterType || filterType === 'user') {
            const users = await User.find({}, { name: 1, prenom: 1, role: 1, createdAt: 1 })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
            users.forEach(u => {
            activities.push({
                id: u._id,
                type: 'user',
                severity: 'success',
                message: `New ${u.role} joined: ${u.prenom} ${u.name}`,
                timestamp: u.createdAt
            });
            });
        }

        // 2) Dernières sessions
        if (!filterType || filterType === 'session') {
            const sessions = await MentoringSession.find({}, { date: 1, created_at: 1 })
            .sort({ created_at: -1 })
            .limit(100)
            .lean();
            sessions.forEach(s => {
            activities.push({
                id: s._id,
                type: 'session',
                severity: 'info',
                message: `New session scheduled on ${new Date(s.date).toLocaleString()}`,
                timestamp: s.created_at
            });
            });
        }

        // 3) Derniers logs de matching
        if (!filterType || filterType === 'matching') {
            // Supposons ici que MatchingLog possède un champ "createdAt"
            const logs = await MatchingLog.find({}, { menteeId: 1, createdAt: 1 })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('menteeId', 'name prenom')
            .lean();
            logs.forEach(m => {
            activities.push({
                id: m._id,
                type: 'matching',
                severity: 'info',
                message: `Matching created for mentee ${m.menteeId?.prenom} ${m.menteeId?.name}`,
                timestamp: m.createdAt
            });
            });
        }

        // 4) Derniers messages
        if (!filterType || filterType === 'message') {
            const messages = await Message.find({}, { sender_id: 1, content: 1, created_at: 1 })
            .sort({ created_at: -1 })
            .limit(100)
            .populate('sender_id', 'name prenom')
            .lean();
            messages.forEach(msg => {
            const sender = msg.sender_id
                ? `${msg.sender_id.prenom} ${msg.sender_id.name}`
                : 'Unknown';
            activities.push({
                id: msg._id,
                type: 'message',
                severity: 'info',
                message: `Message from ${sender}: "${msg.content.slice(0, 50)}"`,
                timestamp: msg.created_at
            });
            });
        }

        // Tri global par date décroissante
        activities.sort((a, b) => b.timestamp - a.timestamp);

        // Pagination
        const paginated = activities.slice(offset, offset + limit);

        return paginated;
        } catch (error) {
        console.error('❌ Erreur getRecentActivity:', error);
        throw error;
        }
    }
  
  
  
  
      
}

module.exports = new StatisticsService();
