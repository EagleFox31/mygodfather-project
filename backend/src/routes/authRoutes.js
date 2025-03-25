const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: 🔐 Gestion de l'authentification des utilisateurs
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 🔑 Authentifier un utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 📧 Adresse email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 🔒 Mot de passe
 *                 example: Admin123!
 *     responses:
 *       200:
 *         description: ✅ Connexion réussie
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                     accessToken:
 *                       type: string
 *                       description: 🎟️ Token JWT
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: ❌ Identifiants invalides
 */
// Preflight
router.options('/login'); 

// Route POST
router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Email invalide')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Le mot de passe est requis'),
        validateRequest
    ],
    authController.login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 🔄 Rafraîchir le token d'accès
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: ✅ Nouveau token généré
 *       401:
 *         description: ❌ Token invalide
 */
// Preflight
router.options('/refresh');

// Route POST
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 📧 Demander une réinitialisation de mot de passe
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 📧 Adresse email de l'utilisateur
 *     responses:
 *       200:
 *         description: ✅ Email envoyé
 *       404:
 *         description: ❌ Utilisateur non trouvé
 */
// Preflight
router.options('/reset-password');

// Route POST
router.post(
    '/reset-password',
    [
        body('email')
            .isEmail()
            .withMessage('Email invalide')
            .normalizeEmail(),
        validateRequest
    ],
    authController.resetPassword
);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: 🔒 Réinitialiser le mot de passe
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 🎟️ Token de réinitialisation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 🔑 Nouveau mot de passe
 *     responses:
 *       200:
 *         description: ✅ Mot de passe réinitialisé
 *       400:
 *         description: ❌ Token invalide
 */
// Preflight (version paramétrée)
router.options('/reset-password/:token');

// Route POST
router.post(
    '/reset-password/:token',
    [
        body('password')
            .isLength({ min: 8 })
            .withMessage('Le mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage(
                'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
            ),
        validateRequest
    ],
    authController.validateResetToken
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 👋 Déconnecter l'utilisateur
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Déconnexion réussie
 *       401:
 *         description: ❌ Non authentifié
 */
// Preflight
router.options('/logout');

// Route POST
router.post('/logout', auth, authController.logout);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: 🔄 Changer le mot de passe
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: 🔒 Mot de passe actuel
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: 🔑 Nouveau mot de passe
 *     responses:
 *       200:
 *         description: ✅ Mot de passe changé
 *       401:
 *         description: ❌ Non authentifié
 */
// Preflight
router.options('/change-password');

// Route POST
router.post(
    '/change-password',
    [
        auth,
        body('currentPassword')
            .notEmpty()
            .withMessage('Le mot de passe actuel est requis'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage(
                'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
            ),
        validateRequest
    ],
    authController.changePassword
);

/**
 * @swagger
 * /api/auth/admin/change-password:
 *   post:
 *     summary: 👑 Changer le mot de passe d'un utilisateur (Admin)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 👤 ID de l'utilisateur
 *                 example: 60d21b4667d0d8992e610c85
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: 🔑 Nouveau mot de passe
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: ✅ Mot de passe changé avec succès
 *       401:
 *         description: ❌ Non authentifié
 *       403:
 *         description: 🚫 Accès refusé
 */
// Preflight
router.options('/admin/change-password');

// Route POST
router.post(
    '/admin/change-password',
    [
        auth,
        body('userId')
            .notEmpty()
            .withMessage("L'ID utilisateur est requis"),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage(
                'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
            ),
        validateRequest
    ],
    authController.adminChangePassword
);

/**
 * @swagger
 * /api/auth/status:
 *   get:
 *     summary: 🔍 Vérifier le statut d'authentification
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Statut vérifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: ❌ Non authentifié
 */
router.get('/status', auth, authController.checkAuthStatus);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 📝 Inscrire un nouvel utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: ✅ Utilisateur inscrit avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: ❌ Données invalides
 */

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Email invalide'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Mot de passe trop court')
            .matches(/^(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Le mot de passe doit contenir une majuscule et un chiffre'),
        validateRequest
    ],
    authController.register
);


module.exports = router;
