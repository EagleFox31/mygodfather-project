const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 👥 Gestion des utilisateurs
 */

// ✅ Validation des données
const userValidation = [
    body('email').isEmail().withMessage('Email invalide'),
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('age').isInt({ min: 18 }).withMessage('L\'âge doit être supérieur à 18 ans'),
    body('service').notEmpty().withMessage('Le service est requis'),
    body('fonction').notEmpty().withMessage('La fonction est requise'),
    body('anciennete').isInt({ min: 0 }).withMessage('L\'ancienneté doit être positive')
];

const profileValidation = [
    body('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('prenom').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
    body('service').optional().notEmpty().withMessage('Le service ne peut pas être vide'),
    body('fonction').optional().notEmpty().withMessage('La fonction ne peut pas être vide')
];

// 🔒 Middleware d'authentification pour toutes les routes
router.use(auth);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 📋 Récupérer la liste des utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, rh, mentor, mentee]
 *         description: 👤 Filtrer par rôle
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: 🏢 Filtrer par service
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 🔍 Recherche textuelle
 *       - in: query
 *         name: disponibilite
 *         schema:
 *           type: boolean
 *         description: 📅 Filtrer par disponibilité
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created_at, name, role, service]
 *         description: 🔀 Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: ⬆️ Ordre de tri
 *     responses:
 *       200:
 *         description: ✅ Liste récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.get('/', [
    roleAuth(['admin', 'rh']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['admin', 'rh', 'mentor', 'mentee']),
    query('service').optional().isString(),
    query('search').optional().isString(),
    query('disponibilite').optional().custom(value => {
        if (value === 'true' || value === 'false' || value === undefined) {
            return true;
        }
        throw new Error('La disponibilité doit être "true" ou "false"');
    }),
    query('sort').optional().isIn(['created_at', 'name', 'role', 'service']),
    query('order').optional().isIn(['asc', 'desc'])
], userController.getUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: ➕ Créer un nouvel utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - prenom
 *               - age
 *               - service
 *               - fonction
 *               - anciennete
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 📧 Adresse email
 *               name:
 *                 type: string
 *                 description: 📝 Nom
 *               prenom:
 *                 type: string
 *                 description: 📝 Prénom
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 description: 🎂 Âge
 *               service:
 *                 type: string
 *                 description: 🏢 Service
 *               fonction:
 *                 type: string
 *                 description: 💼 Fonction
 *               anciennete:
 *                 type: integer
 *                 minimum: 0
 *                 description: ⏳ Ancienneté
 *               role:
 *                 type: string
 *                 enum: [admin, rh, mentor, mentee]
 *                 description: 👤 Rôle
 *     responses:
 *       201:
 *         description: ✅ Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.post('/', [roleAuth(['admin']), userValidation], userController.createUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: 👤 Récupérer son propre profil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 🔒 Non autorisé
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: 🔄 Mettre à jour son profil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 📝 Nom
 *               prenom:
 *                 type: string
 *                 description: 📝 Prénom
 *               service:
 *                 type: string
 *                 description: 🏢 Service
 *               fonction:
 *                 type: string
 *                 description: 💼 Fonction
 *     responses:
 *       200:
 *         description: ✅ Profil mis à jour avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 */
router.put('/profile', profileValidation, userController.updateProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 🔍 Récupérer un utilisateur par son ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 🔑 ID de l'utilisateur
 *     responses:
 *       200:
 *         description: ✅ Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 🔒 Non autorisé
 *       404:
 *         description: ❌ Utilisateur non trouvé
 */
router.get('/:id', userController.getUser);

/**
 * @swagger
 * /api/users/notifications/preferences:
 *   put:
 *     summary: 🔔 Mettre à jour les préférences de notification
 *     tags: [Users]
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
 *                     description: 📧 Notifications par email
 *               teams:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     description: 👥 Notifications Teams
 *               web:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     description: 🌐 Notifications web
 *               categories:
 *                 type: object
 *                 description: 📑 Catégories de notifications
 *     responses:
 *       200:
 *         description: ✅ Préférences mises à jour avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 */
router.put('/notifications/preferences', [
    body('email.enabled').optional().isBoolean(),
    body('teams.enabled').optional().isBoolean(),
    body('web.enabled').optional().isBoolean(),
    body('categories').optional().isObject()
], userController.updateNotificationPreferences);

/**
 * @swagger
 * /api/users/disponibilite:
 *   put:
 *     summary: 📅 Mettre à jour la disponibilité (mentors)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disponibilite:
 *                 type: boolean
 *                 description: ✅ État de disponibilité
 *     responses:
 *       200:
 *         description: ✅ Disponibilité mise à jour avec succès
 *       400:
 *         description: ❌ Données invalides
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé
 */
router.put('/disponibilite', [
    roleAuth(['mentor']),
    body('disponibilite').isBoolean().withMessage('La disponibilité doit être un booléen')
], userController.updateDisponibilite);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique
 *         email:
 *           type: string
 *           description: 📧 Email
 *         name:
 *           type: string
 *           description: 📝 Nom
 *         prenom:
 *           type: string
 *           description: 📝 Prénom
 *         age:
 *           type: integer
 *           description: 🎂 Âge
 *         service:
 *           type: string
 *           description: 🏢 Service
 *         fonction:
 *           type: string
 *           description: 💼 Fonction
 *         anciennete:
 *           type: integer
 *           description: ⏳ Ancienneté
 *         role:
 *           type: string
 *           enum: [admin, rh, mentor, mentee]
 *           description: 👤 Rôle
 *         teams_id:
 *           type: string
 *           description: 👥 ID Teams
 *         disponibilite:
 *           type: boolean
 *           description: 📅 Disponibilité
 *         last_login:
 *           type: string
 *           format: date-time
 *           description: 🕒 Dernière connexion
 *         last_active:
 *           type: string
 *           format: date-time
 *           description: 🕐 Dernière activité
 *         notification_preferences:
 *           type: object
 *           description: 🔔 Préférences de notification
 *           properties:
 *             email:
 *               type: object
 *               description: 📧 Préférences email
 *             teams:
 *               type: object
 *               description: 👥 Préférences Teams
 *             web:
 *               type: object
 *               description: 🌐 Préférences web
 *       required:
 *         - email
 *         - name
 *         - prenom
 *         - age
 *         - service
 *         - fonction
 *         - anciennete
 *         - role
 */

// Route PATCH pour marquer l'onboarding terminé
router.patch('/complete-onboarding', userController.completeOnboarding);


module.exports = router;
