const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Skill:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique de la compétence
 *         name:
 *           type: string
 *           description: 📋 Nom de la compétence
 *         description:
 *           type: string
 *           description: 📝 Description de la compétence
 *         category:
 *           type: string
 *           description: 🏷️ Catégorie de la compétence
 *         service:
 *           type: string
 *           description: 🏢 Service associé à la compétence
 *         level_criteria:
 *           type: object
 *           properties:
 *             junior:
 *               type: string
 *             intermediate:
 *               type: string
 *             senior:
 *               type: string
 *             expert:
 *               type: string
 *           description: 📊 Critères par niveau d'expertise
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 🔄 Statut de la compétence
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de création
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 🔄 Date de dernière mise à jour
 *       required:
 *         - name
 *         - category
 *         - service
 */

const SkillSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true
    },
    description: { 
        type: String 
    },
    category: {
        type: String,
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    level_criteria: {
        junior: {
            type: String,
            default: "0-2 ans d'expérience"
        },
        intermediate: {
            type: String,
            default: "2-5 ans d'expérience"
        },
        senior: {
            type: String,
            default: "5-8 ans d'expérience"
        },
        expert: {
            type: String,
            default: "8+ ans d'expérience"
        }
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date,
        default: Date.now
    }
});

// Middleware pour mettre à jour updated_at avant chaque sauvegarde
SkillSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Index pour améliorer les performances des requêtes
SkillSchema.index({ name: 1, service: 1 }, { unique: true });
SkillSchema.index({ category: 1 });
SkillSchema.index({ status: 1 });

module.exports = mongoose.model('Skill', SkillSchema);
