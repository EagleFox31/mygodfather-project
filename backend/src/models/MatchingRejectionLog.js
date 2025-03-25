const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     MatchingRejectionLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique du log de rejet
 *         mentor_id:
 *           type: string
 *           description: 👨‍🏫 ID du mentor
 *         mentee_id:
 *           type: string
 *           description: 👨‍🎓 ID du mentoré
 *         rejected_by:
 *           type: string
 *           description: 🚫 ID de l'utilisateur ayant rejeté le matching
 *         rejection_reason:
 *           type: string
 *           description: ❌ Raison du rejet
 *         matching_score:
 *           type: number
 *           description: 📊 Score de compatibilité initial
 *         matching_details:
 *           type: object
 *           description: 📝 Détails du matching
 *           properties:
 *             anciennete_diff:
 *               type: number
 *               description: ⏳ Différence d'ancienneté
 *             age_diff:
 *               type: number
 *               description: 🎂 Différence d'âge
 *             same_service:
 *               type: boolean
 *               description: 🏢 Même service
 *             other_factors:
 *               type: object
 *               description: 🔄 Autres facteurs
 *         original_criteria:
 *           type: object
 *           description: 📋 Critères originaux
 *           properties:
 *             anciennete:
 *               type: object
 *               properties:
 *                 weight:
 *                   type: number
 *                   description: ⚖️ Poids du critère ancienneté
 *                 minDiff:
 *                   type: number
 *                   description: 📉 Différence minimale acceptable
 *                 maxDiff:
 *                   type: number
 *                   description: 📈 Différence maximale acceptable
 *             age:
 *               type: object
 *               properties:
 *                 weight:
 *                   type: number
 *                   description: ⚖️ Poids du critère âge
 *                 minDiff:
 *                   type: number
 *                   description: 📉 Différence minimale acceptable
 *                 maxDiff:
 *                   type: number
 *                   description: 📈 Différence maximale acceptable
 *             service:
 *               type: object
 *               properties:
 *                 weight:
 *                   type: number
 *                   description: ⚖️ Poids du critère service
 *                 sameService:
 *                   type: boolean
 *                   description: 🏢 Même service requis
 *         feedback_categories:
 *           type: array
 *           description: 📊 Catégories de feedback
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [incompatible_schedules, different_expectations, communication_style, expertise_mismatch, personality_clash, other]
 *                 description: 📑 Catégorie de rejet
 *               importance:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: ⭐ Importance (1-5)
 *         suggested_improvements:
 *           type: string
 *           description: 💡 Suggestions d'amélioration
 *         impact_on_algorithm:
 *           type: object
 *           description: 🔄 Impact sur l'algorithme
 *           properties:
 *             criteria_adjustments:
 *               type: object
 *               properties:
 *                 anciennete_weight_change:
 *                   type: number
 *                   description: ⚖️ Ajustement du poids ancienneté
 *                 age_weight_change:
 *                   type: number
 *                   description: ⚖️ Ajustement du poids âge
 *                 service_weight_change:
 *                   type: number
 *                   description: ⚖️ Ajustement du poids service
 *             new_factors_suggested:
 *               type: array
 *               items:
 *                 type: string
 *               description: 📝 Nouveaux facteurs suggérés
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de création
 *       required:
 *         - mentor_id
 *         - mentee_id
 *         - rejected_by
 *         - rejection_reason
 *         - matching_score
 *       example:
 *         rejection_reason: "Incompatibilité d'horaires"
 *         matching_score: 85
 *         feedback_categories: [
 *           {
 *             category: "incompatible_schedules",
 *             importance: 5
 *           }
 *         ]
 *         suggested_improvements: "Prendre en compte les disponibilités horaires"
 */

const MatchingRejectionLogSchema = new mongoose.Schema({
    // Schema definition reste inchangée...
});

// Reste du code inchangé...

module.exports = mongoose.model('MatchingRejectionLog', MatchingRejectionLogSchema);
