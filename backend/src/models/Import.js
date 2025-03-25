const mongoose = require('mongoose');
const Notification = require('./Notification');

/**
 * @swagger
 * components:
 *   schemas:
 *     Import:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique de l'import
 *         file_name:
 *           type: string
 *           description: 📄 Nom du fichier importé
 *         file_type:
 *           type: string
 *           enum: [csv, excel]
 *           description: 📁 Type de fichier
 *         imported_by:
 *           type: string
 *           description: 👤 ID de l'utilisateur qui a effectué l'import
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           description: 🔄 Statut de l'import
 *         total_records:
 *           type: integer
 *           description: 📊 Nombre total d'enregistrements
 *         processed_records:
 *           type: integer
 *           description: ✅ Enregistrements traités
 *         failed_records:
 *           type: integer
 *           description: ❌ Enregistrements en échec
 *         error_log:
 *           type: array
 *           description: 📝 Journal des erreurs
 *           items:
 *             type: object
 *             properties:
 *               row:
 *                 type: integer
 *                 description: 📍 Numéro de ligne
 *               error:
 *                 type: string
 *                 description: ❗ Message d'erreur
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de création
 *         completed_at:
 *           type: string
 *           format: date-time
 *           description: ⏰ Date de fin
 *       required:
 *         - file_name
 *         - file_type
 *         - imported_by
 *       example:
 *         file_name: "users_import.xlsx"
 *         file_type: "excel"
 *         status: "processing"
 *         total_records: 100
 *         processed_records: 45
 *         failed_records: 2
 *         error_log: [
 *           {
 *             row: 23,
 *             error: "Email invalide"
 *           }
 *         ]
 */

const ImportSchema = new mongoose.Schema({
    file_name: {
        type: String,
        required: true
    },
    file_type: {
        type: String,
        enum: ['csv', 'excel'],
        required: true
    },
    imported_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    total_records: {
        type: Number,
        default: 0
    },
    processed_records: {
        type: Number,
        default: 0
    },
    failed_records: {
        type: Number,
        default: 0
    },
    error_log: [{
        row: Number,
        error: String
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    completed_at: {
        type: Date
    }
});

// Reste du code inchangé...

module.exports = mongoose.model('Import', ImportSchema);
