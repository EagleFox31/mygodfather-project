const StatisticsAggregator = require('./aggregator');
const StatisticsReporter = require('./reporter');
const StatisticsAlerts = require('./alerts');
const StatisticsUtils = require('./utils');

class StatisticsService {
    constructor() {
        this.aggregator = new StatisticsAggregator();
        this.reporter = new StatisticsReporter();
        this.alerts = new StatisticsAlerts();
        this.utils = new StatisticsUtils();
    }

    // Obtenir toutes les statistiques pour le dashboard
    async getDashboardStats() {
        try {
            const [
                userStats,
                pairStats,
                sessionStats,
                matchingStats,
                activityStats,
                feedbackStats
            ] = await Promise.all([
                this.aggregator.getUserStats(),
                this.aggregator.getPairStats(),
                this.aggregator.getSessionStats(),
                this.aggregator.getMatchingStats(),
                this.aggregator.getActivityStats(),
                this.aggregator.getFeedbackStats()
            ]);

            const stats = {
                timestamp: new Date(),
                users: userStats,
                pairs: pairStats,
                sessions: sessionStats,
                matching: matchingStats,
                activity: activityStats,
                feedback: feedbackStats
            };

            // Vérifier les alertes
            const alerts = await this.alerts.checkAlerts(stats);
            if (alerts.length > 0) {
                stats.alerts = alerts;
                await this.alerts.notifyAlerts(alerts);
            }

            // Calculer les KPIs
            stats.kpis = {
                successRate: this.utils.calculateSuccessRate(stats),
                engagementRate: this.utils.calculateEngagementRate(stats),
                satisfactionScore: stats.feedback.avg_score
            };

            return stats;
        } catch (error) {
            throw error;
        }
    }

    // Générer un rapport complet
    async generateReport(startDate, endDate) {
        try {
            const stats = await this.getDashboardStats();
            stats.period = { start: startDate, end: endDate };

            // Générer les fichiers PDF et Excel
            const [pdfPath, excelPath] = await Promise.all([
                this.reporter.generatePDFReport(stats),
                this.reporter.generateExcelReport(stats)
            ]);

            return {
                stats,
                reports: {
                    pdf: pdfPath,
                    excel: excelPath
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Obtenir les statistiques filtrées par période
    async getStatsByPeriod(startDate, endDate) {
        return await this.aggregator.getStatsByPeriod(startDate, endDate);
    }

    // Obtenir les tendances
    async getTrends(period = 'month') {
        return await this.aggregator.getTrends(period);
    }

    // Obtenir les alertes actives
    async getActiveAlerts() {
        return await this.alerts.getActiveAlerts();
    }

    // Exporter les données
    async exportData(format, filters = {}) {
        const stats = await this.getDashboardStats();
        return format === 'pdf' 
            ? await this.reporter.generatePDFReport(stats, filters)
            : await this.reporter.generateExcelReport(stats, filters);
    }
}

module.exports = new StatisticsService();
