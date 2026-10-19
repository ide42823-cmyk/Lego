/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  moduleNameMapper: {
    // `src/global.css` is a web-only side-effect import with no native
    // equivalent, and Jest has no CSS pipeline.
    '\\.css$': '<rootDir>/jest/style-mock.js',
  },
};
