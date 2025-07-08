export const testEnvironment = 'jest-environment-jsdom';
export const transform = {
  '^.+\.(ts|tsx)$': 'ts-jest',
  '^.+\.css$': ['style-loader', 'css-loader'],
  '\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
};
export const moduleNameMapper = {
  '\.(css|less|scss|sass)$': 'identity-obj-proxy',
  '^@/(.*)$': '<rootDir>/src/$1',
};
export const setupFilesAfterEnv = ['<rootDir>/jest.setup.js'];
