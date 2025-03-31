// /src/controllers/statisticsController.js
const statisticsService = require('../services/statisticsService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class StatisticsController {
    /**
     * @desc    📊 Obtenir les statistiques du dashboard
     * @route   GET /api/statistics/dashboard
     * @access  Private (Admin, RH)
     */
    async getDashboardStats(req, res, next) {
        try {
            // Vérifier les erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(createError(400, 'Données invalides', { errors: errors.array() }));
            }

            // Récupérer les statistiques
            const stats = await statisticsService.getDashboardStats(req.query);
            if (!stats) {
                throw createError(500, 'Impossible de récupérer les statistiques');
            }

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    📑 Générer un rapport statistique
     * @route   POST /api/statistics/reports
     * @access  Private (Admin, RH)
     */
    async generateReport(req, res, next) {
        try {
            // Vérifier les erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(createError(400, 'Données invalides', { errors: errors.array() }));
            }

            const { type, period = 'month', startDate, endDate, sections = [] } = req.body;

            // Générer le rapport
            const report = await statisticsService.generateReport(type, period, startDate, endDate, sections);
            if (!report) {
                throw createError(500, 'Erreur lors de la génération du rapport');
            }

            res.json({
                success: true,
                data: report
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    ⚠️ Obtenir les alertes statistiques
     * @route   GET /api/statistics/alerts
     * @access  Private (Admin, RH)
     */
    async getAlerts(req, res, next) {
        try {
            // Vérifier les erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(createError(400, 'Données invalides', { errors: errors.array() }));
            }

            const alerts = await statisticsService.getAlerts(req.query);
            if (!alerts) {
                throw createError(500, 'Erreur lors de la récupération des alertes');
            }

            res.json({
                success: true,
                data: alerts
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    📤 Exporter des données statistiques
     * @route   POST /api/statistics/export
     * @access  Private (Admin, RH)
     */
    async exportData(req, res, next) {
        try {
            // Vérifier les erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(createError(400, 'Données invalides', { errors: errors.array() }));
            }

            const { format, data, filters = {}, startDate, endDate, includeHeaders = true } = req.body;

            // Exporter les données
            const exportedData = await statisticsService.exportData(format, data, filters, startDate, endDate, includeHeaders);
            if (!exportedData) {
                throw createError(500, 'Erreur lors de l\'exportation des données');
            }

            res.json({
                success: true,
                data: exportedData
            });
        } catch (error) {
            next(error);
        }
    }

    /**
   * @desc    📈 Obtenir la distribution des scores de compatibilité
   * @route   GET /api/statistics/matching-distribution
   * @access  Private (Admin, RH)
   */
    async getMatchingDistribution(req, res, next) {
        try {
            // Vérifier les erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(createError(400, 'Données invalides', { errors: errors.array() }));
            }

            // Récupérer la distribution
            const distribution = await statisticsService.getMatchingDistribution(req.query);

            res.json({
                success: true,
                data: distribution
            });
        } catch (error) {
            next(error);
        }
    }

    /**
   * @desc    🕑 Obtenir les activités récentes (filtrables et paginées)
   * @route   GET /api/statistics/recent-activity?limit=10&offset=0&type=session
   * @access  Private (Admin, RH)
   */
  async getRecentActivity(req, res, next) {
    try {
      // Validation éventuelle
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(createError(400, 'Données invalides', { errors: errors.array() }));
      }

      const { limit, offset, type } = req.query;
      const activities = await statisticsService.getRecentActivity({ limit, offset, type });
      res.json({
        success: true,
        data: activities,
        meta: {
          count: activities.length,
          limit: parseInt(limit) || 10,
          offset: parseInt(offset) || 0,
          type: type || 'all'
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  
}

module.exports = new StatisticsController();
