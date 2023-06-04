import type { Config } from 'jest';

const config: Config = {
    transformIgnorePatterns: ['node_modules/(?!\@?axios)'],
    automock: false,
    preset: "ts-jest",
    setupFiles: ['./setupJest.ts'],
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/tests/mocks/fileMock.ts',
        '\\.(css|less)$': 'identity-obj-proxy',
    },
};

export default config;