import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/generated/prisma$': '<rootDir>/src/__tests__/__mocks__/prisma.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'bundler',
        esModuleInterop: true,
        allowJs: true,
        strict: true,
        noEmit: true,
        resolveJsonModule: true,
        isolatedModules: true,
        incremental: false,
        paths: {
          '@/*': ['./src/*'],
        },
      },
    }],
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/src/__tests__/__mocks__/'],
  transformIgnorePatterns: ['node_modules/(?!(jspdf|jspdf-autotable)/)'],
};

export default config;
