const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique du service
 *         name:
 *           type: string
 *           description: 📋 Nom du service
 *         description:
 *           type: string
 *           description: 📝 Description du service
 *         code:
 *           type: string
 *           description: 🏷️ Code unique du service
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 🔄 Statut du service
 *         managers:
 *           type: array
 *           items:
 *             type: string
 *           description: 👥 Liste des IDs des managers du service
 *         mentors_count:
 *           type: integer
 *           description: 👨‍🏫 Nombre de mentors dans le service
 *         mentees_count:
 *           type: integer
 *           description: 👨‍🎓 Nombre de mentorés dans le service
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
 *         - code
 *       example:
 *         name: "Service Informatique"
 *         code: "IT"
 *         description: "Service en charge des systèmes d'information"
 *         status: "active"
 *         mentors_count: 5
 *         mentees_count: 10
 */

const ServiceSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true
    },
    description: { 
        type: String 
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    },
    managers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    mentors_count: {
        type: Number,
        default: 0
    },
    mentees_count: {
        type: Number,
        default: 0
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
ServiceSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Index pour améliorer les performances des requêtes
ServiceSchema.index({ name: 1 });
ServiceSchema.index({ code: 1 });
ServiceSchema.index({ status: 1 });

module.exports = mongoose.model('Service', ServiceSchema);
