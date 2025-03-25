const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { body, param, query } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: 🔔 Gestion des notifications
 */

// 🔒 Middleware d'authentification pour toutes les routes
router.use(auth);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 📬 Obtenir les notifications de l'utilisateur
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [read, unread]
 *         description: 📫 Filtrer par statut de lecture
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, success, warning, error]
 *         description: 🏷️ Filtrer par type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [system, matching, session, message]
 *         description: 📁 Filtrer par catégorie
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 📄 Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: 🔢 Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: ✅ Notifications récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 total:
 *                   type: integer
 *                 unread:
 *                   type: integer
 *       401:
 *         description: 🔒 Non autorisé
 */
router.get('/', [
    query('status').optional().isIn(['read', 'unread']).withMessage('Statut invalide'),
    query('type').optional().isIn(['info', 'success', 'warning', 'error']).withMessage('Type invalide'),
    query('category').optional().isIn(['system', 'matching', 'session', 'message']).withMessage('Catégorie invalide'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite invalide')
], validateRequest, notificationController.getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: ✓ Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la notification
 *     responses:
 *       200:
 *         description: ✅ Notification marquée comme lue
 *       400:
 *         description: ❌ ID invalide
 *       401:
 *         description: 🔒 Non autorisé
 *       404:
 *         description: ❌ Notification non trouvée
 */
router.put('/:id/read', [
    param('id').isMongoId().withMessage('ID de notification invalide')
], validateRequest, notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/preferences:
 *   put:
 *     summary: ⚙️ Mettre à jour les préférences de notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     description: 📧 Activer les notifications par email
 *               teams:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     description: 👥 Activer les notifications Teams
 *               web:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     description: 🌐 Activer les notifications web
 *               categories:
 *                 type: object
 *                 description: 📁 Préférences par catégorie
 *     responses:
 *       200:
 *         description: ✅ Préférences mises à jour avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 */
router.put('/preferences', [
    body('email.enabled').optional().isBoolean().withMessage('email.enabled doit être un booléen'),
    body('teams.enabled').optional().isBoolean().withMessage('teams.enabled doit être un booléen'),
    body('web.enabled').optional().isBoolean().withMessage('web.enabled doit être un booléen'),
    body('categories').optional().isObject().withMessage('Les catégories doivent être un objet'),
    body('categories.*.enabled').optional().isBoolean().withMessage('L\'état des catégories doit être un booléen')
], validateRequest, notificationController.updatePreferences);

/**
 * @swagger
 * /api/notifications/global:
 *   post:
 *     summary: 📢 Envoyer une notification globale
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - type
 *               - category
 *             properties:
 *               message:
 *                 type: string
 *                 description: 📝 Message de la notification
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *                 description: 🏷️ Type de notification
 *               category:
 *                 type: string
 *                 enum: [system, matching, session, message]
 *                 description: 📁 Catégorie de la notification
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [admin, rh, mentor, mentee]
 *                 description: 👥 Rôles ciblés
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 🏢 Services ciblés
 *               expiresIn:
 *                 type: integer
 *                 minimum: 0
 *                 description: ⏳ Durée de validité en secondes
 *     responses:
 *       201:
 *         description: ✅ Notification globale envoyée avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux admin
 */
router.post('/global', [
    roleAuth(['admin']),
    body('message').isString().trim().notEmpty().withMessage('Le message est requis'),
    body('type').isIn(['info', 'success', 'warning', 'error']).withMessage('Type invalide'),
    body('category').isIn(['system', 'matching', 'session', 'message']).withMessage('Catégorie invalide'),
    body('roles').optional().isArray().withMessage('Les rôles doivent être un tableau'),
    body('roles.*').optional().isIn(['admin', 'rh', 'mentor', 'mentee']).withMessage('Rôle invalide'),
    body('services').optional().isArray().withMessage('Les services doivent être un tableau'),
    body('expiresIn').optional().isInt({ min: 0 }).withMessage('expiresIn doit être un nombre positif')
], validateRequest, notificationController.sendGlobalNotification);

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique de la notification
 *         userId:
 *           type: string
 *           description: 👤 ID de l'utilisateur destinataire
 *         message:
 *           type: string
 *           description: 📝 Contenu de la notification
 *         type:
 *           type: string
 *           enum: [info, success, warning, error]
 *           description: 🏷️ Type de notification
 *         category:
 *           type: string
 *           enum: [system, matching, session, message]
 *           description: 📁 Catégorie de la notification
 *         read:
 *           type: boolean
 *           description: ✓ Statut de lecture
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de lecture
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de création
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: ⏳ Date d'expiration
 *         data:
 *           type: object
 *           description: 📦 Données additionnelles
 */

// Test route to send a notification
router.post('/test', async (req, res) => {
    try {
        const notification = await notificationService.createNotification({
            userId: req.body.userId,
            title: 'Test Notification',
            message: 'This is a test notification sent via WebSocket',
            type: 'info',
            category: 'test'
        });
        res.json({ success: true, notification });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
