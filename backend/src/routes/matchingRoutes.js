const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const matchingController = require('../controllers/matchingController');
const matchingLogController = require('../controllers/matchingLogController');
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/auth');
const matchingValidations = require('../middleware/matchingValidations');

/**
 * @swagger
 * tags:
 *   name: Matching
 *   description: 🤝 Gestion des matchings mentor-mentoré
 */

// 🔒 Middleware d'authentification pour toutes les routes
router.use(auth);

/**
 * @swagger
 * /api/matching/generate/{menteeId}:
 *   post:
 *     summary: 🎯 Générer des suggestions de matching pour un mentoré
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menteeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 👨‍🎓 ID du mentoré
 *     responses:
 *       200:
 *         description: ✅ Suggestions générées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mentor:
 *                         $ref: '#/components/schemas/User'
 *                       score:
 *                         type: number
 *                         description: 📊 Score de compatibilité
 *                       details:
 *                         type: object
 *                         properties:
 *                           serviceMatch:
 *                             type: boolean
 *                             description: 🏢 Compatibilité de service
 *                           experienceScore:
 *                             type: number
 *                             description: 📈 Score d'expérience
 *       400:
 *         description: ❌ ID du mentoré invalide
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux RH
 *       404:
 *         description: ❓ Mentoré non trouvé
 */
router.post('/generate/:menteeId', [
    roleAuth(['rh']),
    matchingValidations.validateMenteeId
], matchingController.generateMatches);

/**
 * @swagger
 * /api/matching/suggestions/{menteeId}:
 *   get:
 *     summary: 📋 Obtenir les suggestions de matching
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menteeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 👨‍🎓 ID du mentoré
 *     responses:
 *       200:
 *         description: ✅ Liste des suggestions récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mentor:
 *                     $ref: '#/components/schemas/User'
 *                   score:
 *                     type: number
 *                     description: 📊 Score de compatibilité
 *                   status:
 *                     type: string
 *                     enum: [pending, accepted, rejected]
 *                     description: 🔄 Statut du matching
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❓ Mentoré non trouvé
 */
router.get('/suggestions/:menteeId', [
    matchingValidations.validateMenteeAccess
], matchingController.getSuggestions);

/**
 * @swagger
 * /api/matching/validate/{matchId}:
 *   post:
 *     summary: ✅ Valider un matching
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID du matching
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 description: 📝 Note optionnelle
 *     responses:
 *       200:
 *         description: ✅ Matching validé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pair:
 *                   $ref: '#/components/schemas/MentorMenteePair'
 *       400:
 *         description: ❌ ID du matching invalide
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux RH
 *       404:
 *         description: ❓ Matching non trouvé
 */
router.post('/validate/:matchId', [
    roleAuth(['rh']),
    matchingValidations.validateMatchId,
    body('note').optional().isString().trim()
], matchingController.validateMatch);

/**
 * @swagger
 * /api/matching/reject/{matchId}:
 *   post:
 *     summary: ❌ Rejeter un matching
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID du matching
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
 *                 description: 📝 Raison du rejet
 *     responses:
 *       200:
 *         description: ✅ Matching rejeté avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux RH
 *       404:
 *         description: ❓ Matching non trouvé
 */
router.post('/reject/:matchId', [
    roleAuth(['rh']),
    matchingValidations.validateMatchId,
    body('reason').notEmpty().withMessage('La raison du rejet est requise').trim()
], matchingController.rejectMatch);

/**
 * @swagger
 * /api/matching/stats:
 *   get:
 *     summary: 📊 Obtenir les statistiques de matching
 *     tags: [Matching]
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
 *                 totalMatches:
 *                   type: integer
 *                   description: 🔢 Nombre total de matchings
 *                 successfulMatches:
 *                   type: integer
 *                   description: ✅ Matchings réussis
 *                 rejectedMatches:
 *                   type: integer
 *                   description: ❌ Matchings rejetés
 *                 averageScore:
 *                   type: number
 *                   description: 📈 Score moyen
 *                 matchesByService:
 *                   type: object
 *                   description: 🏢 Répartition par service
 *                 matchesByMonth:
 *                   type: object
 *                   description: 📅 Répartition par mois
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux admin et RH
 */
router.get('/stats', [
    roleAuth(['admin', 'rh'])
], matchingController.getStats);

/**
 * @swagger
 * /api/matching/logs:
 *   get:
 *     summary: 📋 Obtenir les logs de matching
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 20
 *         description: 🔢 Nombre d'éléments par page
 *       - in: query
 *         name: menteeId
 *         schema:
 *           type: string
 *         description: 👨‍🎓 ID du mentoré pour filtrer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 📅 Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 📅 Date de fin
 *     responses:
 *       200:
 *         description: ✅ Logs récupérés avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/logs', auth, roleAuth(['admin', 'rh']), matchingLogController.getMatchingLogs);

/**
 * @swagger
 * /api/matching/logs/{id}:
 *   get:
 *     summary: 📝 Obtenir un log de matching spécifique
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID du log de matching
 *     responses:
 *       200:
 *         description: ✅ Log récupéré avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❓ Log non trouvé
 */
router.get('/logs/:id', auth, roleAuth(['admin', 'rh']), matchingLogController.getMatchingLogById);

/**
 * @swagger
 * /api/matching/rejection-logs:
 *   get:
 *     summary: 📋 Obtenir les logs de rejet de matching
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 20
 *         description: 🔢 Nombre d'éléments par page
 *       - in: query
 *         name: mentorId
 *         schema:
 *           type: string
 *         description: 👨‍🏫 ID du mentor pour filtrer
 *       - in: query
 *         name: menteeId
 *         schema:
 *           type: string
 *         description: 👨‍🎓 ID du mentoré pour filtrer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 📅 Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 📅 Date de fin
 *     responses:
 *       200:
 *         description: ✅ Logs récupérés avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/rejection-logs', auth, roleAuth(['admin', 'rh']), matchingLogController.getRejectionLogs);

/**
 * @swagger
 * /api/matching/rejection-logs/{id}:
 *   get:
 *     summary: 📝 Obtenir un log de rejet spécifique
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID du log de rejet
 *     responses:
 *       200:
 *         description: ✅ Log récupéré avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❓ Log non trouvé
 */
router.get('/rejection-logs/:id', auth, roleAuth(['admin', 'rh']), matchingLogController.getRejectionLogById);

/**
 * @swagger
 * /api/matching/logs/stats:
 *   get:
 *     summary: 📊 Obtenir les statistiques des logs de matching
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Statistiques récupérées avec succès
 *       401:
 *         description: ❌ Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/logs/stats', auth, roleAuth(['admin', 'rh']), matchingLogController.getMatchingLogStats);

/**
 * @swagger
 * components:
 *   schemas:
 *     MentorMenteePair:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique de la paire
 *         mentor:
 *           $ref: '#/components/schemas/User'
 *           description: 👨‍🏫 Informations du mentor
 *         mentee:
 *           $ref: '#/components/schemas/User'
 *           description: 👨‍🎓 Informations du mentoré
 *         status:
 *           type: string
 *           enum: [pending, active, completed, rejected]
 *           description: 🔄 Statut de la paire
 *         matchingScore:
 *           type: number
 *           description: 📊 Score de compatibilité
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de début
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de fin
 *         notes:
 *           type: string
 *           description: 📝 Notes
 *         rejectionReason:
 *           type: string
 *           description: ❌ Raison du rejet
 *       required:
 *         - mentor
 *         - mentee
 *         - status
 *         - matchingScore
 */

module.exports = router;
