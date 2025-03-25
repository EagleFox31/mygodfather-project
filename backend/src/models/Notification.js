const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique de la notification
 *         user_id:
 *           type: string
 *           description: 👤 ID de l'utilisateur destinataire
 *         title:
 *           type: string
 *           description: 📢 Titre de la notification
 *         message:
 *           type: string
 *           description: 📝 Contenu de la notification
 *         type:
 *           type: string
 *           enum: [info, success, warning, error]
 *           description: 🎯 Type de notification
 *         category:
 *           type: string
 *           enum: [matching, session, message, system]
 *           description: 📑 Catégorie de la notification
 *         status:
 *           type: string
 *           enum: [unread, read]
 *           description: 👁️ Statut de lecture
 *         link:
 *           type: string
 *           description: 🔗 Lien associé (optionnel)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de création
 *         read_at:
 *           type: string
 *           format: date-time
 *           description: ⏰ Date de lecture
 *       required:
 *         - user_id
 *         - title
 *         - message
 *         - category
 *       example:
 *         title: "Nouvelle session planifiée"
 *         message: "Une session de mentorat a été planifiée pour demain"
 *         type: "info"
 *         category: "session"
 *         status: "unread"
 *         link: "/sessions/123"
 */

const NotificationSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info'
    },
    category: {
        type: String,
        enum: ['matching', 'session', 'message', 'system'],
        required: true
    },
    status: { 
        type: String, 
        enum: ['unread', 'read'], 
        default: 'unread' 
    },
    link: { 
        type: String 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    read_at: { 
        type: Date 
    }
});

// Index pour améliorer les performances des requêtes
NotificationSchema.index({ user_id: 1, status: 1 });
NotificationSchema.index({ created_at: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
