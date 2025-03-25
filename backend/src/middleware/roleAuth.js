/**
 * Rôles et leurs permissions
 * admin: accès total
 * rh: accès à la gestion des mentors/mentorés et des paires
 * mentor: accès à son profil, ses mentorés, ses sessions
 * mentee: accès à son profil, son mentor, ses sessions
 */
const ROLES = {
    ADMIN: 'admin',
    RH: 'rh',
    MENTOR: 'mentor',
    MENTEE: 'mentee'
};

// Vérifier si l'utilisateur a un rôle spécifique
const hasRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        if (req.user.role === ROLES.ADMIN) {
            return next(); // Les admins ont accès à tout
        }

        if (req.user.role !== role) {
            return res.status(403).json({
                error: 'Accès non autorisé',
                message: `Seuls les utilisateurs avec le rôle ${role} peuvent accéder à cette ressource`
            });
        }

        next();
    };
};

// Vérifier si l'utilisateur est admin ou RH
const isAdminOrHR = (req, res, next) => {
    if (!req.user || (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.RH)) {
        return res.status(403).json({
            error: 'Accès non autorisé',
            message: 'Cette action nécessite des droits administrateur ou RH'
        });
    }
    next();
};

// Vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({
            error: 'Accès non autorisé',
            message: 'Cette action nécessite des droits administrateur'
        });
    }
    next();
};

// Vérifier si l'utilisateur est RH
const isHR = (req, res, next) => {
    if (!req.user || req.user.role !== ROLES.RH) {
        return res.status(403).json({
            error: 'Accès non autorisé',
            message: 'Cette action nécessite des droits RH'
        });
    }
    next();
};

// Vérifier si l'utilisateur accède à ses propres ressources
const isSelfOrAdminOrHR = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const requestedUserId = parseInt(req.params.id);
    if (req.user.role === ROLES.ADMIN ||
        req.user.role === ROLES.RH ||
        req.user.userId === requestedUserId) {
        return next();
    }

    res.status(403).json({
        error: 'Accès non autorisé',
        message: 'Vous ne pouvez accéder qu\'à vos propres ressources'
    });
};

// Vérifier les permissions pour les paires mentor-mentoré
const canAccessPair = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    // Les admins et RH ont accès à toutes les paires
    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.RH) {
        return next();
    }

    // Vérifier si l'utilisateur fait partie de la paire
    const pairId = parseInt(req.params.id);
    // Note: Vous devrez implémenter la logique pour vérifier si l'utilisateur
    // fait partie de la paire spécifique (mentor ou mentoré)

    next();
};

// Middleware pour les actions spécifiques aux mentors
const mentorOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    if (req.user.role !== ROLES.MENTOR &&
        req.user.role !== ROLES.ADMIN &&
        req.user.role !== ROLES.RH) {
        return res.status(403).json({
            error: 'Accès non autorisé',
            message: 'Cette action est réservée aux mentors'
        });
    }

    next();
};

// Middleware pour les actions spécifiques aux mentorés
const menteeOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    if (req.user.role !== ROLES.MENTEE &&
        req.user.role !== ROLES.ADMIN &&
        req.user.role !== ROLES.RH) {
        return res.status(403).json({
            error: 'Accès non autorisé',
            message: 'Cette action est réservée aux mentorés'
        });
    }

    next();
};

module.exports = {
    ROLES,
    hasRole,
    isAdmin,
    isHR,
    isAdminOrHR,
    isSelfOrAdminOrHR,
    canAccessPair,
    mentorOnly,
    menteeOnly
};