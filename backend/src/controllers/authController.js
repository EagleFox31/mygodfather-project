const authService = require('../services/authService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auditService = require('../services/admin/auditService');
const notificationService = require('../services/notificationService');

// On suppose que User, auditService et notificationService sont importés
// si nécessaire. Sinon, tu peux les réintégrer comme avant.

class AuthController {
    /**
     * @desc    Authentifier un utilisateur
     * @route   POST /api/auth/login
     * @access  Public
     */
    async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données de connexion invalides', {
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;
            const deviceInfo = {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                device: req.headers['sec-ch-ua-platform']
            };

            const result = await authService.login(email, password, deviceInfo);

            // Décoder le token pour obtenir les timestamps
            const decoded = jwt.decode(result.accessToken);
            const tokenInfo = {
                createdAt: new Date(decoded.iat * 1000).toLocaleString(),
                expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
                validFor: '15 minutes'
            };

            // Définir le cookie pour le refresh token
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none', // Crucial pour autoriser le cross-origin en HTTPS
                domain:
                    process.env.NODE_ENV === 'development' ? 'localhost' : '.votre-domaine.com',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
            });

            // En-têtes de sécurité supplémentaires
            res.header('X-Content-Type-Options', 'nosniff');
            res.header('X-Frame-Options', 'DENY');
            res.header('Content-Security-Policy', "default-src 'self'");

            res.json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    tokenInfo: tokenInfo
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Rafraîchir le token d'accès
     * @route   POST /api/auth/refresh
     * @access  Public
     */
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                throw createError(401, 'Token de rafraîchissement manquant');
            }

            const deviceInfo = {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                device: req.headers['sec-ch-ua-platform']
            };

            const result = await authService.refreshToken(refreshToken, deviceInfo);

            // Décoder le nouveau token pour obtenir les timestamps
            const decoded = jwt.decode(result.accessToken);
            const tokenInfo = {
                createdAt: new Date(decoded.iat * 1000).toLocaleString(),
                expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
                validFor: '15 minutes'
            };

            res.json({
                success: true,
                data: {
                    accessToken: result.accessToken,
                    tokenInfo: tokenInfo
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Déconnecter un utilisateur
     * @route   POST /api/auth/logout
     * @access  Private
     */
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (refreshToken) {
                await authService.revokeRefreshToken(refreshToken);
            }

            // Supprimer le cookie de refresh
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            // Forcer les bons en-têtes CORS (si besoin, selon ta config)
            res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Vary', 'Origin');

            res.json({
                success: true,
                message: 'Déconnexion réussie'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Réinitialiser le mot de passe
     * @route   POST /api/auth/reset-password
     * @access  Public
     */
    async resetPassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', {
                    errors: errors.array()
                });
            }

            const { email } = req.body;
            await authService.initiatePasswordReset(email);

            res.json({
                success: true,
                message:
                    'Si cette adresse email existe, vous recevrez les instructions de réinitialisation'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Valider le token de réinitialisation
     * @route   POST /api/auth/reset-password/:token
     * @access  Public
     */
    async validateResetToken(req, res, next) {
        try {
            const { token } = req.params;
            const { password } = req.body;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Mot de passe invalide', {
                    errors: errors.array()
                });
            }

            await authService.resetPassword(token, password);

            res.json({
                success: true,
                message: 'Mot de passe réinitialisé avec succès'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Changer le mot de passe
     * @route   POST /api/auth/change-password
     * @access  Private
     */
    async changePassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', {
                    errors: errors.array()
                });
            }

            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            await authService.changePassword(userId, currentPassword, newPassword);

            // Révoquer tous les tokens de rafraîchissement existants
            await authService.revokeAllUserTokens(userId, 'password_change');

            // Supprimer le cookie de refresh
            res.clearCookie('refreshToken');

            res.json({
                success: true,
                message: 'Mot de passe changé avec succès. Veuillez vous reconnecter.'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Changer le mot de passe d'un utilisateur (admin seulement)
     * @route   POST /api/auth/admin/change-password
     * @access  Private (role: admin)
     */
    async adminChangePassword(req, res, next) {
        try {
            // Vérification que l'utilisateur est admin
            if (req.user.role !== 'admin') {
                throw createError(403, 'Accès refusé');
            }

            // Vérification des erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', {
                    errors: errors.array()
                });
            }

            const { userId, newPassword } = req.body;

            // Vérification que l'utilisateur cible existe
            const user = await User.findById(userId);
            if (!user) {
                throw createError(404, 'Utilisateur introuvable');
            }

            // Validation du mot de passe
            if (
                newPassword.length < 8 ||
                !/[A-Z]/.test(newPassword) ||
                !/[0-9]/.test(newPassword)
            ) {
                throw createError(
                    400,
                    'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre'
                );
            }

            // Modification du mot de passe via le service
            await authService.adminChangePassword(userId, newPassword);

            // Journalisation de l'action (audit)
            await auditService.logAction(
                req.user.id,
                'admin_change_password',
                `Admin ${req.user.email} a modifié le mot de passe de ${user.email}`
            );

            // Notification sur le dashboard de l’utilisateur
            await notificationService.createNotification({
                user_id: userId,
                title: '🔑 Changement de mot de passe',
                message:
                    "Votre mot de passe a été modifié par un administrateur. Si vous n'êtes pas à l'origine de cette modification, contactez le support immédiatement.",
                type: 'warning',
                category: 'security'
            });

            return res.json({
                success: true,
                message: 'Mot de passe changé avec succès par administrateur'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Vérifier le statut d'authentification
     * @route   GET /api/auth/status
     * @access  Private
     */
    async checkAuthStatus(req, res, next) {
        try {
            const user = await authService.getUserStatus(req.user.id);

            // Décoder le token actuel pour obtenir ses infos de validité
            const token = req.headers.authorization.split(' ')[1];
            if (!token) throw createError(401, 'Token manquant');
            const decoded = jwt.decode(token);
            const tokenInfo = {
                createdAt: new Date(decoded.iat * 1000).toLocaleString(),
                expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
                validFor: '15 minutes'
            };

            res.json({
                success: true,
                data: {
                    user,
                    isAuthenticated: true,
                    tokenInfo
                }
            });
        } catch (error) {
            next(error);
        }
    }

/**
 * @desc    Inscrire un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
    async register(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', {
                    errors: errors.array()
                });
            }

            const result = await authService.register(req.body);

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    
}

module.exports = new AuthController();
