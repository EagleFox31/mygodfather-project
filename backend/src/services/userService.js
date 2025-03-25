const User = require('../models/User');
const notificationService = require('./notificationService');

class UserService {
    // Création d'un utilisateur
    async createUser(userData) {
        try {
            const user = new User(userData);
            await user.save();

            // Notifier les RH de la création d'un nouvel utilisateur
            await notificationService.notifyHR('Nouvel utilisateur', 
                `${user.prenom} ${user.name} a été ajouté en tant que ${user.role}`);

            return this.sanitizeUser(user);
        } catch (error) {
            throw error;
        }
    }

    // Récupération d'un utilisateur par ID
    async getUserById(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            return {
                ...this.sanitizeUser(user),
                hasCompletedOnboarding: user.hasCompletedOnboarding
            };
        } catch (error) {
            throw error;
        }
    }

    // 🔹 Récupération de l'utilisateur connecté
    async getCurrentUser(userId) {
        try {
            const user = await User.findById(userId).select('-password');

            if (!user) {
                return null;
            }

            return {
                ...user.toObject(),
                hasCompletedOnboarding: user.hasCompletedOnboarding
            };
        } catch (error) {
            return null;
        }
    }


    // Mise à jour d'un utilisateur
    async updateUser(userId, updateData) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            // Vérifier si le rôle change
            const roleChanged = updateData.role && updateData.role !== user.role;
            const oldRole = user.role;

            // Mettre à jour l'utilisateur
            Object.assign(user, updateData);
            await user.save();

            // Si le rôle a changé, notifier les RH
            if (roleChanged) {
                await notificationService.notifyHR('Changement de rôle', 
                    `Le rôle de ${user.prenom} ${user.name} a été changé de ${oldRole} à ${user.role}`);
            }

            return this.sanitizeUser(user);
        } catch (error) {
            throw error;
        }
    }

    // Suppression douce d'un utilisateur
    async deleteUser(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            user.deletedAt = new Date();
            await user.save();

            await notificationService.notifyHR('Utilisateur supprimé', 
                `${user.prenom} ${user.name} a été supprimé du système`);

            return { message: 'Utilisateur supprimé avec succès' };
        } catch (error) {
            throw error;
        }
    }

    // Récupération de tous les utilisateurs (avec filtres et pagination)
    async getUsers(filters = {}, options = {}) {
        try {
            let query = { deletedAt: null };

            // Appliquer les filtres
            if (filters.role) {
                query.role = filters.role;
            }
            if (filters.service) {
                query.service = filters.service;
            }
            if (filters.disponibilite !== undefined) {
                query.disponibilite = filters.disponibilite === 'true';
            }
            if (filters.$or) {
                query.$or = filters.$or;
            }

            // Calculer le total
            const total = await User.countDocuments(query);

            // Appliquer la pagination
            const page = parseInt(options.page) || 1;
            const limit = parseInt(options.limit) || 10;
            const skip = (page - 1) * limit;

            // Récupérer les utilisateurs avec pagination et tri
            const users = await User.find(query)
                .sort(options.sort || { createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // Calculer les métadonnées de pagination
            const pages = Math.ceil(total / limit);
            const hasNext = page < pages;
            const hasPrev = page > 1;

            return {
                users: users.map(user => this.sanitizeUser(user)),
                total,
                page,
                pages,
                hasNext,
                hasPrev
            };
        } catch (error) {
            throw error;
        }
    }

    // Mise à jour de la disponibilité d'un mentor
    async updateMentorAvailability(userId, isAvailable) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            if (user.role !== 'mentor') {
                throw new Error('L\'utilisateur n\'est pas un mentor');
            }

            user.disponibilite = isAvailable;
            await user.save();

            // Notifier les RH du changement de disponibilité
            const status = isAvailable ? 'disponible' : 'indisponible';
            await notificationService.notifyHR('Disponibilité mentor', 
                `${user.prenom} ${user.name} est maintenant ${status} pour le mentorat`);

            return this.sanitizeUser(user);
        } catch (error) {
            throw error;
        }
    }

    // Récupération des mentors disponibles
    async getAvailableMentors(filters = {}) {
        try {
            let query = {
                role: 'mentor',
                disponibilite: true,
                deletedAt: null
            };

            if (filters.service) {
                query.service = filters.service;
            }
            if (filters.anciennete) {
                query.anciennete = { $gte: filters.anciennete };
            }

            const mentors = await User.find(query);
            return mentors.map(mentor => this.sanitizeUser(mentor));
        } catch (error) {
            throw error;
        }
    }

    // Récupération des statistiques utilisateurs
    async getUserStats() {
        try {
            const stats = await User.aggregate([
                {
                    $match: { deletedAt: null }
                },
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 },
                        availableMentors: {
                            $sum: {
                                $cond: [
                                    { $and: [
                                        { $eq: ['$role', 'mentor'] },
                                        { $eq: ['$disponibilite', true] }
                                    ]},
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            return stats;
        } catch (error) {
            throw error;
        }
    }


    // Nettoyage des données sensibles
    sanitizeUser(user) {
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
    }
}

module.exports = new UserService();
