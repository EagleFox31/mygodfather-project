class StatisticsUtils {
    // Calculer un pourcentage
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    }

    // Calculer le taux de réussite
    calculateSuccessRate(stats) {
        const completedPairs = stats.pairs.current.find(s => s._id === 'inactive')?.count || 0;
        const totalPairs = stats.pairs.current.reduce((acc, curr) => acc + curr.count, 0);
        return this.calculatePercentage(completedPairs, totalPairs);
    }

    // Calculer le taux d'engagement
    calculateEngagementRate(stats) {
        const activeChannels = stats.activity.teams?.activeChannels || 0;
        const totalChannels = stats.pairs.current.find(s => s._id === 'active')?.count || 0;
        return this.calculatePercentage(activeChannels, totalChannels);
    }

    // Formater une durée en minutes en format lisible
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 
            ? `${hours}h ${remainingMinutes}min`
            : `${hours}h`;
    }

    // Calculer la moyenne
    calculateAverage(values) {
        if (!values || values.length === 0) return 0;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return Math.round((sum / values.length) * 10) / 10;
    }

    // Calculer la médiane
    calculateMedian(values) {
        if (!values || values.length === 0) return 0;
        
        const sorted = [...values].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);

        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        
        return sorted[middle];
    }

    // Calculer l'écart type
    calculateStandardDeviation(values) {
        if (!values || values.length === 0) return 0;
        
        const mean = this.calculateAverage(values);
        const squareDiffs = values.map(value => {
            const diff = value - mean;
            return diff * diff;
        });
        
        const avgSquareDiff = this.calculateAverage(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    // Calculer la progression
    calculateProgress(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    }

    // Formater un nombre avec séparateur de milliers
    formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Formater une date
    formatDate(date, format = 'short') {
        const d = new Date(date);
        
        switch (format) {
            case 'full':
                return d.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'medium':
                return d.toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            case 'short':
            default:
                return d.toLocaleDateString('fr-FR');
        }
    }

    // Calculer la différence entre deux dates en jours
    daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000; // heures*minutes*secondes*millisecondes
        const firstDate = new Date(date1);
        const secondDate = new Date(date2);
        return Math.round(Math.abs((firstDate - secondDate) / oneDay));
    }

    // Regrouper des données par période
    groupByPeriod(data, period = 'month', dateField = 'created_at') {
        const grouped = {};
        
        data.forEach(item => {
            const date = new Date(item[dateField]);
            let key;

            switch (period) {
                case 'day':
                    key = this.formatDate(date, 'short');
                    break;
                case 'week':
                    const weekNumber = this.getWeekNumber(date);
                    key = `Semaine ${weekNumber}`;
                    break;
                case 'month':
                    key = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
                    break;
                case 'quarter':
                    const quarter = Math.floor(date.getMonth() / 3) + 1;
                    key = `Q${quarter} ${date.getFullYear()}`;
                    break;
                case 'year':
                    key = date.getFullYear().toString();
                    break;
            }

            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(item);
        });

        return grouped;
    }

    // Obtenir le numéro de la semaine
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
}

module.exports = StatisticsUtils;
