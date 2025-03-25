const NotificationService = require('../notificationService');

class StatisticsAlerts {
    constructor() {
        this.thresholds = {
            mentor_availability: 30, // Alerte si moins de 30% des mentors sont disponibles
            matching_success: 70,    // Alerte si moins de 70% de matchings réussis
            session_completion: 80,  // Alerte si moins de 80% des sessions sont complétées
            feedback_score: 3.5,     // Alerte si score moyen < 3.5/5
            engagement_rate: 60      // Alerte si moins de 60% des canaux sont actifs
        };
    }

    // Vérifier les alertes
    async checkAlerts(stats) {
        const alerts = [];

        // Disponibilité des mentors
        if (stats.users.mentors.availability_rate < this.thresholds.mentor_availability) {
            alerts.push({
                type: 'warning',
                category: 'mentors',
                message: `La disponibilité des mentors est basse (${stats.users.mentors.availability_rate}%)`,
                threshold: this.thresholds.mentor_availability,
                current_value: stats.users.mentors.availability_rate,
                severity: this.calculateSeverity(
                    stats.users.mentors.availability_rate,
                    this.thresholds.mentor_availability
                )
            });
        }

        // Taux de réussite du matching
        if (stats.matching.success_rate < this.thresholds.matching_success) {
            alerts.push({
                type: 'warning',
                category: 'matching',
                message: `Le taux de réussite du matching est bas (${stats.matching.success_rate}%)`,
                threshold: this.thresholds.matching_success,
                current_value: stats.matching.success_rate,
                severity: this.calculateSeverity(
                    stats.matching.success_rate,
                    this.thresholds.matching_success
                )
            });
        }

        // Taux de complétion des sessions
        if (stats.sessions.completion_rate < this.thresholds.session_completion) {
            alerts.push({
                type: 'warning',
                category: 'sessions',
                message: `Le taux de complétion des sessions est bas (${stats.sessions.completion_rate}%)`,
                threshold: this.thresholds.session_completion,
                current_value: stats.sessions.completion_rate,
                severity: this.calculateSeverity(
                    stats.sessions.completion_rate,
                    this.thresholds.session_completion
                )
            });
        }

        // Score de feedback
        if (stats.feedback.avg_score < this.thresholds.feedback_score) {
            alerts.push({
                type: 'warning',
                category: 'feedback',
                message: `Le score moyen de feedback est bas (${stats.feedback.avg_score}/5)`,
                threshold: this.thresholds.feedback_score,
                current_value: stats.feedback.avg_score,
                severity: this.calculateSeverity(
                    stats.feedback.avg_score * 20, // Convertir en pourcentage
                    this.thresholds.feedback_score * 20
                )
            });
        }

        // Taux d'engagement
        const engagementRate = this.calculateEngagementRate(stats);
        if (engagementRate < this.thresholds.engagement_rate) {
            alerts.push({
                type: 'warning',
                category: 'engagement',
                message: `Le taux d'engagement est bas (${engagementRate}%)`,
                threshold: this.thresholds.engagement_rate,
                current_value: engagementRate,
                severity: this.calculateSeverity(
                    engagementRate,
                    this.thresholds.engagement_rate
                )
            });
        }

        // Trier les alertes par sévérité
        alerts.sort((a, b) => b.severity - a.severity);

        return alerts;
    }

    // Notifier les RH des alertes
    async notifyAlerts(alerts) {
        for (const alert of alerts) {
            const title = `Alerte ${this.getSeverityLabel(alert.severity)} : ${alert.category}`;
            const message = this.formatAlertMessage(alert);

            await NotificationService.notifyHR(
                title,
                message,
                alert.severity >= 0.7 ? 'error' : 'warning',
                'statistics'
            );
        }
    }

    // Calculer la sévérité d'une alerte (0-1)
    calculateSeverity(currentValue, threshold) {
        const diff = threshold - currentValue;
        const maxDiff = threshold; // La différence maximale possible

        return Math.min(Math.max(diff / maxDiff, 0), 1);
    }

    // Obtenir le label de sévérité
    getSeverityLabel(severity) {
        if (severity >= 0.7) return 'CRITIQUE';
        if (severity >= 0.4) return 'IMPORTANTE';
        return 'MODÉRÉE';
    }

    // Formater le message d'alerte
    formatAlertMessage(alert) {
        const severityLabel = this.getSeverityLabel(alert.severity);
        const percentageDiff = ((alert.threshold - alert.current_value) / alert.threshold * 100).toFixed(1);

        return `${alert.message}\n` +
               `Sévérité: ${severityLabel}\n` +
               `Écart par rapport à l'objectif: ${percentageDiff}%\n` +
               `Valeur actuelle: ${alert.current_value}\n` +
               `Objectif: ${alert.threshold}`;
    }

    // Calculer le taux d'engagement
    calculateEngagementRate(stats) {
        const activeChannels = stats.activity.teams?.activeChannels || 0;
        const totalChannels = stats.pairs.current.find(s => s._id === 'active')?.count || 0;
        
        if (totalChannels === 0) return 0;
        return Math.round((activeChannels / totalChannels) * 100);
    }

    // Obtenir les alertes actives
    async getActiveAlerts() {
        // Cette méthode pourrait être utilisée pour récupérer les alertes
        // stockées en base de données si nécessaire
        return [];
    }

    // Mettre à jour les seuils d'alerte
    updateThresholds(newThresholds) {
        this.thresholds = {
            ...this.thresholds,
            ...newThresholds
        };
    }
}

module.exports = StatisticsAlerts;
