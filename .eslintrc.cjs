module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module',
    requireConfigFile: false,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
  ],
  rules: {
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'arrow-parens': [
      'error',
      'as-needed',
    ],
    'arrow-body-style': [
      'error',
      'as-needed',
    ],
    'arrow-spacing': 'error',
    'object-curly-spacing': [
      'error',
      'always',
    ],
    'array-bracket-spacing': [
      'error',
      'always',
    ],
    'no-console': 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    indent: [
      'error',
      2,
    ],
    semi: [
      'error',
      'always',
    ],
    quotes: [
      'error',
      'single',
      'avoid-escape',
    ],
    'quote-props': [
      'error',
      'as-needed',
    ],
    'object-curly-newline': [
      'error',
      {
        multiline: true,
        consistent: true,
      },
    ],
    'comma-dangle': [
      'error',
      'always-multiline',
    ],
    'comma-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'comma-style': [
      'error',
      'last',
    ],
    'eol-last': 'error',
    'key-spacing': [
      'error',
      {
        beforeColon: false,
        afterColon: true,
      },
    ],
    'keyword-spacing': [
      'error',
      {
        before: true,
        after: true,
      },
    ],
    'block-spacing': 'error',
    'space-in-parens': [
      'error',
      'never',
    ],
    'space-before-blocks': 'error',
    'no-trailing-spaces': 'error',
    'semi-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'space-infix-ops': 'error',
    'linebreak-style': [
      'error',
      'unix',
    ],
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    'no-param-reassign': [
      'error',
      {
        props: false,
      },
    ],
    'no-unused-vars': [
      'error',
    ],
    'no-unused-expressions': [
      'error',
      {
        allowTaggedTemplates: true,
      },
    ],
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
      },
    ],
    'import/no-unresolved': [
      'error',
      {
        ignore: [
          'data/data.json$',
        ],
      },
    ],
  },
  overrides: [
    {
      files: [ 'src/data/generate.js' ],
      env: {
        node: true,
        es2022: true,
      },
    },
    {
      files: [ '*.cjs' ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        node: true,
        es2022: true,
      },
    },
  ],
};
