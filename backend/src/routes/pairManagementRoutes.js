const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const pairManagementController = require('../controllers/pairManagementController');
const { auth, roleAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Pair Management
 *   description: 👥 Gestion administrative des paires mentor-mentoré
 */

// 🔒 Middleware d'authentification pour toutes les routes
router.use(auth);
// 🔑 Middleware de rôle pour restreindre aux RH et Admins
router.use(roleAuth(['admin', 'rh']));

/**
 * @swagger
 * /api/pair-management:
 *   get:
 *     summary: 📋 Obtenir toutes les paires avec filtres
 *     tags: [Pair Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, completed, cancelled]
 *         description: 🔄 Statut de la paire
 *       - in: query
 *         name: mentorId
 *         schema:
 *           type: string
 *         description: 👨‍🏫 ID du mentor
 *       - in: query
 *         name: menteeId
 *         schema:
 *           type: string
 *         description: 👨‍🎓 ID du mentoré
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: 🏢 Service
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
 *           maximum: 100
 *         description: 🔢 Nombre d'éléments par page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created_at, status, mentor, mentee]
 *         description: 🔀 Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: ⬆️ Ordre de tri
 *     responses:
 *       200:
 *         description: ✅ Liste des paires récupérée avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/', [
    query('status').optional().isIn(['pending', 'active', 'completed', 'cancelled']),
    query('mentorId').optional().isMongoId(),
    query('menteeId').optional().isMongoId(),
    query('service').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['created_at', 'status', 'mentor', 'mentee']),
    query('order').optional().isIn(['asc', 'desc']),
    validateRequest
], pairManagementController.getPairs);

/**
 * @swagger
 * /api/pair-management:
 *   post:
 *     summary: ➕ Créer une nouvelle paire manuellement
 *     tags: [Pair Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mentorId
 *               - menteeId
 *             properties:
 *               mentorId:
 *                 type: string
 *                 description: 👨‍🏫 ID du mentor
 *               menteeId:
 *                 type: string
 *                 description: 👨‍🎓 ID du mentoré
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: 📅 Date de début
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 description: ⏳ Durée en mois
 *               objectives:
 *                 type: array
 *                 description: 🎯 Objectifs du mentorat
 *               notes:
 *                 type: string
 *                 description: 📝 Notes additionnelles
 *     responses:
 *       201:
 *         description: ✅ Paire créée avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.post('/', [
    body('mentorId').isMongoId().withMessage('ID du mentor invalide'),
    body('menteeId').isMongoId().withMessage('ID du mentoré invalide'),
    body('startDate').optional().isISO8601().withMessage('Date de début invalide'),
    body('duration').optional().isInt({ min: 1, max: 12 }).withMessage('Durée invalide (1-12 mois)'),
    body('objectives').optional().isArray().withMessage('Les objectifs doivent être un tableau'),
    body('notes').optional().isString().trim(),
    validateRequest
], pairManagementController.createPair);

/**
 * @swagger
 * /api/pair-management/{id}:
 *   get:
 *     summary: 🔍 Obtenir les détails d'une paire
 *     tags: [Pair Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la paire
 *     responses:
 *       200:
 *         description: ✅ Détails récupérés avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❌ Paire non trouvée
 */
router.get('/:id', [
    param('id').isMongoId().withMessage('ID de paire invalide'),
    validateRequest
], pairManagementController.getPairDetails);

/**
 * @swagger
 * /api/pair-management/{id}:
 *   put:
 *     summary: 🔄 Mettre à jour une paire
 *     tags: [Pair Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la paire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, paused, completed, cancelled]
 *                 description: 🔄 Nouveau statut
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: 📅 Date de fin
 *               objectives:
 *                 type: array
 *                 description: 🎯 Objectifs mis à jour
 *               notes:
 *                 type: string
 *                 description: 📝 Notes mises à jour
 *     responses:
 *       200:
 *         description: ✅ Paire mise à jour avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❌ Paire non trouvée
 */
router.put('/:id', [
    param('id').isMongoId().withMessage('ID de paire invalide'),
    body('status').optional().isIn(['active', 'paused', 'completed', 'cancelled']),
    body('endDate').optional().isISO8601(),
    body('objectives').optional().isArray(),
    body('notes').optional().isString().trim(),
    validateRequest
], pairManagementController.updatePair);

/**
 * @swagger
 * /api/pair-management/{id}/feedback:
 *   post:
 *     summary: 📝 Ajouter un feedback RH sur la paire
 *     tags: [Pair Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la paire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: ⭐ Note
 *               comment:
 *                 type: string
 *                 description: 💬 Commentaire
 *               areas:
 *                 type: array
 *                 description: 📊 Domaines évalués
 *               recommendations:
 *                 type: array
 *                 description: 💡 Recommandations
 *     responses:
 *       200:
 *         description: ✅ Feedback ajouté avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❌ Paire non trouvée
 */
router.post('/:id/feedback', [
    param('id').isMongoId().withMessage('ID de paire invalide'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5'),
    body('comment').isString().trim().notEmpty().withMessage('Commentaire requis'),
    body('areas').optional().isArray(),
    body('recommendations').optional().isArray(),
    validateRequest
], pairManagementController.addFeedback);

/**
 * @swagger
 * /api/pair-management/{id}/end:
 *   post:
 *     summary: 🏁 Terminer une relation de mentorat
 *     tags: [Pair Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la paire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: 📝 Raison de fin
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: 📅 Date de fin
 *               feedback:
 *                 type: object
 *                 description: 💬 Feedback final
 *               recommendations:
 *                 type: array
 *                 description: 💡 Recommandations finales
 *     responses:
 *       200:
 *         description: ✅ Relation terminée avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❌ Paire non trouvée
 */
router.post('/:id/end', [
    param('id').isMongoId().withMessage('ID de paire invalide'),
    body('reason').isString().trim().notEmpty().withMessage('Raison requise'),
    body('endDate').optional().isISO8601(),
    body('feedback').optional().isObject(),
    body('recommendations').optional().isArray(),
    validateRequest
], pairManagementController.endMentorship);

module.exports = router;
