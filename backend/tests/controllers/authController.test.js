const authController = require('../../src/controllers/authController');
const authService = require('../../src/services/authService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');

// Mock des dépendances
jest.mock('../../src/services/authService');
jest.mock('express-validator');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
    let mockReq, mockRes, nextFunction;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {},
            cookies: {},
            headers: {
                'user-agent': 'test-agent',
                'sec-ch-ua-platform': 'Windows'
            },
            ip: '127.0.0.1',
            user: null
        };

        mockRes = {
            json: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn(),
            status: jest.fn(() => mockRes)
        };

        nextFunction = jest.fn();

        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });
    });

    describe('login', () => {
        let mockLoginData, mockLoginResponse;

        beforeEach(() => {
            mockLoginData = {
                email: 'test@example.com',
                password: 'Password123!'
            };

            mockLoginResponse = {
                user: {
                    id: 'user123',
                    email: 'test@example.com',
                    role: 'mentor'
                },
                accessToken: 'access.token.123',
                refreshToken: 'refresh.token.123'
            };

            // Mock jwt.decode
            jest.spyOn(jwt, 'decode').mockReturnValue({
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 900 // 15 minutes
            });
        });

        it('should login successfully with valid credentials', async () => {
            mockReq.body = mockLoginData;
            authService.login.mockResolvedValue(mockLoginResponse);

            await authController.login(mockReq, mockRes, nextFunction);

            expect(authService.login).toHaveBeenCalledWith(
                mockLoginData.email,
                mockLoginData.password,
                expect.any(Object)
            );
            expect(mockRes.cookie).toHaveBeenCalledWith(
                'refreshToken',
                mockLoginResponse.refreshToken,
                expect.any(Object)
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    user: mockLoginResponse.user,
                    accessToken: mockLoginResponse.accessToken,
                    tokenInfo: expect.any(Object)
                }
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should handle validation errors', async () => {
            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [{ msg: 'Email invalide' }]
            });

            await authController.login(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 400,
                    message: 'Données de connexion invalides'
                })
            );
            expect(authService.login).not.toHaveBeenCalled();
        });

        it('should handle login service errors', async () => {
            mockReq.body = mockLoginData;
            const error = new Error('Email ou mot de passe incorrect');
            authService.login.mockRejectedValue(error);

            await authController.login(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(error);
        });
    });

    describe('checkAuthStatus', () => {
        let mockUser;

        beforeEach(() => {
            mockUser = {
                id: 'user123',
                email: 'test@example.com',
                role: 'mentor'
            };
        });

        it('should return user status when authenticated', async () => {
            mockReq.user = { id: mockUser.id };
            mockReq.headers.authorization = 'Bearer valid.token';
            jwt.decode.mockReturnValue({
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 900
            });
            authService.getUserStatus.mockResolvedValue(mockUser);

            await authController.checkAuthStatus(mockReq, mockRes, nextFunction);

            expect(authService.getUserStatus).toHaveBeenCalledWith(mockUser.id);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    user: mockUser,
                    isAuthenticated: true,
                    tokenInfo: expect.any(Object)
                }
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return an error when no user is authenticated', async () => {
            mockReq.user = null;

            await authController.checkAuthStatus(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Cannot read properties of null')
                })
            );
        });

        it('should handle getUserStatus service errors', async () => {
            mockReq.user = { id: mockUser.id };
            mockReq.headers.authorization = 'Bearer valid.token';
            const error = new Error('Utilisateur non trouvé');
            authService.getUserStatus.mockRejectedValue(error);

            await authController.checkAuthStatus(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(error);
        });
    });

    describe('logout', () => {
        it('should logout successfully', async () => {
            mockReq.cookies.refreshToken = 'refresh.token.123';
            authService.revokeRefreshToken.mockResolvedValue(true);

            await authController.logout(mockReq, mockRes, nextFunction);

            expect(authService.revokeRefreshToken).toHaveBeenCalledWith('refresh.token.123');
            expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Déconnexion réussie'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should handle logout without refresh token', async () => {
            await authController.logout(mockReq, mockRes, nextFunction);

            expect(authService.revokeRefreshToken).not.toHaveBeenCalled();
            expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Déconnexion réussie'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            mockReq.cookies.refreshToken = 'refresh.token.123';
            const newTokens = {
                accessToken: 'new.access.token',
                refreshToken: 'new.refresh.token'
            };
            authService.refreshToken.mockResolvedValue(newTokens);
            jwt.decode.mockReturnValue({
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 900
            });

            await authController.refreshToken(mockReq, mockRes, nextFunction);

            expect(authService.refreshToken).toHaveBeenCalledWith(
                'refresh.token.123',
                expect.any(Object)
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    accessToken: newTokens.accessToken,
                    tokenInfo: expect.any(Object)
                }
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should handle missing refresh token', async () => {
            await authController.refreshToken(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 401,
                    message: 'Token de rafraîchissement manquant'
                })
            );
        });

        it('should handle refresh token service errors', async () => {
            mockReq.cookies.refreshToken = 'refresh.token.123';
            const error = new Error('Token expiré');
            authService.refreshToken.mockRejectedValue(error);

            await authController.refreshToken(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(error);
        });
    });
});
