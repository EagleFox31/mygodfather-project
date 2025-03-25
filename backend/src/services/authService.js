const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');

class AuthService {
    async register(userData) {
        try {
            console.log('📝 Tentative d\'inscription:', { email: userData.email });
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log('❌ Email déjà utilisé:', userData.email);
                throw new Error('Cet email est déjà utilisé');
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = new User({
                ...userData,
                password: hashedPassword,
                passwordVisible: userData.password
            });

            await user.save();
            console.log('✅ Utilisateur créé avec succès:', user._id);

            const { accessToken, refreshToken } = await this.generateTokens(user);
            console.log('🔑 Tokens générés pour l\'utilisateur:', user._id);

            await user.updateLastLogin();
            console.log('� Dernière connexion mise à jour:', user._id);

            return {
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken
            };
        } catch (error) {
            console.error('❌ Erreur lors de l\'inscription:', error.message);
            throw error;
        }
    }

    async login(email, password, deviceInfo = {}) {
        try {
            console.log('� Tentative de connexion:', { email });
            const user = await User.findOne({ email });
            if (!user) {
                console.log('❌ Utilisateur non trouvé:', email);
                throw new Error('Email ou mot de passe incorrect');
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                console.log('❌ Mot de passe incorrect pour:', email);
                throw new Error('Email ou mot de passe incorrect');
            }

            const { accessToken, refreshToken } = await this.generateTokens(user, deviceInfo);
            console.log('🔑 Tokens générés pour la connexion:', user._id);

            await user.updateLastLogin();
            console.log('🕒 Dernière connexion mise à jour:', user._id);

            return {
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken
            };
        } catch (error) {
            console.error('❌ Erreur lors de la connexion:', error.message);
            throw error;
        }
    }

    async logout() {
        try {
            console.log('👋 Tentative de déconnexion');
            await axios.post(`${API_URL}/logout`);
            localStorage.removeItem('accessToken');
            delete axios.defaults.headers.common['Authorization'];
            console.log('✅ Déconnexion réussie');
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        }
    }

    async refreshToken(refreshToken, deviceInfo = {}) {
        try {
            console.log("🔍 Refresh token reçu:", refreshToken);
            const decoded = jwtConfig.verify(refreshToken);
            console.log("✅ Token décodé:", decoded);
            const user = await User.findById(decoded.userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            try {
                const tokens = await this.generateTokens(user, deviceInfo);
                await user.updateLastActive();
                return tokens;
            } catch (error) {
                throw error;
            }
        } catch (error) {
            console.error("❌ Erreur lors du rafraîchissement du token:", error.message);
            if (error.message === 'Utilisateur non trouvé' ||
                error.message === 'Token generation failed' ||
                error.message === 'Database error') {
                throw error;
            }
            throw new Error('Invalid refresh token');
        }
    }

    async generateTokens(user, deviceInfo = {}) {
        try {
            const payload = {
                userId: user._id,
                email: user.email,
                role: user.role
            };

            const accessToken = jwtConfig.sign(payload, jwtConfig.options.access);
            const refreshToken = jwtConfig.sign({ userId: user._id }, jwtConfig.options.refresh);

            await this.storeRefreshToken(user._id, refreshToken, deviceInfo);

            return {
                accessToken,
                refreshToken
            };
        } catch (error) {
            if (error.message === 'Database error') {
                throw error;
            }
            throw new Error('Token generation failed');
        }
    }

    async storeRefreshToken(userId, token, deviceInfo) {
        await this.cleanupExpiredTokens(userId);
        await User.findByIdAndUpdate(userId, {
            $push: {
                refresh_tokens: {
                    token: token,
                    device_info: deviceInfo,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            }
        });
    }

    async revokeRefreshToken(token) {
        await User.updateOne(
            { 'refresh_tokens.token': token },
            { $pull: { refresh_tokens: { token: token } } }
        );
    }

    async revokeAllUserTokens(userId) {
        await User.findByIdAndUpdate(userId, {
            $set: { refresh_tokens: [] }
        });
    }

    async getUserStatus(userId) {
        try {
            const user = await User.findById(userId)
                .select('-password -passwordVisible -refresh_tokens');

            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            console.log('📊 Status utilisateur récupéré:', {
                userId: user._id,
                email: user.email,
                role: user.role,
                lastActive: user.last_active,
                lastLogin: user.last_login
            });

            return {
                ...this.sanitizeUser(user),
                isAuthenticated: true,
                hasCompletedOnboarding: user.hasCompletedOnboarding,
                isActive: true,
                lastLogin: user.last_login,
                lastActive: user.last_active,
                securityStatus: {
                    twoFactorEnabled: user.security_settings?.two_factor_enabled || false,
                    failedLoginAttempts: user.security_settings?.failed_login_attempts || 0,
                    accountLocked: user.security_settings?.account_locked_until ?
                        new Date() < user.security_settings.account_locked_until : false
                }
            };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération du status:', error);
            throw error;
        }
    }

    sanitizeUser(user) {
        const { password, passwordVisible, refresh_tokens, ...userWithoutSensitive } = user.toObject();
        return userWithoutSensitive;
    }

    async cleanupExpiredTokens(userId) {
        const now = new Date();
        await User.updateOne(
            { _id: userId },
            {
                $pull: {
                    refresh_tokens: {
                        expires_at: { $lt: now }
                    }
                }
            }
        );
    }

    async initiatePasswordReset(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return {
                    message: 'Si cette adresse email existe, vous recevrez les instructions de réinitialisation'
                };
            }

            const resetToken = jwtConfig.sign(
                { userId: user._id, email: user.email },
                { expiresIn: '1h' }
            );

            return {
                message: 'Réinitialisation du mot de passe initiée.',
                resetToken
            };
        } catch (error) {
            throw error;
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const decoded = jwtConfig.verify(token);
            const user = await User.findById(decoded.userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            user.password = await bcrypt.hash(newPassword, 10);
            user.passwordVisible = newPassword;
            await user.save();
            return { message: 'Mot de passe réinitialisé avec succès' };
        } catch (error) {
            throw error;
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            throw new Error('Le mot de passe actuel est incorrect');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordVisible = newPassword;
        await user.save();
    }
}

module.exports = new AuthService();
