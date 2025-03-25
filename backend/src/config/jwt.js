const config = require('./config');

// Configuration JWT centralisée
const jwtConfig = {
    secret: config.jwt.secret,
    options: {
        access: {
            expiresIn: '15m'  // 15 minutes
        },
        refresh: {
            expiresIn: '7d'   // 7 jours
        }
    },
    verify: function(token) {
        const jwt = require('jsonwebtoken');
        const timestamp = new Date().toISOString();
        
        console.log(`🕒 [${timestamp}] 🔐 Starting token verification`, {
            tokenLength: token.length,
            secretLength: this.secret.length,
            secretPreview: `${this.secret.substring(0, 10)}...`,
            tokenPreview: `${token.substring(0, 20)}...`
        });
        
        try {
            const decoded = jwt.verify(token, this.secret);
            console.log(`🕒 [${timestamp}] ✅ Token successfully verified`, {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                issuedAt: new Date(decoded.iat * 1000).toISOString(),
                expiresAt: new Date(decoded.exp * 1000).toISOString(),
                timeRemaining: `${Math.round((decoded.exp * 1000 - Date.now()) / 1000)}s`
            });
            return decoded;
        } catch (error) {
            console.error(`🕒 [${timestamp}] ❌ Token verification failed`, {
                errorType: error.name,
                message: error.message,
                tokenPreview: `${token.substring(0, 20)}...`,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
            throw error;
        }
    },
    sign: function(payload, options = {}) {
        const jwt = require('jsonwebtoken');
        const timestamp = new Date().toISOString();
        
        console.log(`🕒 [${timestamp}] 🔑 Generating token for:`, {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            expiresIn: options.expiresIn || 'default'
        });
        
        const token = jwt.sign(payload, this.secret, options);
        console.log(`🕒 [${timestamp}] ✨ Token generated successfully`, {
            tokenPreview: `${token.substring(0, 20)}...`,
            length: token.length
        });
        return token;
    }
};

module.exports = jwtConfig;
