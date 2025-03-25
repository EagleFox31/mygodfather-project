const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Backup:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique de la sauvegarde
 *         filename:
 *           type: string
 *           description: 📄 Nom du fichier de sauvegarde
 *         path:
 *           type: string
 *           description: 📁 Chemin du fichier de sauvegarde
 *         type:
 *           type: string
 *           enum: [pre-migration, post-migration, manual, restore]
 *           description: 🏷️ Type de sauvegarde
 *         status:
 *           type: string
 *           enum: [pending, in_progress, success, failed]
 *           description: 🔄 Statut de la sauvegarde
 *         size:
 *           type: number
 *           description: 📊 Taille du fichier (en octets)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de création
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: ✅ Date de complétion
 *         error:
 *           type: string
 *           description: ❌ Message d'erreur (si échec)
 *         metadata:
 *           type: object
 *           description: 📝 Métadonnées de la sauvegarde
 *           properties:
 *             collections:
 *               type: array
 *               description: 📚 Collections sauvegardées
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: 📑 Nom de la collection
 *                   documents:
 *                     type: number
 *                     description: 🔢 Nombre de documents
 *             totalSize:
 *               type: number
 *               description: 📊 Taille totale
 *             compressionRatio:
 *               type: number
 *               description: 📉 Taux de compression
 *       required:
 *         - filename
 *         - path
 *         - type
 *       example:
 *         filename: "backup-2023-12-25.gz"
 *         path: "/backups/2023/12/"
 *         type: "manual"
 *         status: "success"
 *         size: 1048576
 *         metadata:
 *           collections: [
 *             {
 *               name: "users",
 *               documents: 1000
 *             },
 *             {
 *               name: "sessions",
 *               documents: 500
 *             }
 *           ]
 *           totalSize: 1048576
 *           compressionRatio: 0.7
 */

const backupSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['pre-migration', 'post-migration', 'manual', 'restore'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'success', 'failed'],
        default: 'pending'
    },
    size: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    error: {
        type: String
    },
    metadata: {
        collections: [{
            name: String,
            documents: Number
        }],
        totalSize: Number,
        compressionRatio: Number
    }
}, {
    timestamps: true
});

// Reste du code inchangé...

module.exports = mongoose.model('Backup', backupSchema);
