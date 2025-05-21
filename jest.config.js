/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  transform: {},
  modulePathIgnorePatterns: ['_site'],
  testPathIgnorePatterns: ['_site', 'node_modules']
};