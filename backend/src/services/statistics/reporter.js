const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class StatisticsReporter {
    constructor() {
        this.uploadsDir = path.join(__dirname, '../../../uploads');
        this.ensureUploadsDirectory();
    }

    // Générer un rapport PDF
    async generatePDFReport(stats, filters = {}) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const filename = `rapport_${new Date().toISOString()}.pdf`;
                const filepath = path.join(this.uploadsDir, filename);
                const stream = fs.createWriteStream(filepath);

                doc.pipe(stream);

                // En-tête
                this.addPDFHeader(doc, stats);
                
                // Résumé
                this.addPDFSummary(doc, stats);
                
                // Statistiques détaillées
                this.addPDFDetailedStats(doc, stats);
                
                // Graphiques et tendances
                this.addPDFCharts(doc, stats);
                
                // Alertes
                if (stats.alerts && stats.alerts.length > 0) {
                    this.addPDFAlerts(doc, stats.alerts);
                }

                doc.end();

                stream.on('finish', () => resolve(filepath));
                stream.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Générer un rapport Excel
    async generateExcelReport(stats, filters = {}) {
        try {
            const workbook = new ExcelJS.Workbook();
            const filename = `rapport_${new Date().toISOString()}.xlsx`;
            const filepath = path.join(this.uploadsDir, filename);

            // Feuille Résumé
            const summarySheet = workbook.addWorksheet('Résumé');
            this.addExcelSummary(summarySheet, stats);

            // Feuille Utilisateurs
            const usersSheet = workbook.addWorksheet('Utilisateurs');
            this.addExcelUserStats(usersSheet, stats.users);

            // Feuille Matching
            const matchingSheet = workbook.addWorksheet('Matching');
            this.addExcelMatchingStats(matchingSheet, stats.matching);

            // Feuille Sessions
            const sessionsSheet = workbook.addWorksheet('Sessions');
            this.addExcelSessionStats(sessionsSheet, stats.sessions);

            // Feuille Activité
            const activitySheet = workbook.addWorksheet('Activité');
            this.addExcelActivityStats(activitySheet, stats.activity);

            // Feuille Feedback
            const feedbackSheet = workbook.addWorksheet('Feedback');
            this.addExcelFeedbackStats(feedbackSheet, stats.feedback);

            // Feuille Alertes
            if (stats.alerts && stats.alerts.length > 0) {
                const alertsSheet = workbook.addWorksheet('Alertes');
                this.addExcelAlerts(alertsSheet, stats.alerts);
            }

            await workbook.xlsx.writeFile(filepath);
            return filepath;
        } catch (error) {
            throw error;
        }
    }

    // Méthodes privées pour la génération PDF
    addPDFHeader(doc, stats) {
        doc.fontSize(20).text('Rapport de Mentorat', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Généré le ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();
        
        if (stats.period) {
            doc.text(`Période : ${new Date(stats.period.start).toLocaleDateString()} - ${new Date(stats.period.end).toLocaleDateString()}`);
            doc.moveDown();
        }
    }

    addPDFSummary(doc, stats) {
        doc.fontSize(16).text('Résumé');
        doc.moveDown();
        doc.fontSize(12);

        // KPIs principaux
        doc.text(`Taux de réussite global : ${stats.kpis.successRate}%`);
        doc.text(`Taux d'engagement : ${stats.kpis.engagementRate}%`);
        doc.text(`Score de satisfaction : ${stats.kpis.satisfactionScore}/5`);
        doc.moveDown();
    }

    addPDFDetailedStats(doc, stats) {
        // Statistiques des utilisateurs
        doc.fontSize(16).text('Statistiques des Utilisateurs');
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Mentors actifs : ${stats.users.mentors.active}/${stats.users.mentors.total}`);
        doc.text(`Mentorés en attente : ${stats.users.mentees.waiting}`);
        doc.text(`Taux de disponibilité des mentors : ${stats.users.mentors.availability_rate}%`);
        doc.moveDown();

        // Statistiques de matching
        doc.fontSize(16).text('Statistiques de Matching');
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Matchings réussis : ${stats.matching.successful}/${stats.matching.total}`);
        doc.text(`Score moyen de compatibilité : ${stats.matching.avg_score}%`);
        doc.moveDown();

        // Statistiques des sessions
        doc.fontSize(16).text('Statistiques des Sessions');
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Sessions complétées : ${stats.sessions.completed}/${stats.sessions.total}`);
        doc.text(`Durée moyenne : ${stats.sessions.avg_duration} minutes`);
        doc.moveDown();
    }

    addPDFCharts(doc, stats) {
        // Cette méthode pourrait être implémentée avec une bibliothèque de génération de graphiques
        // comme Chart.js ou D3.js, puis convertir les graphiques en images pour le PDF
    }

    addPDFAlerts(doc, alerts) {
        doc.fontSize(16).text('Alertes', { color: 'red' });
        doc.moveDown();
        doc.fontSize(12);

        alerts.forEach(alert => {
            doc.text(`⚠️ ${alert.message}`, { color: 'red' });
            doc.text(`Sévérité : ${alert.severity}`, { color: 'red' });
            doc.moveDown();
        });
    }

    // Méthodes privées pour la génération Excel
    addExcelSummary(sheet, stats) {
        sheet.columns = [
            { header: 'Métrique', key: 'metric', width: 30 },
            { header: 'Valeur', key: 'value', width: 15 }
        ];

        sheet.addRows([
            { metric: 'Taux de réussite global', value: `${stats.kpis.successRate}%` },
            { metric: "Taux d'engagement", value: `${stats.kpis.engagementRate}%` },
            { metric: 'Score de satisfaction', value: `${stats.kpis.satisfactionScore}/5` }
        ]);
    }

    addExcelUserStats(sheet, userStats) {
        sheet.columns = [
            { header: 'Catégorie', key: 'category', width: 20 },
            { header: 'Total', key: 'total', width: 15 },
            { header: 'Actifs', key: 'active', width: 15 },
            { header: 'Taux', key: 'rate', width: 15 }
        ];

        sheet.addRows([
            {
                category: 'Mentors',
                total: userStats.mentors.total,
                active: userStats.mentors.active,
                rate: `${userStats.mentors.availability_rate}%`
            },
            {
                category: 'Mentorés',
                total: userStats.mentees.total,
                active: userStats.mentees.total - userStats.mentees.waiting,
                rate: `${((userStats.mentees.total - userStats.mentees.waiting) / userStats.mentees.total * 100).toFixed(1)}%`
            }
        ]);
    }

    addExcelMatchingStats(sheet, matchingStats) {
        sheet.columns = [
            { header: 'Métrique', key: 'metric', width: 30 },
            { header: 'Valeur', key: 'value', width: 15 }
        ];

        sheet.addRows([
            { metric: 'Total des matchings', value: matchingStats.total },
            { metric: 'Matchings réussis', value: matchingStats.successful },
            { metric: 'Taux de réussite', value: `${matchingStats.success_rate}%` },
            { metric: 'Score moyen', value: `${matchingStats.avg_score}%` }
        ]);
    }

    addExcelSessionStats(sheet, sessionStats) {
        sheet.columns = [
            { header: 'Métrique', key: 'metric', width: 30 },
            { header: 'Valeur', key: 'value', width: 15 }
        ];

        sheet.addRows([
            { metric: 'Sessions totales', value: sessionStats.total },
            { metric: 'Sessions complétées', value: sessionStats.completed },
            { metric: 'Taux de complétion', value: `${sessionStats.completion_rate}%` },
            { metric: 'Durée moyenne', value: `${sessionStats.avg_duration} min` }
        ]);
    }

    addExcelActivityStats(sheet, activityStats) {
        sheet.columns = [
            { header: 'Métrique', key: 'metric', width: 30 },
            { header: 'Valeur', key: 'value', width: 15 }
        ];

        const stats = activityStats.teams || { totalMessages: 0, avgMessagesPerChannel: 0, activeChannels: 0 };

        sheet.addRows([
            { metric: 'Messages totaux', value: stats.totalMessages },
            { metric: 'Moyenne par canal', value: Math.round(stats.avgMessagesPerChannel) },
            { metric: 'Canaux actifs', value: stats.activeChannels }
        ]);
    }

    addExcelFeedbackStats(sheet, feedbackStats) {
        sheet.columns = [
            { header: 'Métrique', key: 'metric', width: 30 },
            { header: 'Valeur', key: 'value', width: 15 }
        ];

        sheet.addRows([
            { metric: 'Total des feedbacks', value: feedbackStats.total },
            { metric: 'Score moyen', value: `${feedbackStats.avg_score}/5` },
            { metric: 'Taux de satisfaction', value: `${feedbackStats.satisfaction_rate}%` }
        ]);
    }

    addExcelAlerts(sheet, alerts) {
        sheet.columns = [
            { header: 'Catégorie', key: 'category', width: 20 },
            { header: 'Message', key: 'message', width: 50 },
            { header: 'Sévérité', key: 'severity', width: 15 },
            { header: 'Valeur actuelle', key: 'current_value', width: 15 },
            { header: 'Seuil', key: 'threshold', width: 15 }
        ];

        sheet.addRows(alerts);
    }

    // Utilitaires
    ensureUploadsDirectory() {
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }
}

module.exports = StatisticsReporter;
