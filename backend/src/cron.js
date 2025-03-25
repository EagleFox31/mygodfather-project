// backend/src/cron.js
const cron = require('node-cron');
const statisticsService = require('./services/statisticsService');

// Tâche planifiée à 00h05 chaque jour
cron.schedule('5 0 * * *', async () => {
    try {
        await statisticsService.snapshotDailyStats();
        console.log('Daily stats snapshot done!');
    } catch (error) {
        console.error('Error in daily stats snapshot:', error);
    }
});
