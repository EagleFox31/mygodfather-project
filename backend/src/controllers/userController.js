const userService = require('../services/userService');
const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class UserController {
    /**
     * @desc    Obtenir tous les utilisateurs avec pagination et filtres
     * @route   GET /api/users
     * @access  Private (Admin, RH)
     */
    async getUsers(req, res, next) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                role, 
                service, 
                search,
                disponibilite,
                sort = 'created_at',
                order = 'desc'
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sort]: order === 'desc' ? -1 : 1 }
            };

            const filters = {};
            if (role) filters.role = role;
            if (service) filters.service = service;
            if (disponibilite !== undefined) filters.disponibilite = disponibilite === 'true';
            if (search) {
                filters.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { prenom: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const result = await userService.getUsers(filters, options);

            res.json({
                success: true,
                data: result.users,
                pagination: {
                    total: result.total,
                    page: result.page,
                    pages: result.pages,
                    hasNext: result.hasNext,
                    hasPrev: result.hasPrev
                }
            });

            // Log the query and result for debugging
            console.log('Query:', {
                filters,
                options,
                resultCount: result.users.length,
                total: result.total
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Créer un nouvel utilisateur
     * @route   POST /api/users
     * @access  Private (Admin)
     */
    async createUser(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const userData = req.body;
            const createdBy = req.user._id;

            const user = await userService.createUser(userData, createdBy);

            // Notifier l'utilisateur de la création de son compte
            await notificationService.createNotification({
                userId: user._id,
                title: 'Bienvenue sur MY GODFATHER',
                message: `Votre compte a été créé avec succès. Votre mot de passe temporaire est : ${userData.password}`,
                type: 'success',
                category: 'system'
            });

            // Notifier les RH
            await notificationService.notifyHR(
                'Nouvel utilisateur',
                `${user.prenom} ${user.name} a été ajouté en tant que ${user.role}`
            );

            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir son propre profil
     * @route   GET /api/users/profile
     * @access  Private
     */
    async getProfile(req, res, next) {
        try {
            const userId = req.user._id;
            const user = await userService.getUserById(userId);

            if (!user) {
                throw createError(404, 'Utilisateur non trouvé');
            }

            res.json({
                success: true,
                data: user
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir un utilisateur par ID
     * @route   GET /api/users/:id
     * @access  Private
     */
    async getUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);

            if (!user) {
                throw createError(404, 'Utilisateur non trouvé');
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour un utilisateur
     * @route   PUT /api/users/:id
     * @access  Private (Admin ou propriétaire)
     */
    async updateUser(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user._id;

            // Vérifier les permissions
            if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
                throw createError(403, 'Non autorisé à modifier cet utilisateur');
            }

            const user = await userService.updateUser(id, updateData, updatedBy);

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Supprimer un utilisateur
     * @route   DELETE /api/users/:id
     * @access  Private (Admin)
     */
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const deletedBy = req.user._id;

            await userService.deleteUser(id, reason, deletedBy);

            res.json({
                success: true,
                message: 'Utilisateur supprimé avec succès'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour son propre profil
     * @route   PUT /api/users/profile
     * @access  Private
     */
    async updateProfile(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const userId = req.user._id;
            const updateData = req.body;

            const user = await userService.updateProfile(userId, updateData);

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour les préférences de notification
     * @route   PUT /api/users/notifications/preferences
     * @access  Private
     */
    async updateNotificationPreferences(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const userId = req.user._id;
            const preferences = req.body;

            const result = await userService.updateNotificationPreferences(userId, preferences);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour la disponibilité (pour les mentors)
     * @route   PUT /api/users/disponibilite
     * @access  Private (Mentor)
     */
    async updateDisponibilite(req, res, next) {
        try {
            const userId = req.user._id;
            const { disponibilite } = req.body;

            if (req.user.role !== 'mentor') {
                throw createError(403, 'Seuls les mentors peuvent modifier leur disponibilité');
            }

            const user = await userService.updateMentorAvailability(userId, disponibilite);

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Marquer l'onboarding comme terminé pour l'utilisateur
     * @route   PATCH /api/users/complete-onboarding
     * @access  Private
     */
    async completeOnboarding(req, res, next) {
        try {
            const userId = req.user._id;
            console.log('✨ [UserController] PATCH /complete-onboarding | userId:', userId);
            const user = await userService.getUserById(userId);

            if (!user) {
                throw createError(404, 'Utilisateur non trouvé');
            }

            if (user.hasCompletedOnboarding) {
                return res.status(400).json({
                    success: false,
                    message: 'L\'onboarding est déjà terminé ✅'
                });
            }

            // On met à jour le champ hasCompletedOnboarding via le service
            const updatedUser = await userService.updateUser(
                userId,
                { hasCompletedOnboarding: true }
            );

            console.log('✅ [UserController] Onboarding mis à jour pour userId:', userId);

            return res.json({
                success: true,
                message: 'Onboarding terminé avec succès',
                data: updatedUser
            });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new UserController();
