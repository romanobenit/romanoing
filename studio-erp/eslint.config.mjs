export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'public/**',
      '*.config.*',
      '**/*.d.ts',
      'scripts/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': ['warn', {allow: ['warn', 'error']}],
      'no-unused-vars': 'off', // TypeScript handles this
    },
  },
]
