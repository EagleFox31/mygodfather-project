const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const adminConfigController = require('../controllers/adminConfigController');
const adminSecurityController = require('../controllers/adminSecurityController');
const adminAuditController = require('../controllers/adminAuditController');
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: 👑 Administration système
 */

// 🔒 Middleware d'authentification
router.use(auth);
// 🔑 Restreindre l'accès aux administrateurs
router.use(roleAuth(['admin']));

/**
 * @swagger
 * /api/admin/config:
 *   get:
 *     summary: ⚙️ Obtenir la configuration système
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Configuration récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 security:
 *                   type: object
 *                 matching:
 *                   type: object
 *                 notification:
 *                   type: object
 *                 system:
 *                   type: object
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/config', adminConfigController.getConfig);

/**
 * @swagger
 * /api/admin/config:
 *   put:
 *     summary: ⚙️ Mettre à jour la configuration système
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               security:
 *                 type: object
 *               matching:
 *                 type: object
 *               notification:
 *                 type: object
 *               system:
 *                 type: object
 *     responses:
 *       200:
 *         description: ✅ Configuration mise à jour avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.put('/config', [
    body('security').optional().isObject(),
    body('matching').optional().isObject(),
    body('notification').optional().isObject(),
    body('system').optional().isObject()
], validateRequest, adminConfigController.updateConfig);

/**
 * @swagger
 * /api/admin/backup:
 *   post:
 *     summary: 💾 Créer une sauvegarde
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Sauvegarde créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 backupId:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.post('/backup', adminSecurityController.createBackup);

/**
 * @swagger
 * /api/admin/restore/{backupId}:
 *   post:
 *     summary: 🔄 Restaurer une sauvegarde
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la sauvegarde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirmationCode
 *             properties:
 *               confirmationCode:
 *                 type: string
 *                 pattern: ^RESTORE-\d{8}$
 *                 description: 🔐 Code de confirmation
 *     responses:
 *       200:
 *         description: ✅ Restauration effectuée avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❌ Sauvegarde non trouvée
 */
router.post('/restore/:backupId', [
    param('backupId').isMongoId().withMessage('❌ backupId invalide'),
    body('confirmationCode')
        .isString()
        .matches(/^RESTORE-\d{8}$/)
        .withMessage('❌ Code de confirmation invalide')
], validateRequest, adminSecurityController.restoreBackup);

/**
 * @swagger
 * /api/admin/backups:
 *   get:
 *     summary: 📋 Obtenir la liste des sauvegardes
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Liste des sauvegardes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Backup'
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/backups', adminSecurityController.getBackups);

/**
 * @swagger
 * /api/admin/backups/stats:
 *   get:
 *     summary: 📊 Obtenir les statistiques des sauvegardes
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       description: 🔢 Nombre total de sauvegardes
 *                       example: 10
 *                     latest:
 *                       type: string
 *                       description: 📅 Date de la dernière sauvegarde
 *                       example: "25/12/2023 à 15:30"
 *                     totalSize:
 *                       type: integer
 *                       description: 📊 Taille totale des sauvegardes (en octets)
 *                       example: 10485760
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/backups/stats', adminSecurityController.getBackupStats);

/**
 * @swagger
 * /api/admin/backups/{id}/download:
 *   get:
 *     summary: 📥 Télécharger une sauvegarde
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la sauvegarde
 *     responses:
 *       200:
 *         description: ✅ Fichier de sauvegarde
 *         content:
 *           application/gzip:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❌ Sauvegarde non trouvée
 */
router.get('/backups/:id/download', [
    param('id').isMongoId().withMessage('❌ ID de sauvegarde invalide')
], validateRequest, adminSecurityController.downloadBackup);

/**
 * @swagger
 * /api/admin/backups/{id}:
 *   delete:
 *     summary: 🗑️ Supprimer une sauvegarde
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la sauvegarde
 *     responses:
 *       200:
 *         description: ✅ Sauvegarde supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "🗑️ Sauvegarde supprimée avec succès"
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❌ Sauvegarde non trouvée
 */
