const mongoose = require('mongoose');
const Notification = require('./Notification');

/**
 * @swagger
 * components:
 *   schemas:
 *     MatchingLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique du log de matching
 *         menteeId:
 *           type: string
 *           description: 👨‍🎓 ID du mentoré
 *         suggestions:
 *           type: array
 *           description: 📋 Liste des suggestions de mentors
 *           items:
 *             type: object
 *             properties:
 *               mentorId:
 *                 type: string
 *                 description: 👨‍🏫 ID du mentor suggéré
 *               compatibilityScore:
 *                 type: number
 *                 description: 📊 Score de compatibilité (0-100)
 *               details:
 *                 type: object
 *                 description: 📝 Détails du calcul de compatibilité
 *                 properties:
 *                   anciennete:
 *                     type: number
 *                     description: ⏳ Score basé sur l'ancienneté
 *                   ageDiff:
 *                     type: number
 *                     description: 🎂 Score basé sur la différence d'âge
 *                   service:
 *                     type: boolean
 *                     description: 🏢 Compatibilité de service
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: 📅 Date de création de la suggestion
 *       required:
 *         - menteeId
 *         - suggestions
 *       example:
 *         menteeId: "60d5ecb8b5c9c62b3c7c1b5e"
 *         suggestions: [
 *           {
 *             mentorId: "60d5ecb8b5c9c62b3c7c1b5f",
 *             compatibilityScore: 85,
 *             details: {
 *               anciennete: 0.8,
 *               ageDiff: 0.9,
 *               service: true
 *             }
 *           }
 *         ]
 */

const MatchingLogSchema = new mongoose.Schema({
    menteeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    suggestions: [{
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        compatibilityScore: {
            type: Number,
            required: true
        },
        details: {
            anciennete: { type: Number },
            ageDiff: { type: Number },
            service: { type: Boolean }
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

// Reste du code inchangé...

module.exports = mongoose.model('MatchingLog', MatchingLogSchema);
