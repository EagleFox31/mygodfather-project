const mongoose = require('mongoose');

const MentorMenteePairSchema = new mongoose.Schema({
    mentor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'rejected', 'inactive'],
        default: 'pending'
    },
    validated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    validated_at: {
        type: Date
    },
    rejected_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejection_reason: {
        type: String
    },
    feedback: [{
        given_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comment: String,
        created_at: {
            type: Date,
            default: Date.now
        }
    }],
    start_date: {
        type: Date,
        default: Date.now
    },
    end_date: {
        type: Date
    },
    end_reason: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Index pour améliorer les performances des requêtes
MentorMenteePairSchema.index({ mentor_id: 1, status: 1 });
MentorMenteePairSchema.index({ mentee_id: 1, status: 1 });
MentorMenteePairSchema.index({ status: 1, created_at: -1 });

// Middleware pour vérifier qu'un mentor n'a pas plus de 3 mentorés actifs
MentorMenteePairSchema.pre('save', async function (next) {
    if (this.isNew || (this.isModified('status') && this.status === 'active')) {
        const activePairsCount = await this.constructor.countDocuments({
            mentor_id: this.mentor_id,
            status: 'active',
            _id: { $ne: this._id }
        });

        if (activePairsCount >= 3) {
            throw new Error('Un mentor ne peut pas avoir plus de 3 mentorés actifs');
        }
    }
    next();
});

// Méthode pour ajouter un feedback
MentorMenteePairSchema.methods.addFeedback = async function (userId, rating, comment) {
    if (!this.feedback) {
        this.feedback = [];
    }

    // Vérifier si l'utilisateur est le mentor ou le mentoré
    if (!this.mentor_id.equals(userId) && !this.mentee_id.equals(userId)) {
        throw new Error('Seuls le mentor et le mentoré peuvent donner un feedback');
    }

    // Vérifier si l'utilisateur a déjà donné un feedback dans les dernières 24h
    const recentFeedback = this.feedback.find(f =>
        f.given_by.equals(userId) &&
        new Date(f.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    if (recentFeedback) {
        throw new Error('Vous ne pouvez donner qu\'un feedback toutes les 24 heures');
    }

    this.feedback.push({
        given_by: userId,
        rating,
        comment,
        created_at: new Date()
    });

    await this.save();
    return this;
};

// Méthode pour calculer la note moyenne
MentorMenteePairSchema.methods.getAverageRating = function () {
    if (!this.feedback || this.feedback.length === 0) {
        return null;
    }

    const sum = this.feedback.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / this.feedback.length).toFixed(1);
};

module.exports = mongoose.model('MentorMenteePair', MentorMenteePairSchema);