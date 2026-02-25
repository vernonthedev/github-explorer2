module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js", "!src/index.js"],
  coverageReporters: ["text", "lcov", "html"],
};
