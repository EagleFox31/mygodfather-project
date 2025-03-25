const { matchMentorMentee } = require('../utils/matchingAlgorithmEnhancedFinal');

exports.validateMatches = (req, res) => {
    try {
        const { mentors, mentees } = req.body;

        // Validation des données
        if (!Array.isArray(mentors) || !Array.isArray(mentees)) {
            return res.status(400).json({
                error: 'Les données des mentors et mentorés doivent être des tableaux'
            });
        }

        // Appliquer l'algorithme de matching
        const matches = matchMentorMentee(mentors, mentees);

        // Retourner les résultats
        res.json({
            message: 'Matching effectué avec succès',
            totalMatches: matches.length,
            matches: matches
        });

    } catch (error) {
        console.error('Erreur lors du matching:', error);
        res.status(500).json({
            error: 'Erreur lors du matching',
            details: error.message
        });
    }
};
