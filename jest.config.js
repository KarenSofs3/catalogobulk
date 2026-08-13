export default {
    testEnvironment: 'node',
    transform: {},
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js'
    ],
    testMatch: [
        '**/src/__tests__/**/*.test.js'
    ],
    verbose: true,
    detectOpenHandles: true
};
