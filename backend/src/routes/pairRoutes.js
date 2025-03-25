const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const pairController = require('../controllers/pairController');
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Pairs
 *   description: 👥 Gestion des paires mentor-mentoré
 */

// 🔒 Middleware d'authentification pour toutes les routes
router.use(auth);

/**
 * @swagger
 * /api/pairs:
 *   get:
 *     summary: 📋 Obtenir toutes les paires avec filtres
 *     tags: [Pairs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, inactive]
 *         description: 🔄 Filtrer par statut
 *       - in: query
 *         name: mentorId
 *         schema:
 *           type: string
 *         description: 👨‍🏫 Filtrer par ID du mentor
 *       - in: query
 *         name: menteeId
 *         schema:
 *           type: string
 *         description: 👨‍🎓 Filtrer par ID du mentoré
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: 🏢 Filtrer par service
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created_at, status]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MentorMenteePair'
 *       401:
 *         description: 🔒 Non autorisé
 */
router.get('/', [
    query('status').optional().isIn(['pending', 'active', 'inactive']),
    query('mentorId').optional().isMongoId(),
    query('menteeId').optional().isMongoId(),
    query('service').optional().isString(),
    query('sort').optional().isIn(['created_at', 'status']),
    query('order').optional().isIn(['asc', 'desc'])
], pairController.getPairs);

/**
 * @swagger
 * /api/pairs/{id}:
 *   get:
 *     summary: 🔍 Obtenir une paire spécifique
 *     tags: [Pairs]
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
 *         description: ✅ Paire trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentorMenteePair'
 *       401:
 *         description: 🔒 Non autorisé
 *       404:
 *         description: ❌ Paire non trouvée
 */
router.get('/:id', pairController.getPair);

/**
 * @swagger
 * /api/pairs/{id}/status:
 *   put:
 *     summary: 🔄 Mettre à jour le statut d'une paire
 *     tags: [Pairs]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: 🔄 Nouveau statut
 *               reason:
 *                 type: string
 *                 description: 📝 Raison du changement
 *     responses:
 *       200:
 *         description: ✅ Statut mis à jour avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux RH
 *       404:
 *         description: ❌ Paire non trouvée
 */
router.put('/:id/status', [
    roleAuth(['rh']),
    body('status')
        .isIn(['active', 'inactive'])
        .withMessage('Statut invalide'),
    body('reason')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('La raison ne peut pas être vide si fournie')
], pairController.updatePairStatus);

/**
 * @swagger
 * /api/pairs/{id}/feedback:
 *   post:
 *     summary: 📝 Ajouter un feedback à une paire
 *     tags: [Pairs]
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
 *                 description: ⭐ Note globale
 *               comment:
 *                 type: string
 *                 description: 💬 Commentaire
 *               categories:
 *                 type: object
 *                 properties:
 *                   communication:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 5
 *                     description: 🗣️ Note communication
 *                   availability:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 5
 *                     description: 📅 Note disponibilité
 *     responses:
 *       200:
 *         description: ✅ Feedback ajouté avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 *       404:
 *         description: ❌ Paire non trouvée
 */
router.post('/:id/feedback', [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('La note doit être entre 1 et 5'),
    body('comment')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Le commentaire est requis'),
    body('categories')
        .optional()
        .isObject()
        .withMessage('Les catégories doivent être un objet')
], pairController.addFeedback);

/**
 * @swagger
 * /api/pairs/{id}/end:
 *   post:
 *     summary: 🏁 Terminer une relation de mentorat
 *     tags: [Pairs]
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
 *               feedback:
 *                 type: object
 *                 properties:
 *                   rating:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 5
 *                     description: ⭐ Note finale
 *                   comment:
 *                     type: string
 *                     description: 💬 Commentaire final
 *     responses:
 *       200:
 *         description: ✅ Relation terminée avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux RH
 *       404:
 *         description: ❌ Paire non trouvée
 */
router.post('/:id/end', [
    roleAuth(['rh']),
    body('reason')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('La raison de fin est requise'),
    body('feedback')
        .optional()
        .isObject()
        .withMessage('Le feedback doit être un objet'),
    body('feedback.rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('La note doit être entre 1 et 5'),
    body('feedback.comment')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Le commentaire ne peut pas être vide si fourni')
], pairController.endMentorship);

module.exports = router;
