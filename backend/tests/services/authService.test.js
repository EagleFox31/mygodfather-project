const bcrypt = require('bcryptjs');
const authService = require('../../src/services/authService');
const User = require('../../src/models/User');
const jwtConfig = require('../../src/config/jwt');
const createError = require('http-errors');

// Mock des dépendances
jest.mock('bcryptjs');
jest.mock('../../src/config/jwt');

// Mock User methods
const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'mentor',
    last_login: new Date(),
    last_active: new Date(),
    security_settings: {
        two_factor_enabled: false,
        failed_login_attempts: 0,
        account_locked_until: null
    },
    refresh_tokens: [],
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 'mentor',
        last_login: new Date(),
        last_active: new Date(),
        security_settings: {
            two_factor_enabled: false,
            failed_login_attempts: 0,
            account_locked_until: null
        }
    }),
    updateLastLogin: jest.fn().mockResolvedValue(true),
    updateLastActive: jest.fn().mockResolvedValue(true)
};

// Mock User model methods
User.findOne = jest.fn();
User.findById = jest.fn();
User.findByIdAndUpdate = jest.fn();
User.updateOne = jest.fn();

describe('AuthService', () => {
    let mockAccessToken, mockRefreshToken;

    beforeEach(() => {
        jest.clearAllMocks();

        mockAccessToken = 'mock.access.token';
        mockRefreshToken = 'mock.refresh.token';

        jwtConfig.sign
            .mockReturnValueOnce(mockAccessToken)
            .mockReturnValueOnce(mockRefreshToken);
    });

    describe('login', () => {
        it('should login successfully with correct credentials', async () => {
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            const result = await authService.login(mockUser.email, 'Password123!');

            expect(result).toHaveProperty('accessToken', mockAccessToken);
            expect(result).toHaveProperty('refreshToken', mockRefreshToken);
            expect(User.findOne).toHaveBeenCalledWith({ email: mockUser.email });
            expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', mockUser.password);
            expect(jwtConfig.sign).toHaveBeenCalledWith(
                { userId: mockUser._id, email: mockUser.email, role: mockUser.role },
                expect.any(Object)
            );
            expect(mockUser.updateLastLogin).toHaveBeenCalled();
        });

        it('should throw error with incorrect password', async () => {
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(authService.login(mockUser.email, 'WrongPassword123!'))
                .rejects.toThrow('Email ou mot de passe incorrect');
        });

        it('should throw error if user not found', async () => {
            User.findOne.mockResolvedValue(null);

            await expect(authService.login('unknown@example.com', 'Password123!'))
                .rejects.toThrow('Email ou mot de passe incorrect');
        });
    });

    describe('getUserStatus', () => {
        it('should return user status for valid user', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const result = await authService.getUserStatus(mockUser._id);

            expect(result).toHaveProperty('email', mockUser.email);
            expect(result).toHaveProperty('isActive', true);
            expect(User.findById).toHaveBeenCalledWith(mockUser._id);
        });

        it('should throw error if user not found', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(authService.getUserStatus(mockUser._id))
                .rejects.toThrow('Utilisateur non trouvé');
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const newPassword = 'NewPassword123!';
            const hashedNewPassword = 'hashedNewPassword123';

            User.findById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue(hashedNewPassword);

            await authService.changePassword(mockUser._id, 'OldPassword123!', newPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith('OldPassword123!', 'hashedPassword123');
            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(mockUser.password).toBe(hashedNewPassword);
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should throw error if current password is incorrect', async () => {
            User.findById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(authService.changePassword(mockUser._id, 'WrongPassword', 'NewPassword123!'))
                .rejects.toThrow('Le mot de passe actuel est incorrect');
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            const refreshToken = 'valid.refresh.token';
            const decoded = { userId: mockUser._id };

            jwtConfig.verify.mockReturnValue(decoded);
            User.findById.mockResolvedValue(mockUser);

            const result = await authService.refreshToken(refreshToken);

            expect(result).toHaveProperty('accessToken', mockAccessToken);
            expect(result).toHaveProperty('refreshToken', mockRefreshToken);
            expect(jwtConfig.verify).toHaveBeenCalledWith(refreshToken);
            expect(User.findById).toHaveBeenCalledWith(decoded.userId);
            expect(mockUser.updateLastActive).toHaveBeenCalled();
        });

        it('should throw error if refresh token is invalid', async () => {
            jwtConfig.verify.mockImplementation(() => {
                throw new Error('Invalid refresh token');
            });

            await expect(authService.refreshToken('invalid.refresh.token'))
                .rejects.toThrow('Invalid refresh token');
        });

        it('should throw error if user from refresh token does not exist', async () => {
            const refreshToken = 'valid.refresh.token';
            jwtConfig.verify.mockReturnValue({ userId: '507f1f77bcf86cd799439012' });
            User.findById.mockResolvedValue(null);

            await expect(authService.refreshToken(refreshToken))
                .rejects.toThrow('Utilisateur non trouvé');
        });

        it('should throw error if refresh token is expired', async () => {
            jwtConfig.verify.mockImplementation(() => {
                throw new Error('jwt expired');
            });

            await expect(authService.refreshToken('expired.refresh.token'))
                .rejects.toThrow('Invalid refresh token');
        });

        it('should throw error if refresh token has invalid signature', async () => {
            jwtConfig.verify.mockImplementation(() => {
                throw new Error('invalid signature');
            });

            await expect(authService.refreshToken('invalid.signature.token'))
                .rejects.toThrow('Invalid refresh token');
        });

        it('should throw error if refresh token is malformed', async () => {
            jwtConfig.verify.mockImplementation(() => {
                throw new Error('jwt malformed');
            });

            await expect(authService.refreshToken('malformed.token'))
                .rejects.toThrow('Invalid refresh token');
        });

        it('should throw error if user update fails', async () => {
            const refreshToken = 'valid.refresh.token';
            const decoded = { userId: mockUser._id };

            jwtConfig.verify.mockReturnValue(decoded);
            User.findById.mockResolvedValue(mockUser);
            mockUser.updateLastActive.mockRejectedValue(new Error('Database error'));
            mockUser.save.mockRejectedValue(new Error('Database error'));

            await expect(authService.refreshToken(refreshToken))
                .rejects.toThrow('Database error');
        });
    });

    describe('revokeRefreshToken', () => {
        it('should successfully revoke a refresh token', async () => {
            const token = 'token.to.revoke';
            User.updateOne.mockResolvedValue({ modifiedCount: 1 });

            await authService.revokeRefreshToken(token);

            expect(User.updateOne).toHaveBeenCalledWith(
                { 'refresh_tokens.token': token },
                { $pull: { refresh_tokens: { token: token } } }
            );
        });

        it('should handle case when token is not found', async () => {
            const token = 'non.existent.token';
            User.updateOne.mockResolvedValue({ modifiedCount: 0 });

            await authService.revokeRefreshToken(token);

            expect(User.updateOne).toHaveBeenCalledWith(
                { 'refresh_tokens.token': token },
                { $pull: { refresh_tokens: { token: token } } }
            );
        });

        it('should handle database errors during token revocation', async () => {
            const token = 'token.to.revoke';
            User.updateOne.mockRejectedValue(new Error('Database error'));

            await expect(authService.revokeRefreshToken(token))
                .rejects.toThrow('Database error');
        });
    });

    describe('revokeAllUserTokens', () => {
        it('should successfully revoke all user tokens', async () => {
            const userId = mockUser._id;
            User.findByIdAndUpdate.mockResolvedValue({ modifiedCount: 1 });

            await authService.revokeAllUserTokens(userId);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { $set: { refresh_tokens: [] } }
            );
        });

        it('should handle case when user is not found', async () => {
            const userId = 'non.existent.user';
            User.findByIdAndUpdate.mockResolvedValue(null);

            await authService.revokeAllUserTokens(userId);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { $set: { refresh_tokens: [] } }
            );
        });

        it('should handle database errors during token revocation', async () => {
            const userId = mockUser._id;
            User.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

            await expect(authService.revokeAllUserTokens(userId))
                .rejects.toThrow('Database error');
        });
    });

    describe('register', () => {
        const userData = {
            email: 'new@example.com',
            password: 'Password123!',
            role: 'mentor'
        };

        it('should register a new user successfully', async () => {
            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword');
            
            const newUser = {
                ...mockUser,
                ...userData,
                save: jest.fn().mockResolvedValue(true),
                updateLastLogin: jest.fn().mockResolvedValue(true),
                toObject: jest.fn().mockReturnValue({
                    _id: mockUser._id,
                    email: userData.email,
                    role: userData.role
                })
            };
            
            // Mock the User constructor
            const mockConstructor = jest.fn(() => newUser);
            jest.spyOn(User, 'prototype', 'constructor').mockImplementation(mockConstructor);
            global.User = jest.fn(() => newUser);

            const result = await authService.register(userData);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
        });

        it('should throw error if email already exists', async () => {
            User.findOne.mockResolvedValue(mockUser);

            await expect(authService.register(userData))
                .rejects.toThrow('Cet email est déjà utilisé');
        });

        it('should handle database errors during registration', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            await expect(authService.register(userData))
                .rejects.toThrow('Database error');
        });
    });

    describe('generateTokens', () => {
        it('should generate tokens with device info', async () => {
            const deviceInfo = { 
                userAgent: 'Mozilla/5.0',
                ip: '127.0.0.1'
            };

            const result = await authService.generateTokens(mockUser, deviceInfo);

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(jwtConfig.sign).toHaveBeenCalledTimes(2);
            expect(jwtConfig.sign).toHaveBeenCalledWith(
                expect.objectContaining({ userId: mockUser._id }),
                expect.any(Object)
            );
        });

        it('should handle token generation errors', async () => {
            jwtConfig.sign.mockImplementationOnce(() => {
                throw new Error('Token generation failed');
            });

            await expect(authService.generateTokens(mockUser))
                .rejects.toThrow('Token generation failed');
        });

        it('should handle database errors during token storage', async () => {
            User.findByIdAndUpdate.mockRejectedValueOnce(new Error('Database error'));

            await expect(authService.generateTokens(mockUser))
                .rejects.toThrow('Database error');
        });

        it('should handle expired token cleanup errors', async () => {
            User.updateOne.mockRejectedValueOnce(new Error('Database error'));

            await expect(authService.generateTokens(mockUser))
                .rejects.toThrow('Database error');
        });
    });

    describe('initiatePasswordReset', () => {
        it('should initiate password reset for existing user', async () => {
            User.findOne.mockResolvedValue(mockUser);

            const result = await authService.initiatePasswordReset(mockUser.email);

            expect(result).toHaveProperty('message', 'Réinitialisation du mot de passe initiée.');
            expect(result).toHaveProperty('resetToken');
            expect(jwtConfig.sign).toHaveBeenCalledWith(
                { userId: mockUser._id, email: mockUser.email },
                { expiresIn: '1h' }
            );
        });

        it('should return generic message for non-existent user', async () => {
            User.findOne.mockResolvedValue(null);

            const result = await authService.initiatePasswordReset('nonexistent@example.com');

            expect(result).toHaveProperty(
                'message',
                'Si cette adresse email existe, vous recevrez les instructions de réinitialisation'
            );
        });

        it('should handle database errors', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            await expect(authService.initiatePasswordReset(mockUser.email))
                .rejects.toThrow('Database error');
        });
    });

    describe('resetPassword', () => {
        const newPassword = 'NewPassword123!';
        const resetToken = 'valid.reset.token';

        it('should reset password successfully', async () => {
            const decoded = { userId: mockUser._id };
            jwtConfig.verify.mockReturnValue(decoded);
            User.findById.mockResolvedValue(mockUser);
            bcrypt.hash.mockResolvedValue('newHashedPassword');

            const result = await authService.resetPassword(resetToken, newPassword);

            expect(result).toHaveProperty('message', 'Mot de passe réinitialisé avec succès');
            expect(mockUser.password).toBe('newHashedPassword');
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should throw error for invalid reset token', async () => {
            jwtConfig.verify.mockImplementation(() => {
                throw new Error('invalid token');
            });

            await expect(authService.resetPassword('invalid.token', newPassword))
                .rejects.toThrow('invalid token');
        });

        it('should throw error if user not found', async () => {
            jwtConfig.verify.mockReturnValue({ userId: 'nonexistent' });
            User.findById.mockResolvedValue(null);

            await expect(authService.resetPassword(resetToken, newPassword))
                .rejects.toThrow('Utilisateur non trouvé');
        });

        it('should handle password hashing errors', async () => {
            const decoded = { userId: mockUser._id };
            jwtConfig.verify.mockReturnValue(decoded);
            User.findById.mockResolvedValue(mockUser);
            bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

            await expect(authService.resetPassword(resetToken, newPassword))
                .rejects.toThrow('Hashing failed');
        });
    });

    describe('cleanupExpiredTokens', () => {
        it('should remove expired tokens successfully', async () => {
            const userId = mockUser._id;
            User.updateOne.mockResolvedValue({ modifiedCount: 1 });

            await authService.cleanupExpiredTokens(userId);

            expect(User.updateOne).toHaveBeenCalledWith(
                { _id: userId },
                {
                    $pull: {
                        refresh_tokens: {
                            expires_at: { $lt: expect.any(Date) }
                        }
                    }
                }
            );
        });

        it('should handle database errors during cleanup', async () => {
            const userId = mockUser._id;
            User.updateOne.mockRejectedValue(new Error('Database error'));

            await expect(authService.cleanupExpiredTokens(userId))
                .rejects.toThrow('Database error');
        });
    });
});
