const mongoose = require('mongoose');
const Notification = require('./Notification');

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
 *         sender_id:
 *           type: string
 *           description: 📤 ID de l'expéditeur
 *         receiver_id:
 *           type: string
 *           description: 📥 ID du destinataire
 *         content:
 *           type: string
 *           description: 📝 Contenu du message
 *         status:
 *           type: string
 *           enum: [sent, delivered, read]
 *           description: 📫 Statut du message
 *         attachments:
 *           type: array
 *           description: 📎 Pièces jointes
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 📄 Nom du fichier
 *               url:
 *                 type: string
 *                 description: 🔗 URL du fichier
 *               type:
 *                 type: string
 *                 description: 📁 Type de fichier
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 📅 Date d'envoi
 *         read_at:
 *           type: string
 *           format: date-time
 *           description: 👁️ Date de lecture
 *       required:
 *         - sender_id
 *         - receiver_id
 *         - content
 *       example:
 *         content: "Bonjour, pouvons-nous planifier une session de mentorat ?"
 *         status: "sent"
 *         attachments: []
 */

const MessageSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    read_at: {
        type: Date
    }
});

// Middleware pour générer une notification après l'envoi d'un message
MessageSchema.post('save', async function (doc) {
    try {
        const message = await this.constructor.findById(doc._id)
            .populate('sender_id', 'name prenom')
            .populate('receiver_id', 'name prenom');

        if (message) {
            // Notification pour le destinataire
            await new Notification({
                user_id: message.receiver_id._id,
                title: 'Nouveau message',
                message: `Vous avez reçu un nouveau message de ${message.sender_id.prenom} ${message.sender_id.name}`,
                type: 'info',
                category: 'message',
                link: `/messages/${message._id}` // Lien vers le message
            }).save();
        }
    } catch (error) {
        console.error('Erreur lors de la création de la notification:', error);
    }
});

// Middleware pour générer une notification lors de la lecture d'un message
MessageSchema.pre('findOneAndUpdate', async function () {
    const update = this.getUpdate();
    if (update.status === 'read') {
        const message = await this.model.findOne(this.getQuery())
            .populate('sender_id', 'name prenom')
            .populate('receiver_id', 'name prenom');

        if (message) {
            // Notification pour l'expéditeur que son message a été lu
            await new Notification({
                user_id: message.sender_id._id,
                title: 'Message lu',
                message: `${message.receiver_id.prenom} ${message.receiver_id.name} a lu votre message`,
                type: 'info',
                category: 'message',
                link: `/messages/${message._id}`
            }).save();
        }
    }
});

// Index pour améliorer les performances des requêtes
MessageSchema.index({ sender_id: 1, receiver_id: 1 });
MessageSchema.index({ created_at: -1 });
MessageSchema.index({ status: 1 });

module.exports = mongoose.model('Message', MessageSchema);
