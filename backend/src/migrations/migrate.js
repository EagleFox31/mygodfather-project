const mongoose = require('mongoose');
const config = require('../config/config');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Import des modèles
const User = require('../models/User');
const Service = require('../models/Service');
const MentorMenteePair = require('../models/MentorMenteePair');
const MentoringSession = require('../models/MentoringSession');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const TeamsChat = require('../models/TeamsChat');
const MatchingLog = require('../models/MatchingLog');
const MatchingRejectionLog = require('../models/MatchingRejectionLog');
const Import = require('../models/Import');
const Backup = require('../models/Backup');

async function createBackupDir() {
    const backupDir = path.join(__dirname, '../../backups');
    try {
        await fs.mkdir(backupDir, { recursive: true });
        return backupDir;
    } catch (error) {
        console.error('❌ Erreur lors de la création du dossier de backup:', error);
        throw error;
    }
}

async function getCollectionStats(db) {
    const collections = await db.listCollections().toArray();
    const stats = [];
    
    for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        stats.push({
            name: collection.name,
            documents: count
        });
    }
    
    return stats;
}

async function backupDatabase() {
    try {
        const backupDir = await createBackupDir();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}`;
        const backupPath = path.join(backupDir, filename);
        
        console.log('📦 Création d\'une sauvegarde de la base de données...');

        // Créer l'entrée de backup dans la base de données
        const backup = await Backup.createBackup({
            filename,
            path: backupPath,
            type: 'pre-migration'
        });

        try {
            // Construire la commande mongodump
            const cmd = `mongodump --uri="${config.database.url}" --out="${backupPath}"`;
            await execPromise(cmd);

            // Obtenir les métadonnées du backup
            const stats = await fs.stat(backupPath);
            const collections = await getCollectionStats(mongoose.connection.db);
            
            const metadata = {
                size: stats.size,
                collections,
                totalSize: stats.size,
                compressionRatio: 1 // Pour l'instant pas de compression
            };

            // Mettre à jour le backup avec les métadonnées et marquer comme succès
            await Backup.markAsCompleted(backup._id, metadata);
            
            console.log(`✅ Sauvegarde créée dans ${backupPath}`);
            return backupPath;
        } catch (error) {
            await Backup.markAsFailed(backup._id, error);
            throw error;
        }
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        throw error;
    }
}

async function dropIndexes(model) {
    try {
        await model.collection.dropIndexes();
        console.log(`🗑️ Index supprimés pour ${model.modelName}`);
    } catch (error) {
        if (error.code !== 26) { // Ignore l'erreur "ns not found"
            throw error;
        }
    }
}

async function createIndexes(model) {
    const indexes = model.schema.indexes();
    if (indexes.length > 0) {
        for (const [fields, options] of indexes) {
            try {
                await model.collection.createIndex(fields, { ...options, background: true });
                console.log(`✅ Index créé pour ${model.modelName}: ${JSON.stringify(fields)}`);
            } catch (error) {
                if (error.code !== 85 && error.code !== 86) { // Ignore les erreurs d'index déjà existants
                    throw error;
                }
                console.log(`ℹ️ Index existe déjà pour ${model.modelName}: ${JSON.stringify(fields)}`);
            }
        }
    }
}

async function migrate() {
    let backupPath = null;
    
    try {
        // 🔄 Connexion à la base de données
        console.log('🔌 Connexion à MongoDB...');
        await mongoose.connect(config.database.url, config.database.options);
        console.log('✅ Connecté à MongoDB');

        // 💾 Créer une sauvegarde avant la migration
        backupPath = await backupDatabase();
        console.log('✅ Sauvegarde terminée');

        // 📊 Collection des modèles à migrer
        const models = [
            User,
            Service,
            MentorMenteePair,
            MentoringSession,
            Message,
            Notification,
            TeamsChat,
            MatchingLog,
            MatchingRejectionLog,
            Import,
            Backup
        ];

        // 🔄 Migration de chaque modèle
        for (const model of models) {
            console.log(`\n🔄 Migration du modèle ${model.modelName}...`);
            
            try {
                // Vérifier si la collection existe
                const collections = await mongoose.connection.db.listCollections().toArray();
                const collectionExists = collections.some(c => c.name === model.collection.name);

                if (!collectionExists) {
                    // Créer la collection si elle n'existe pas
                    await mongoose.connection.db.createCollection(model.collection.name);
                    console.log(`✅ Collection ${model.modelName} créée`);
                } else {
                    console.log(`ℹ️ Collection ${model.modelName} existe déjà`);
                }

                // Recréer les index
                await dropIndexes(model);
                await createIndexes(model);

            } catch (error) {
                console.error(`❌ Erreur lors de la migration de ${model.modelName}:`, error);
                throw error;
            }
        }

        console.log('\n✅ Migration terminée avec succès !');
        console.log(`💾 Une sauvegarde a été créée dans : ${backupPath}`);
        
        // 🔌 Fermeture de la connexion
        await mongoose.connection.close();
        console.log('🔌 Connexion MongoDB fermée');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Erreur lors de la migration:', error);
        
        if (backupPath) {
            console.log(`💾 Une sauvegarde est disponible dans : ${backupPath}`);
            console.log('Pour restaurer la sauvegarde :');
            console.log(`mongorestore --uri="${config.database.url}" "${backupPath}"`);
        }
        
        // 🔌 Fermeture de la connexion en cas d'erreur
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('🔌 Connexion MongoDB fermée');
        }
        
        process.exit(1);
    }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
    console.error('🔥 Erreur non gérée:', error);
    process.exit(1);
});

// Lancement de la migration
migrate();
