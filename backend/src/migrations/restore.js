const mongoose = require('mongoose');
const config = require('../config/config');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');
const fs = require('fs').promises;
const Backup = require('../models/Backup');

async function listBackups() {
    try {
        const backupDir = path.join(__dirname, '../../backups');
        const files = await fs.readdir(backupDir);
        const backups = files.filter(file => file.startsWith('backup-'));
        
        console.log('\n📂 Sauvegardes disponibles :');
        backups.forEach((backup, index) => {
            console.log(`${index + 1}. ${backup}`);
        });
        
        return backups;
    } catch (error) {
        console.error('❌ Erreur lors de la lecture des sauvegardes:', error);
        throw error;
    }
}

async function restoreBackup(backupName) {
    try {
        console.log('🔄 Démarrage de la restauration...');
        
        // Vérifier si le backup existe
        const backupDir = path.join(__dirname, '../../backups');
        const backupPath = path.join(backupDir, backupName);
        
        try {
            await fs.access(backupPath);
        } catch {
            throw new Error(`Le backup ${backupName} n'existe pas`);
        }

        // Connexion à MongoDB pour enregistrer la restauration
        await mongoose.connect(config.database.url, config.database.options);
        console.log('✅ Connecté à MongoDB');

        // Enregistrer la restauration
        const backup = new Backup({
            path: backupPath,
            type: 'restore',
            status: 'in_progress',
            createdAt: new Date()
        });
        await backup.save();

        // Construire la commande mongorestore
        const cmd = `mongorestore --uri="${config.database.url}" --drop "${backupPath}"`;
        
        console.log('🔄 Restauration de la base de données...');
        await execPromise(cmd);

        // Mettre à jour le statut de la restauration
        backup.status = 'completed';
        backup.completedAt = new Date();
        await backup.save();

        console.log('✅ Restauration terminée avec succès !');
        
        // Fermer la connexion
        await mongoose.connection.close();
        console.log('🔌 Connexion MongoDB fermée');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la restauration:', error);
        
        // Mettre à jour le statut en cas d'erreur si possible
        if (mongoose.connection.readyState === 1) {
            try {
                const failedBackup = await Backup.findOne({ 
                    path: path.join(__dirname, '../../backups', backupName),
                    type: 'restore',
                    status: 'in_progress'
                });
                
                if (failedBackup) {
                    failedBackup.status = 'failed';
                    failedBackup.error = error.message;
                    await failedBackup.save();
                }
            } catch (dbError) {
                console.error('❌ Erreur lors de la mise à jour du statut:', dbError);
            }
            
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

// Lancement de la restauration
async function main() {
    try {
        const backups = await listBackups();
        
        if (backups.length === 0) {
            console.log('❌ Aucune sauvegarde trouvée');
            process.exit(1);
        }

        // Si un backup est spécifié en argument
        const backupArg = process.argv[2];
        if (backupArg) {
            if (backups.includes(backupArg)) {
                await restoreBackup(backupArg);
            } else {
                console.error(`❌ Le backup ${backupArg} n'existe pas`);
                process.exit(1);
            }
        } else {
            // Utiliser le backup le plus récent
            const latestBackup = backups[backups.length - 1];
            console.log(`\n🔄 Utilisation du backup le plus récent : ${latestBackup}`);
            await restoreBackup(latestBackup);
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

main();
