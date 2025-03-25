const Message = require('../models/Message');
const TeamsService = require('./teamsService');
const NotificationService = require('./notificationService');

class MessageService {
    // Envoyer un message
    async sendMessage(senderId, receiverId, content, attachments = []) {
        try {
            // Créer le message
            const message = new Message({
                sender_id: senderId,
                receiver_id: receiverId,
                content,
                attachments,
                status: 'sent'
            });

            await message.save();

            // Notifier le destinataire
            await NotificationService.notifyUser(
                receiverId,
                'Nouveau message',
                'Vous avez reçu un nouveau message',
                'info',
                'message',
                `/messages/${message._id}`
            );

            // Si le message contient des pièces jointes, les traiter
            if (attachments && attachments.length > 0) {
                message.attachments = await this.processAttachments(attachments);
                await message.save();
            }

            return message;
        } catch (error) {
            throw error;
        }
    }

    // Traiter les pièces jointes
    async processAttachments(attachments) {
        try {
            return await Promise.all(attachments.map(async (attachment) => {
                // Stocker le fichier et obtenir l'URL
                const url = await this.uploadAttachment(attachment);
                return {
                    name: attachment.name,
                    url: url,
                    type: attachment.type
                };
            }));
        } catch (error) {
            throw error;
        }
    }

    // Marquer un message comme lu
    async markAsRead(messageId, userId) {
        try {
            const message = await Message.findOne({
                _id: messageId,
                receiver_id: userId
            });

            if (!message) {
                throw new Error('Message non trouvé');
            }

            message.status = 'read';
            message.read_at = new Date();
            await message.save();

            // Notifier l'expéditeur que son message a été lu
            await NotificationService.notifyUser(
                message.sender_id,
                'Message lu',
                'Votre message a été lu',
                'info',
                'message'
            );

            return message;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer les messages d'une conversation
    async getConversation(userId1, userId2, options = {}) {
        try {
            const query = {
                $or: [
                    { sender_id: userId1, receiver_id: userId2 },
                    { sender_id: userId2, receiver_id: userId1 }
                ]
            };

            const messages = await Message.find(query)
                .sort({ created_at: -1 })
                .skip(options.skip || 0)
                .limit(options.limit || 50)
                .populate('sender_id', 'name prenom')
                .populate('receiver_id', 'name prenom');

            // Marquer les messages non lus comme "delivered"
            await Message.updateMany(
                {
                    receiver_id: userId1,
                    status: 'sent'
                },
                {
                    status: 'delivered'
                }
            );

            return messages;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer les messages non lus
    async getUnreadMessages(userId) {
        try {
            return await Message.find({
                receiver_id: userId,
                status: { $in: ['sent', 'delivered'] }
            })
            .sort({ created_at: -1 })
            .populate('sender_id', 'name prenom');
        } catch (error) {
            throw error;
        }
    }

    // Envoyer un message via Teams
    async sendTeamsMessage(senderId, receiverId, content, channelId) {
        try {
            // Créer le message dans notre système
            const message = await this.sendMessage(senderId, receiverId, content);

            // Envoyer le message sur Teams
            await TeamsService.sendChannelMessage(channelId, content);

            return message;
        } catch (error) {
            throw error;
        }
    }

    // Supprimer un message (soft delete)
    async deleteMessage(messageId, userId) {
        try {
            const message = await Message.findOne({
                _id: messageId,
                $or: [
                    { sender_id: userId },
                    { receiver_id: userId }
                ]
            });

            if (!message) {
                throw new Error('Message non trouvé');
            }

            message.deleted_for = message.deleted_for || [];
            if (!message.deleted_for.includes(userId)) {
                message.deleted_for.push(userId);
            }

            // Si les deux utilisateurs ont supprimé le message
            if (message.deleted_for.length === 2) {
                message.deleted_at = new Date();
            }

            await message.save();
            return message;
        } catch (error) {
            throw error;
        }
    }

    // Obtenir les statistiques des messages
    async getMessageStats(userId = null) {
        try {
            let match = {};
            if (userId) {
                match.$or = [
                    { sender_id: userId },
                    { receiver_id: userId }
                ];
            }

            const stats = await Message.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        avgResponseTime: {
                            $avg: {
                                $cond: [
                                    { $eq: ['$status', 'read'] },
                                    {
                                        $subtract: ['$read_at', '$created_at']
                                    },
                                    null
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
}

module.exports = new MessageService();
