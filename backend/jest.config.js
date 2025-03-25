require('dotenv').config();

module.exports = {
    rootDir: '.',
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
    coverageReporters: ['text', 'lcov', 'clover'],
    testPathIgnorePatterns: ['/node_modules/'],
    testTimeout: 10000,
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'test-results',
                outputName: 'junit.xml',
                classNameTemplate: '{classname}',
                titleTemplate: '{title}',
                ancestorSeparator: ' › ',
                usePathForSuiteName: true
            }
        ]
    ],
    globals: {
        NODE_ENV: 'test'
    }
};