router.delete('/backups/:id', [
    param('id').isMongoId().withMessage('❌ ID de sauvegarde invalide')
], validateRequest, adminSecurityController.deleteBackup);

/**
 * @swagger
 * /api/admin/security/logs:
 *   get:
 *     summary: 🔒 Obtenir les logs de sécurité
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 📅 Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 📅 Date de fin
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [login, action, system, error]
 *         description: 📝 Type de log
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: ⚠️ Niveau de sévérité
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 📄 Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: 🔢 Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: ✅ Logs récupérés avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/security/logs', [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('type').optional().isIn(['login', 'action', 'system', 'error']),
    query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 100 }).default(50)
], validateRequest, adminSecurityController.getSecurityLogs);

/**
 * @swagger
 * /api/admin/audit/logs:
 *   get:
 *     summary: 📋 Obtenir les logs d'audit
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 📅 Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 📅 Date de fin
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: 🎯 Type d'action
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 👤 ID de l'utilisateur
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 📄 Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: 🔢 Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: ✅ Logs récupérés avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/audit/logs', [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('action').optional().isString(),
    query('userId').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 100 }).default(50)
], validateRequest, adminAuditController.getAuditLogs);

/**
 * @swagger
 * /api/admin/audit/stats:
 *   get:
 *     summary: 📊 Obtenir les statistiques d'audit
 *     tags: [Admin]
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
 *     responses:
 *       200:
 *         description: ✅ Statistiques récupérées avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/audit/stats', [
    query('period')
        .optional()
        .isIn(['day', 'week', 'month', 'year'])
        .default('month')
], validateRequest, adminAuditController.getAuditStats);

/**
 * @swagger
 * /api/admin/audit/export:
 *   post:
 *     summary: 📤 Exporter les logs d'audit
 *     tags: [Admin]
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
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, excel, pdf]
 *                 description: 📑 Format d'export
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: 📅 Date de début
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: 📅 Date de fin
 *               filters:
 *                 type: object
 *                 description: 🔍 Filtres additionnels
 *               includeDetails:
 *                 type: boolean
 *                 default: true
 *                 description: 📋 Inclure les détails complets
 *     responses:
 *       200:
 *         description: ✅ Export généré avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.post('/audit/export', [
    body('format')
        .isIn(['csv', 'excel', 'pdf'])
        .withMessage('❌ Format d\'export invalide'),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('filters').optional().isObject(),
    body('includeDetails')
        .optional()
        .isBoolean()
        .default(true)
], validateRequest, adminAuditController.exportAuditLogs);

/**
 * @swagger
 * /api/admin/audit/cleanup:
 *   post:
 *     summary: 🧹 Nettoyer les anciens logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - olderThan
 *               - confirmationCode
 *             properties:
 *               olderThan:
 *                 type: integer
 *                 minimum: 30
 *                 description: 📅 Nombre de jours
 *               types:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [info, warning, error]
 *                 description: 📝 Types de logs à nettoyer
 *               confirmationCode:
 *                 type: string
 *                 pattern: ^CLEANUP-\d{8}$
 *                 description: 🔐 Code de confirmation
 *     responses:
 *       200:
 *         description: ✅ Nettoyage effectué avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.post('/audit/cleanup', [
    body('olderThan')
        .isInt({ min: 30 })
        .withMessage('❌ La période minimale de conservation est de 30 jours'),
    body('types')
        .optional()
        .isArray()
        .withMessage('❌ Les types doivent être un tableau'),
    body('types.*')
        .optional()
        .isIn(['info', 'warning', 'error'])
        .withMessage('❌ Type de log invalide'),
    body('confirmationCode')
        .isString()
        .matches(/^CLEANUP-\d{8}$/)
        .withMessage('❌ Code de confirmation invalide')
], validateRequest, adminAuditController.clearOldLogs);

module.exports = router;
