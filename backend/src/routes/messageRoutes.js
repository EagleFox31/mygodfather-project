const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: 💬 Gestion des messages entre utilisateurs
 */

// 🔒 Middleware d'authentification pour toutes les routes
router.use(auth);

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: 📨 Obtenir les messages d'une conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: 👤 ID du destinataire
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
 *         description: 🔢 Nombre de messages par page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: 🔄 Ordre de tri
 *     responses:
 *       200:
 *         description: ✅ Messages récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       400:
 *         description: ❌ Paramètres invalides
 *       401:
 *         description: 🔒 Non autorisé
 */
router.get('/', [
    query('receiverId').isMongoId().withMessage('receiverId invalide'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite invalide'),
    query('sort').optional().isIn(['asc', 'desc']).withMessage('Tri invalide')
], validateRequest, messageController.getMessages);

/**
 * @swagger
 * /api/messages/unread:
 *   get:
 *     summary: 📬 Obtenir les messages non lus
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Messages non lus récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: 🔒 Non autorisé
 */
router.get('/unread', messageController.getUnreadMessages);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: 📤 Envoyer un message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: 👤 ID du destinataire
 *               content:
 *                 type: string
 *                 description: 📝 Contenu du message
 *               attachments:
 *                 type: array
 *                 description: 📎 Pièces jointes
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                     type:
 *                       type: string
 *     responses:
 *       201:
 *         description: ✅ Message envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 */
router.post('/', [
    body('receiverId')
        .isMongoId().withMessage('receiverId est requis et doit être valide')
        .custom((value, { req }) => {
            if (value === req.user.id) {
                throw new Error('Impossible d\'envoyer un message à soi-même');
            }
            return true;
        }),
    body('content').isString().trim().notEmpty().withMessage('Le contenu est requis'),
    body('attachments').optional().isArray().withMessage('Les pièces jointes doivent être un tableau'),
    body('attachments.*.url').optional().isURL().withMessage('L\'URL de la pièce jointe est invalide'),
    body('attachments.*.type').optional().isString().withMessage('Le type de fichier est requis')
], validateRequest, messageController.sendMessage);

/**
 * @swagger
 * /api/messages/{id}/read:
 *   put:
 *     summary: ✓ Marquer un message comme lu
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID du message
 *     responses:
 *       200:
 *         description: ✅ Message marqué comme lu
 *       400:
 *         description: ❌ ID invalide
 *       401:
 *         description: 🔒 Non autorisé
 *       404:
 *         description: ❌ Message non trouvé
 */
router.put('/:id/read', [
    param('id').isMongoId().withMessage('ID de message invalide')
], validateRequest, messageController.markAsRead);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: 🗑️ Supprimer un message (soft delete)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID du message
 *     responses:
 *       200:
 *         description: ✅ Message supprimé avec succès
 *       400:
 *         description: ❌ ID invalide
 *       401:
 *         description: 🔒 Non autorisé
 *       404:
 *         description: ❌ Message non trouvé
 */
router.delete('/:id', [
    param('id').isMongoId().withMessage('ID de message invalide')
], validateRequest, messageController.deleteMessage);

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique du message
 *         senderId:
 *           type: string
 *           description: 👤 ID de l'expéditeur
 *         receiverId:
 *           type: string
 *           description: 👤 ID du destinataire
 *         content:
 *           type: string
 *           description: 📝 Contenu du message
 *         attachments:
 *           type: array
 *           description: 📎 Pièces jointes
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               type:
 *                 type: string
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
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de dernière modification
 *         deleted:
 *           type: boolean
 *           description: 🗑️ Indicateur de suppression
 *       required:
 *         - senderId
 *         - receiverId
 *         - content
 */

module.exports = router;
