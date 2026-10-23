/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  moduleNameMapper: {
    // `src/global.css` is a web-only side-effect import with no native
    // equivalent, and Jest has no CSS pipeline.
    '\\.css$': '<rootDir>/jest/style-mock.js',
    // Lucide ships ESM only, so Jest cannot require it. A stub keeps unit tests
    // fast; the real library is used by the app and the icon names are checked
    // by TypeScript against Lucide's own types.
    '^lucide-react-native$': '<rootDir>/jest/lucide-mock.js',
    '^lucide-react-native/icons/(.*)$': '<rootDir>/jest/lucide-mock.js',
    // `expo-image` does async native work that escapes `act()` in Jest; see the
    // mock for why that is safe to replace.
    '^expo-image$': '<rootDir>/jest/expo-image-mock.js',
    // The real provider measures the window on layout, and under the Jest web
    // renderer that measurement never lands, so `SafeAreaProvider` (and its
    // Modal subtrees) never mounts children. The mock resolves flat zero
    // insets synchronously; see the mock for the detail.
    '^(react-native-safe-area-context)$': '<rootDir>/jest/safe-area-mock.js',
    '^(react-native-safe-area-context)/(.*)$': '<rootDir>/jest/safe-area-mock.js',
  },
  // The Expo preset whitelists RN/Expo packages for Babel. Lucide ships ESM
  // only, so it must be transformed too or Jest trips over its `import`.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|lucide-react-native)',
  ],
};
