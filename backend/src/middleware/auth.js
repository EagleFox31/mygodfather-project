const createError = require('http-errors');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');

/**
 * Middleware d'authentification JWT
 */
const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Token manquant dans la requête');
            throw createError(401, 'Token d\'authentification manquant');
        }

        const token = authHeader.split(' ')[1];
        console.log('\n🔍 Vérification du token...');
        console.log('Token reçu:', token);

        try {
            // Utiliser la configuration JWT centralisée
            const decoded = jwtConfig.verify(token);

            const user = await User.findOne({ 
                _id: decoded.userId,
                deletedAt: null
            }).select('-password');

            if (!user) {
                console.log('❌ Utilisateur non trouvé pour le token');
                throw createError(401, 'Utilisateur non trouvé ou désactivé');
            }

            // Vérifier si le token a été émis avant le dernier changement de mot de passe
            if (user.security_settings?.password_last_changed && 
                decoded.iat < user.security_settings.password_last_changed.getTime() / 1000) {
                console.log('❌ Token émis avant le dernier changement de mot de passe');
                throw createError(401, 'Le mot de passe a été changé, veuillez vous reconnecter');
            }

            // Vérifier si le compte est verrouillé
            if (user.security_settings?.account_locked_until && 
                new Date() < user.security_settings.account_locked_until) {
                console.log('❌ Compte verrouillé jusqu\'à:', 
                    user.security_settings.account_locked_until.toLocaleString());
                throw createError(403, 'Compte temporairement verrouillé');
            }

            req.user = user;
            user.last_active = new Date();
            await user.save({ validateBeforeSave: false });

            console.log('✅ Authentification réussie pour:', user.email);
            next();
        } catch (err) {
            if (err.name === 'JsonWebTokenError') {
                console.log('❌ Token invalide:', err.message);
                throw createError(401, 'Token invalide');
            }
            if (err.name === 'TokenExpiredError') {
                console.log('❌ Token expiré le:', err.expiredAt.toLocaleString());
                throw createError(401, 'Token expiré');
            }
            throw err;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware d'authentification optionnelle
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        console.log('🔍 Token optionnel reçu:', token);

        try {
            const decoded = jwtConfig.verify(token);
            const user = await User.findOne({ 
                _id: decoded.userId,
                deletedAt: null
            }).select('-password');

            if (user) {
                console.log('✅ Authentification optionnelle réussie pour:', user.email);
                req.user = user;
                user.last_active = new Date();
                await user.save({ validateBeforeSave: false });
            }
        } catch (err) {
            console.log('⚠️ Token optionnel invalide:', err.message);
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware de vérification des rôles
 */
const roleAuth = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            console.log('❌ Tentative d\'accès sans authentification');
            return next(createError(401, 'Non authentifié'));
        }

        if (roles.length && !roles.includes(req.user.role)) {
            console.log('❌ Accès refusé pour le rôle:', req.user.role);
            console.log('Rôles autorisés:', roles.join(', '));
            return next(
                createError(403, `Accès refusé. Rôle requis : ${roles.join(', ')}`)
            );
        }

        console.log('✅ Vérification des rôles réussie pour:', req.user.email);
        next();
    };
};

module.exports = {
    auth,
    optionalAuth,
    roleAuth
};
