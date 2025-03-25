const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingManagementController');
const { isAdminOrHR } = require('../middleware/roleAuth');
const { 
    recommendationsValidation, 
    confirmMatchValidation 
} = require('../middleware/matchingValidations');

/**
 * @route POST /matching/run
 * @description Lancer l'algorithme de matching sur tous les mentorés non appariés
 * @access Admin, RH
 */
router.post('/run', isAdminOrHR, matchingController.runMatching);

/**
 * @route GET /matching/recommendations
 * @description Voir les suggestions de mentors pour un mentoré spécifique
 * @access Admin, RH
 */
router.get('/recommendations', recommendationsValidation, isAdminOrHR, matchingController.getRecommendations);

/**
 * @route POST /matching/confirm
 * @description Confirmer une association mentor-mentoré suggérée
 * @access Admin, RH
 */
router.post('/confirm', confirmMatchValidation, isAdminOrHR, matchingController.confirmAssociation);

/**
 * @route GET /matching/stats
 * @description Récupérer les statistiques du matching
 * @access Admin, RH
 */
router.get('/stats', isAdminOrHR, matchingController.getStats);

module.exports = router;