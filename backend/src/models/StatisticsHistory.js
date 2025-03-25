// backend/src/models/StatisticsHistory
const mongoose = require('mongoose');

// Modèle pour stocker l’historique quotidien des KPI
const StatisticsHistorySchema = new mongoose.Schema({
    date: { type: Date, required: true, index: true, unique: true },

    // 🔹 Utilisateurs
    users_total: { type: Number, default: 0 },
    mentors_active: { type: Number, default: 0 },
    mentor_availability: { type: Number, default: 0 }, // pourcentage
    mentees_total: { type: Number, default: 0 },

    // 🔹 Matching
    total_matches: { type: Number, default: 0 },
    matching_success_rate: { type: Number, default: 0 }, // pourcentage

    // 🔹 Sessions
    sessions_today: { type: Number, default: 0 },
    sessions_completed: { type: Number, default: 0 },
    session_completion_rate: { type: Number, default: 0 }, // pourcentage

    // 🔹 Messages
    messages_today: { type: Number, default: 0 },

    // 🔹 Feedback
    feedback_avg_score: { type: Number, default: 0 }, // Note moyenne sur 5
    feedback_satisfaction_rate: { type: Number, default: 0 }, // pourcentage

    // 🔹 Alertes
    alerts_count: { type: Number, default: 0 }, // Nombre d'alertes générées ce jour-là

    // 🔹 Champ générique pour des ajouts futurs
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }

}, {
    timestamps: true
});

module.exports = mongoose.model('StatisticsHistory', StatisticsHistorySchema);
