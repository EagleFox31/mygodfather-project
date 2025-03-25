const mongoose = require('mongoose');
const Notification = require('./Notification');

/**
 * @swagger
 * components:
 *   schemas:
 *     TeamsChat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique du chat Teams
 *         pair_id:
 *           type: string
 *           description: 👥 Référence à la paire mentor-mentoré
 *         teams_channel_id:
 *           type: string
 *           description: 📢 ID du canal Teams
 *         teams_chat_id:
 *           type: string
 *           description: 💬 ID du chat Teams
 *         status:
 *           type: string
 *           enum: [active, close, archived]
 *           description: 🔄 Statut du chat
 *         last_activity:
 *           type: string
 *           format: date-time
 *           description: ⏰ Dernière activité
 *         messages_count:
 *           type: integer
 *           description: 📊 Nombre de messages
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de création
 *       required:
 *         - pair_id
 *         - teams_channel_id
 *         - teams_chat_id
 */

const TeamsChatSchema = new mongoose.Schema({
    pair_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MentorMenteePair',
        required: true
    },
    teams_channel_id: {
        type: String,
        required: true
    },
    teams_chat_id: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'close', 'archived'],
        default: 'active'
    },
    last_activity: {
        type: Date,
        default: Date.now
    },
    messages_count: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Reste du code inchangé...

module.exports = mongoose.model('TeamsChat', TeamsChatSchema);
