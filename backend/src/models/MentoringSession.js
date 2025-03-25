const mongoose = require('mongoose');
const Notification = require('./Notification');
const MentorMenteePair = require('./MentorMenteePair');

const MentoringSessionSchema = new mongoose.Schema({
    pair_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MentorMenteePair',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true // Durée en minutes
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date,
        default: null
    }
});

// Middleware pour exclure les documents supprimés par défaut
MentoringSessionSchema.pre('find', function () {
    this.where({ deletedAt: null });
});

MentoringSessionSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});

// Middleware pour générer des notifications après la création d'une session
MentoringSessionSchema.post('save', async function (doc) {
    try {
        // Récupérer les informations de la paire mentor-mentoré
        const pair = await MentorMenteePair.findById(doc.pair_id).populate('mentor_id mentee_id');

        if (pair) {
            // Notification pour le mentor
            await new Notification({
                user_id: pair.mentor_id._id,
                title: 'Nouvelle session de mentorat',
                message: `Une nouvelle session a été programmée avec ${pair.mentee_id.prenom} ${pair.mentee_id.name} pour le ${new Date(doc.date).toLocaleString()}`,
                type: 'info',
                category: 'session'
            }).save();

            // Notification pour le mentoré
            await new Notification({
                user_id: pair.mentee_id._id,
                title: 'Nouvelle session de mentorat',
                message: `Une nouvelle session a été programmée avec ${pair.mentor_id.prenom} ${pair.mentor_id.name} pour le ${new Date(doc.date).toLocaleString()}`,
                type: 'info',
                category: 'session'
            }).save();
        }
    } catch (error) {
        console.error('Erreur lors de la création des notifications:', error);
    }
});

// Middleware pour générer des notifications lors du changement de statut
MentoringSessionSchema.pre('findOneAndUpdate', async function () {
    const update = this.getUpdate();
    if (update.status) {
        const session = await this.model.findOne(this.getQuery());
        const pair = await MentorMenteePair.findById(session.pair_id).populate('mentor_id mentee_id');

        if (pair) {
            const statusMessages = {
                completed: 'La session a été marquée comme terminée',
                cancelled: 'La session a été annulée'
            };

            if (statusMessages[update.status]) {
                // Notification pour le mentor
                await new Notification({
                    user_id: pair.mentor_id._id,
                    title: 'Mise à jour de la session',
                    message: `${statusMessages[update.status]} (${new Date(session.date).toLocaleString()})`,
                    type: update.status === 'completed' ? 'success' : 'warning',
                    category: 'session'
                }).save();

                // Notification pour le mentoré
                await new Notification({
                    user_id: pair.mentee_id._id,
                    title: 'Mise à jour de la session',
                    message: `${statusMessages[update.status]} (${new Date(session.date).toLocaleString()})`,
                    type: update.status === 'completed' ? 'success' : 'warning',
                    category: 'session'
                }).save();
            }
        }
    }
});

module.exports = mongoose.model('MentoringSession', MentoringSessionSchema);