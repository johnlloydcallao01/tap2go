import nextjsConfig from '../../packages/eslint-config/nextjs.js'

export default [
  ...nextjsConfig,
  {
    ignores: ['.next/', '**/*.cjs', 'src/payload-generated-schema.ts', 'src/payload-types.ts'],
  },
]
