module.exports = {
  files: ['**/*.js', '**/*.ts'], // Apply to JavaScript and TypeScript files
  languageOptions: {
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  rules: {
    semi: ['error', 'always'], // Enforce semicolons
    quotes: ['error', 'single'], // Enforce single quotes
    'no-unused-vars': 'warn', // Warn about unused variables
    'sort-imports': ['error', { ignoreDeclarationSort: true }], // Sort imports
  },
};
