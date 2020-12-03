module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testMatch: ['<rootDir>/packages/**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverageFrom: ['packages/**/src/**/*.ts', '!packages/**/src/__tests__/**'],
  moduleNameMapper: {
    '^alliage-webserver/(.*)$': '<rootDir>/packages/webserver/src/$1',
    '^alliage-webserver-express/(.*)$': '<rootDir>/packages/webserver-express/src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
};
