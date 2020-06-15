module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },

  "moduleNameMapper": {
    "\\.(css|scss)$": "<rootDir>/src/tests/styleMock.js"
  }
}