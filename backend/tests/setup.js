// Configuration de l'environnement de test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-123456';
process.env.PORT = 3001;

// Mock de console.log pour les tests
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

// Helper pour créer un mock de response Express
global.mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
};

// Helper pour créer un mock de request Express
global.mockRequest = (overrides = {}) => ({
    body: {},
    cookies: {},
    headers: {},
    params: {},
    query: {},
    ...overrides
});

// Mock de mongoose avec support complet du Schema
jest.mock('mongoose', () => {
    const mockSchema = function(definition) {
        this.definition = definition;
        this.pre = jest.fn();
        this.post = jest.fn();
        this.methods = {};
        this.statics = {};
        this.index = jest.fn();
    };
    mockSchema.Types = {
        ObjectId: jest.fn(id => id)
    };
    mockSchema.prototype.pre = function() { return this; };
    mockSchema.prototype.post = function() { return this; };
    mockSchema.prototype.index = function() { return this; };

    return {
        connect: jest.fn(),
        connection: {
            close: jest.fn()
        },
        Schema: mockSchema,
        model: jest.fn().mockReturnValue({
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn()
        }),
        Types: {
            ObjectId: jest.fn(id => id),
            String: String,
            Number: Number,
            Boolean: Boolean,
            Date: Date
        }
    };
});

// Nettoyage des mocks après chaque test
jest.mock('jsonwebtoken');
beforeEach(() => {
    jest.clearAllMocks();
});

// Nettoyage global après tous les tests
beforeAll(() => {
    jest.clearAllMocks();
});
