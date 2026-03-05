/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system.ts',
    '^expo-location$': '<rootDir>/__mocks__/expo-location.ts',
    '^expo-mail-composer$': '<rootDir>/__mocks__/expo-mail-composer.ts',
    '^@react-native-community/netinfo$': '<rootDir>/__mocks__/@react-native-community/netinfo.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
  },
};
