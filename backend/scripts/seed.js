#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// 🎯 Chemin vers le script de seeding
const seedScript = path.join(__dirname, '../src/migrations/seed.js');

console.log('🌱 Démarrage du seeding...');

// 🚀 Exécution du script de seeding
const seed = spawn('node', [seedScript], {
    stdio: 'inherit'
});

// ✅ Gestion de la fin du processus
seed.on('close', (code) => {
    if (code === 0) {
        console.log('✨ Seeding terminé avec succès !');
    } else {
        console.error(`❌ Erreur lors du seeding (code: ${code})`);
        process.exit(1);
    }
});

// ❌ Gestion des erreurs
seed.on('error', (err) => {
    console.error('❌ Erreur lors du lancement du script :', err);
    process.exit(1);
});

// 🛑 Gestion de l'interruption
process.on('SIGINT', () => {
    console.log('\n🛑 Interruption du seeding...');
    seed.kill();
    process.exit();
});
