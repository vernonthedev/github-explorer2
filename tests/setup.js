/**
 * Jest Setup File
 */

// Mock window object for JSDOM
global.window = global.window || {};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Dexie
global.Dexie = jest.fn().mockImplementation(() => ({
  version: jest.fn().mockReturnThis(),
  settings: {
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    delete: jest.fn().mockResolvedValue(undefined),
    add: jest.fn().mockResolvedValue(undefined),
    first: jest.fn().mockResolvedValue(undefined),
  },
  groups: {
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    add: jest.fn().mockResolvedValue(undefined),
  }
}));