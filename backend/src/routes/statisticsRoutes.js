const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const statisticsController = require('../controllers/statisticsController');
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: 📊 Gestion des statistiques et rapports
 */

// 🔒 Middleware d'authentification
router.use(auth);
// 🔑 Middleware de rôle pour restreindre aux RH et Admins
router.use(roleAuth(['admin', 'rh']));

/**
 * @swagger
 * /api/statistics/dashboard:
 *   get:
 *     summary: 📊 Obtenir les statistiques du dashboard
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: 📅 Période d'analyse
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 📅 Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 📅 Date de fin de la période
 *     responses:
 *       200:
 *         description: ✅ Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     mentors:
 *                       type: integer
 *                     mentees:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                 matching:
 *                   type: object
 *                   properties:
 *                     totalPairs:
 *                       type: integer
 *                     activePairs:
 *                       type: integer
 *                     successRate:
 *                       type: number
 *                 sessions:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                     cancelled:
 *                       type: integer
 *                     averageDuration:
 *                       type: number
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux admin et RH
 */
router.get('/dashboard', [
    query('period')
        .optional()
        .isIn(['day', 'week', 'month', 'year'])
        .withMessage('❌ Période invalide')
        .default('day'),
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('❌ Date de début invalide'),
    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('❌ Date de fin invalide')
], validateRequest, statisticsController.getDashboardStats);

/**
 * @swagger
 * /api/statistics/reports:
 *   post:
 *     summary: 📑 Générer un rapport statistique
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [pdf, excel]
 *               period:
 *                 type: string
 *                 enum: [day, week, month, year]
 *                 default: month
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               sections:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [users, matching, sessions, feedback, activity]
 *     responses:
 *       200:
 *         description: ✅ Rapport généré avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux admin et RH
 */
router.post('/reports', [
    body('type')
        .isIn(['pdf', 'excel'])
        .withMessage('❌ Type de rapport invalide'),
    body('period')
        .optional()
        .isIn(['day', 'week', 'month', 'year'])
        .withMessage('❌ Période invalide')
        .default('month'),
    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('❌ Date de début invalide'),
    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('❌ Date de fin invalide'),
    body('sections')
        .optional()
        .isArray()
        .withMessage('❌ Les sections doivent être un tableau'),
    body('sections.*')
        .optional()
        .isIn(['users', 'matching', 'sessions', 'feedback', 'activity'])
        .withMessage('❌ Section invalide')
], validateRequest, statisticsController.generateReport);

/**
 * @swagger
 * /api/statistics/alerts:
 *   get:
 *     summary: ⚠️ Obtenir les alertes statistiques
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: 🚨 Filtrer par niveau de sévérité
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, resolved, ignored]
 *         description: 🔄 Filtrer par statut
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [matching, activity, feedback, system]
 *         description: 📑 Filtrer par catégorie
 *     responses:
 *       200:
 *         description: ✅ Alertes récupérées avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux admin et RH
 */
router.get('/alerts', [
    query('severity')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('❌ Sévérité invalide'),
    query('status')
        .optional()
        .isIn(['active', 'resolved', 'ignored'])
        .withMessage('❌ Statut invalide'),
    query('category')
        .optional()
        .isIn(['matching', 'activity', 'feedback', 'system'])
        .withMessage('❌ Catégorie invalide')
], validateRequest, statisticsController.getAlerts);

/**
 * @swagger
 * /api/statistics/matching-distribution:
 *   get:
 *     summary: 📈 Obtenir la distribution des scores de compatibilité
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Période d'analyse
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin
 *     responses:
 *       200:
 *         description: ✅ Distribution récupérée avec succès
 */
router.get(
    '/matching-distribution',
    [
        query('period').optional().isIn(['day', 'week', 'month']),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601()
    ],
    validateRequest,
    statisticsController.getMatchingDistribution
);

/**
 * @swagger
 * /api/statistics/export:
 *   post:
 *     summary: 📤 Exporter des données statistiques
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - format
 *               - data
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, excel, json]
 *               data:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [users, pairs, sessions, matching, feedback, activity]
 *               filters:
 *                 type: object
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               includeHeaders:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: ✅ Données exportées avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux admin et RH
 */
router.post('/export', [
    body('format')
        .isIn(['csv', 'excel', 'json'])
        .withMessage('❌ Format d\'export invalide'),
    body('data')
        .isArray({ min: 1 }) // 🚀 Minimum 1 type de donnée à exporter
        .withMessage('❌ Les données doivent être un tableau non vide'),
    body('data.*')
        .isIn(['users', 'pairs', 'sessions', 'matching', 'feedback', 'activity'])
        .withMessage('❌ Type de données invalide'),
    body('filters')
        .optional()
        .isObject()
        .withMessage('❌ Les filtres doivent être un objet'),
    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('❌ Date de début invalide'),
    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('❌ Date de fin invalide'),
    body('includeHeaders')
        .optional()
        .isBoolean()
        .withMessage('❌ includeHeaders doit être un booléen')
        .default(true), // 🚀 Ajout d'une option pour inclure les headers dans l'export CSV
], validateRequest, statisticsController.exportData);




module.exports = router;
