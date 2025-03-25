const express = require('express');
const router = express.Router();
const matchingValidationController = require('../controllers/matchingValidationController');

/**
 * @route POST /api/matching/validate
 * @description Valide les correspondances entre mentors et mentorés
 * @body {Array} mentors - Liste des mentors potentiels
 * @body {Array} mentees - Liste des mentorés à matcher
 * @returns {Object} Résultats du matching
 */
router.post('/validate', matchingValidationController.validateMatches);

module.exports = router;
