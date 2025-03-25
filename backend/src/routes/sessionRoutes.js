const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const sessionController = require('../controllers/sessionController');
const { auth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: 📅 Gestion des sessions de mentorat
 */

// 🔒 Middleware d'authentification pour toutes les routes
router.use(auth);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: 📋 Obtenir toutes les sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pairId
 *         schema:
 *           type: string
 *         description: 👥 Filtrer par ID de la paire
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *         description: 🔄 Filtrer par statut
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
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date, status, duration]
 *         description: 🔀 Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: ⬆️ Ordre de tri
 *     responses:
 *       200:
 *         description: ✅ Liste des sessions récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MentoringSession'
 *       401:
 *         description: 🔒 Non autorisé
 */
router.get('/', [
    query('pairId').optional().isMongoId().withMessage('pairId invalide'),
    query('status').optional().isIn(['scheduled', 'completed', 'cancelled']).withMessage('Statut invalide'),
    query('startDate').optional().isISO8601().withMessage('startDate doit être une date valide'),
    query('endDate').optional().isISO8601().withMessage('endDate doit être une date valide'),
    query('sort').optional().isIn(['date', 'status', 'duration']).withMessage('Tri invalide'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Ordre invalide')
], validateRequest, sessionController.getSessions);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: 🔍 Obtenir une session spécifique
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la session
 *     responses:
 *       200:
 *         description: ✅ Session trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentoringSession'
 *       401:
 *         description: 🔒 Non autorisé
 *       404:
 *         description: ❌ Session non trouvée
 */
router.get('/:id', [
    param('id').isMongoId().withMessage('ID de session invalide')
], validateRequest, sessionController.getSession);

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: ➕ Créer une nouvelle session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pairId
 *               - date
 *               - duration
 *               - topic
 *             properties:
 *               pairId:
 *                 type: string
 *                 description: 👥 ID de la paire
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: 📅 Date et heure
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 180
 *                 description: ⏱️ Durée en minutes
 *               topic:
 *                 type: string
 *                 description: 📝 Sujet de la session
 *               location:
 *                 type: string
 *                 description: 📍 Lieu de la session
 *     responses:
 *       201:
 *         description: ✅ Session créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentoringSession'
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 */
router.post('/', [
    body('pairId').isMongoId().withMessage('pairId est requis et doit être un ObjectId valide'),
    body('date').isISO8601().withMessage('La date est requise et doit être valide'),
    body('duration').isInt({ min: 15, max: 180 }).withMessage('La durée doit être entre 15 et 180 minutes'),
    body('topic').isString().trim().notEmpty().withMessage('Le sujet est requis'),
    body('location').optional().isString().trim()
], validateRequest, sessionController.createSession);

/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: 🔄 Modifier une session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: 📅 Nouvelle date
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 180
 *                 description: ⏱️ Nouvelle durée
 *               topic:
 *                 type: string
 *                 description: 📝 Nouveau sujet
 *               location:
 *                 type: string
 *                 description: 📍 Nouveau lieu
 *     responses:
 *       200:
 *         description: ✅ Session mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentoringSession'
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 *       404:
 *         description: ❌ Session non trouvée
 */
router.put('/:id', [
    param('id').isMongoId().withMessage('ID de session invalide'),
    body('date').optional().isISO8601().withMessage('Date invalide'),
    body('duration').optional().isInt({ min: 15, max: 180 }).withMessage('Durée entre 15 et 180 minutes'),
    body('topic').optional().isString().trim(),
    body('location').optional().isString().trim()
], validateRequest, sessionController.updateSession);

/**
 * @swagger
 * /api/sessions/{id}/cancel:
 *   post:
 *     summary: ❌ Annuler une session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la session
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
 *                 description: 📝 Raison de l'annulation
 *     responses:
 *       200:
 *         description: ✅ Session annulée
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 *       404:
 *         description: ❌ Session non trouvée
 */
router.post('/:id/cancel', [
    param('id').isMongoId().withMessage('ID de session invalide'),
    body('reason').isString().trim().notEmpty().withMessage('La raison d\'annulation est requise')
], validateRequest, sessionController.cancelSession);

/**
 * @swagger
 * /api/sessions/{id}/feedback:
 *   post:
 *     summary: 📝 Ajouter un feedback
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la session
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
 *                 description: ⭐ Note globale
 *               comment:
 *                 type: string
 *                 description: 💬 Commentaire
 *               categories:
 *                 type: object
 *                 properties:
 *                   preparation:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 5
 *                     description: 📚 Préparation
 *                   engagement:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 5
 *                     description: 🎯 Engagement
 *                   value:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 5
 *                     description: 💎 Valeur ajoutée
 *     responses:
 *       200:
 *         description: ✅ Feedback ajouté
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 *       404:
 *         description: ❌ Session non trouvée
 */
router.post('/:id/feedback', [
    param('id').isMongoId().withMessage('ID de session invalide'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),
    body('comment').isString().trim().notEmpty().withMessage('Le commentaire est requis'),
    body('categories').optional().isObject().withMessage('Les catégories doivent être un objet')
], validateRequest, sessionController.addSessionFeedback);

/**
 * @swagger
 * components:
 *   schemas:
 *     MentoringSession:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique
 *         pairId:
 *           type: string
 *           description: 👥 Référence à la paire
 *         date:
 *           type: string
 *           format: date-time
 *           description: 📅 Date et heure
 *         duration:
 *           type: integer
 *           description: ⏱️ Durée en minutes
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *           description: 🔄 Statut
 *         topic:
 *           type: string
 *           description: 📝 Sujet
 *         location:
 *           type: string
 *           description: 📍 Lieu
 *         feedback:
 *           type: array
 *           description: 💬 Retours
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 👤 ID utilisateur
 *               rating:
 *                 type: integer
 *                 description: ⭐ Note
 *               comment:
 *                 type: string
 *                 description: 📝 Commentaire
 *               categories:
 *                 type: object
 *                 description: 📊 Notes par catégorie
 *         cancellationReason:
 *           type: string
 *           description: ❌ Raison d'annulation
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           description: 📅 Date d'annulation
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: ✅ Date de complétion
 *       required:
 *         - pairId
 *         - date
 *         - duration
 *         - topic
 *         - status
 */

module.exports = router;
