const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const teamsController = require('../controllers/teamsController');
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: 👥 Gestion des intégrations Microsoft Teams
 */

// 🔒 Middleware d'authentification pour toutes les routes
router.use(auth);

/**
 * @swagger
 * /api/teams/channels:
 *   post:
 *     summary: 📺 Créer un canal Teams pour une paire
 *     tags: [Teams]
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
 *             properties:
 *               pairId:
 *                 type: string
 *                 description: 🔗 ID de la paire mentor-mentoré
 *               name:
 *                 type: string
 *                 pattern: ^[\w\s\-,.]+$
 *                 description: 📝 Nom personnalisé du canal (optionnel)
 *               description:
 *                 type: string
 *                 description: 📄 Description du canal (optionnel)
 *     responses:
 *       201:
 *         description: ✅ Canal créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 channelId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 url:
 *                   type: string
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux RH
 */
router.post('/channels', [
    roleAuth(['rh']),
    body('pairId').isMongoId().withMessage('pairId est requis et doit être valide'),
    body('name').optional().isString().trim().matches(/^[\w\s\-,.]+$/).withMessage('Nom de canal invalide'),
    body('description').optional().isString().trim()
], validateRequest, teamsController.createChannel);

/**
 * @swagger
 * /api/teams/meetings:
 *   post:
 *     summary: 📅 Créer une réunion Teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startTime
 *               - duration
 *               - participants
 *             properties:
 *               title:
 *                 type: string
 *                 description: 📝 Titre de la réunion
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: ⏰ Date et heure de début
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 180
 *                 description: ⏱️ Durée en minutes
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: 👥 Liste des emails des participants
 *               description:
 *                 type: string
 *                 description: 📄 Description de la réunion
 *     responses:
 *       201:
 *         description: ✅ Réunion créée avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 */
router.post('/meetings', [
    body('title').isString().trim().notEmpty().withMessage('Le titre est requis'),
    body('startTime').isISO8601().withMessage('Date de début invalide'),
    body('duration').isInt({ min: 15, max: 180 }).withMessage('Durée entre 15 et 180 minutes'),
    body('participants').isArray().withMessage('Les participants doivent être un tableau'),
    body('participants.*').isEmail().withMessage('Email de participant invalide'),
    body('description').optional().isString().trim()
], validateRequest, teamsController.createMeeting);

/**
 * @swagger
 * /api/teams/meetings/{id}:
 *   put:
 *     summary: 🔄 Mettre à jour une réunion Teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de la réunion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 📝 Nouveau titre
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: ⏰ Nouvelle date/heure
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 180
 *                 description: ⏱️ Nouvelle durée
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: 👥 Nouvelle liste de participants
 *               description:
 *                 type: string
 *                 description: 📄 Nouvelle description
 *     responses:
 *       200:
 *         description: ✅ Réunion mise à jour avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       404:
 *         description: ❌ Réunion non trouvée
 */
router.put('/meetings/:id', [
    param('id').isString().trim().notEmpty().withMessage('ID de réunion invalide'),
    body('title').optional().isString().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
    body('startTime').optional().isISO8601().withMessage('Date de début invalide'),
    body('duration').optional().isInt({ min: 15, max: 180 }).withMessage('Durée entre 15 et 180 minutes'),
    body('participants').optional().isArray().withMessage('Les participants doivent être un tableau'),
    body('participants.*').optional().isEmail().withMessage('Email de participant invalide'),
    body('description').optional().isString().trim()
], validateRequest, teamsController.updateMeeting);

/**
 * @swagger
 * /api/teams/channels/{id}/archive:
 *   post:
 *     summary: 📦 Archiver un canal Teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID du canal
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: 📝 Raison de l'archivage
 *     responses:
 *       200:
 *         description: ✅ Canal archivé avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux RH
 *       404:
 *         description: ❌ Canal non trouvé
 */
router.post('/channels/:id/archive', [
    roleAuth(['rh']),
    param('id').isString().trim().notEmpty().withMessage('ID de canal invalide'),
    body('reason').optional().isString().trim()
], validateRequest, teamsController.archiveChannel);

module.exports = router;
