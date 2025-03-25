const Notification = require('../models/Notification');
const User = require('../models/User');
const teamsService = require('./teamsService');
const config = require('../config/config');
const createError = require('http-errors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
let io;

class NotificationService {
    constructor() {
        // Utilisation d'une Map en mémoire pour stocker les connexions WebSocket
        this.userSockets = new Map();
    }

    /**
     * Envoyer une notification aux RH
     */
    async notifyHR(title, message, type = 'info') {
        try {
            // Trouver tous les utilisateurs RH
            const hrUsers = await User.find({ role: 'rh', deletedAt: null });
            
            // Envoyer la notification à chaque RH
            const notifications = await Promise.all(
                hrUsers.map(user => 
                    this.createNotification({
                        userId: user._id,
                        title,
                        message,
                        type,
                        category: 'system',
                        metadata: { source: 'system' }
                    })
                )
            );

            return notifications;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification aux RH:', error);
            throw error;
        }
    }

    /**
     * Initialiser Socket.IO avec le serveur HTTP
     */
    initializeWebSocket(socketIo) {
        io = socketIo;

        io.on('connection', (socket) => {
            console.log('Client connecté:', socket.id);

            // Authentification du client
            socket.on('authenticate', async (token) => {
                try {
                    // Vérifier le token JWT
                    const decoded = jwt.verify(token, config.jwt.secret);
                    const userId = decoded.id;

                    // Stocker l'association userId -> socketId dans la Map
                    this.userSockets.set(userId, socket.id);
                    socket.userId = userId;

                    console.log(`Utilisateur ${userId} authentifié sur socket ${socket.id}`);
                } catch (error) {
                    console.error('Erreur d\'authentification WebSocket:', error);
                    socket.disconnect();
                }
            });

            socket.on('disconnect', () => {
                if (socket.userId) {
                    this.userSockets.delete(socket.userId);
                }
                console.log('Client déconnecté:', socket.id);
            });
        });
    }

    /**
     * Envoyer une notification via WebSocket
     */
    async sendWebSocketNotification(userId, notification) {
        try {
            const socketId = this.userSockets.get(userId);
            if (socketId && io) {
                io.to(socketId).emit('notification', notification);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification WebSocket:', error);
        }
    }

    /**
     * Créer une nouvelle notification avec support optionnel de Teams et WebSocket
     */
    async createNotification(data) {
        try {
            const notification = await Notification.create({
                user_id: data.userId,
                title: data.title,
                message: data.message,
                type: data.type || 'info',
                category: data.category,
                metadata: data.metadata || {},
                created_at: new Date()
            });

            // Récupérer les préférences de l'utilisateur
            const user = await User.findById(data.userId);
            if (!user) {
                throw createError(404, 'Utilisateur non trouvé');
            }

            // Tableau pour stocker les promesses d'envoi
            const notificationPromises = [];

            // Envoi par email si activé
            if (user.notification_preferences?.email?.enabled) {
                // TODO: Implémenter l'envoi d'email
                console.log('Email notification would be sent to:', user.email);
            }

            // Envoi sur Teams si activé et configuré
            if (user.notification_preferences?.teams?.enabled &&
                config.teams?.enabled &&
                user.teams_id) {
                try {
                    const teamsPromise = teamsService.sendMessage({
                        userId: user.teams_id,
                        message: `${data.title}\n\n${data.message}`,
                        importance: data.type === 'urgent' ? 'high' : 'normal'
                    }).catch(error => {
                        console.error('Erreur lors de l\'envoi sur Teams:', error);
                        return null;
                    });
                    notificationPromises.push(teamsPromise);
                } catch (error) {
                    console.error('Erreur lors de la préparation de la notification Teams:', error);
                }
            }

            // Envoi via WebSocket si activé
            if (user.notification_preferences?.web?.enabled) {
                try {
                    const wsPromise = this.sendWebSocketNotification(user._id, notification)
                        .catch(error => {
                            console.error('Erreur lors de l\'envoi WebSocket:', error);
                            return null;
                        });
                    notificationPromises.push(wsPromise);
                } catch (error) {
                    console.error('Erreur lors de la préparation de la notification WebSocket:', error);
                }
            }

            // Attendre que tous les envois soient terminés
            if (notificationPromises.length > 0) {
                await Promise.allSettled(notificationPromises);
            }

            return notification;
        } catch (error) {
            console.error('Erreur lors de la création de la notification:', error);
            throw error;
        }
    }

    /**
     * Obtenir les notifications d'un utilisateur
     */
    async getUserNotifications(userId, filters = {}) {
        try {
            const query = { user_id: userId };

            if (filters.status) {
                query.status = filters.status;
            }
            if (filters.type) {
                query.type = filters.type;
            }
            if (filters.category) {
                query.category = filters.category;
            }

            const notifications = await Notification.find(query)
                .sort({ created_at: -1 })
                .limit(filters.limit || 50);

            // Si Teams est activé, récupérer aussi les notifications Teams
            if (config.teams?.enabled) {
                const user = await User.findById(userId);
                if (user?.teams_id && user.notification_preferences?.teams?.enabled) {
                    try {
                        const teamsNotifications = await teamsService.getUserNotifications(user.teams_id)
                            .catch(error => {
                                console.error('Erreur lors de la récupération des notifications Teams:', error);
                                return [];
                            });

                        // Convertir les notifications Teams au format standard
                        const formattedTeamsNotifications = teamsNotifications.map(tn => ({
                            _id: `teams_${tn.id}`,
                            user_id: userId,
                            title: 'Notification Teams',
                            message: tn.message,
                            type: tn.importance === 'high' ? 'urgent' : 'info',
                            category: 'teams',
                            status: tn.status,
                            created_at: tn.createdDateTime,
                            source: 'teams'
                        }));

                        // Fusionner et trier les notifications
                        return [...notifications, ...formattedTeamsNotifications]
                            .sort((a, b) => b.created_at - a.created_at)
                            .slice(0, filters.limit || 50);
                    } catch (error) {
                        console.error('Erreur lors de la fusion des notifications Teams:', error);
                    }
                }
            }

            return notifications;
        } catch (error) {
            console.error('Erreur lors de la récupération des notifications:', error);
            throw error;
        }
    }

    /**
     * Marquer une notification comme lue
     */
    async markAsRead(notificationId, userId) {
        try {
            // Si c'est une notification Teams
            if (notificationId.startsWith('teams_')) {
                if (!config.teams?.enabled) {
                    throw createError(400, 'Teams n\'est pas activé');
                }

                const user = await User.findById(userId);
                if (!user?.teams_id) {
                    throw createError(404, 'ID Teams non trouvé');
                }

                const teamsNotificationId = notificationId.replace('teams_', '');
                await teamsService.markNotificationAsRead(user.teams_id, teamsNotificationId);
                return { success: true, source: 'teams' };
            }

            // Notification standard
            const notification = await Notification.findOne({
                _id: notificationId,
                user_id: userId
            });

            if (!notification) {
                throw createError(404, 'Notification non trouvée');
            }

            notification.status = 'read';
            notification.read_at = new Date();
            await notification.save();

            return notification;
        } catch (error) {
            console.error('Erreur lors du marquage de la notification:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour les préférences de notification
     */
    async updatePreferences(userId, preferences) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw createError(404, 'Utilisateur non trouvé');
            }

            // Si Teams est activé et que l'utilisateur active les notifications Teams
            if (config.teams?.enabled && preferences.teams?.enabled) {
                // Vérifier si l'utilisateur a un ID Teams
                if (!user.teams_id) {
                    try {
                        // Tenter de récupérer ou créer l'ID Teams de l'utilisateur
                        const teamsId = await teamsService.getUserTeamsId(user.email);
                        user.teams_id = teamsId;
                    } catch (error) {
                        console.error('Erreur lors de la récupération de l\'ID Teams:', error);
                        // Ne pas bloquer la mise à jour des autres préférences
                    }
                }
            }

            user.notification_preferences = {
                ...user.notification_preferences,
                ...preferences
            };

            await user.save();

            return user.notification_preferences;
        } catch (error) {
            console.error('Erreur lors de la mise à jour des préférences:', error);
            throw error;
        }
    }

    /**
     * Envoyer une notification globale
     */
    async sendGlobal(message, options = {}) {
        try {
            let query = {};

            // Filtrer par rôles si spécifié
            if (options.roles && options.roles.length > 0) {
                query.role = { $in: options.roles };
            }

            // Filtrer par services si spécifié
            if (options.services && options.services.length > 0) {
                query.service = { $in: options.services };
            }

            const users = await User.find(query).select('_id teams_id notification_preferences');

            const notifications = await Promise.all(
                users.map(async user => {
                    const notificationData = {
                        userId: user._id,
                        title: options.title || 'Notification Globale',
                        message,
                        type: options.type || 'info',
                        category: options.category || 'system'
                    };

                    // Créer la notification standard
                    const notification = await this.createNotification(notificationData);

                    // Si Teams est activé et l'utilisateur a activé les notifications Teams
                    if (config.teams?.enabled &&
                        user.notification_preferences?.teams?.enabled) {
                        try {
                            await teamsService.sendMessage({
                                userId: user.teams_id,
                                message: `${options.title || 'Notification Globale'}\n\n${message}`,
                                importance: options.type === 'urgent' ? 'high' : 'normal'
                            });
                        } catch (error) {
                            console.error('Erreur lors de l\'envoi de la notification Teams globale:', error);
                        }
                    }

                    // Envoyer via WebSocket si activé
                    if (user.notification_preferences?.web?.enabled) {
                        try {
                            await this.sendWebSocketNotification(user._id, notification);
                        } catch (error) {
                            console.error('Erreur lors de l\'envoi WebSocket de la notification globale:', error);
                        }
                    }

                    return notification;
                })
            );

            return {
                success: true,
                count: notifications.length,
                notifications
            };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification globale:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();
