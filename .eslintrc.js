module.exports = {
  root: true,
  env: {
    'browser': true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard',
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'generator-star-spacing': 'off',
    'vue/order-in-components': [
      'error',
      {
        'order': [
          'el',
          'name',
          'parent',
          'functional',
          [
            'delimiters',
            'comments',
          ],
          [
            'components',
            'directives',
            'filters',
          ],
          'extends',
          'mixins',
          'inheritAttrs',
          'model',
          [
            'props',
            'propsData',
          ],
          'data',
          'computed',
          'watch',
          'LIFECYCLE_HOOKS',
          'methods',
          [
            'template',
            'render',
          ],
          'renderError',
        ],
      },
    ],
    'comma-dangle': [
      'error',
      'always-multiline',
    ],
    'radix': 'error',
    'no-unused-vars': 'warn',
    'no-extend-native': 'off',
    'prefer-promise-reject-errors': 'off',
    'standard/no-callback-literal': 'off',
    'handle-callback-err': 'off',
    'line-comment-position': [
      'error', {
        'position': 'above',
      },
    ],
    'comma-spacing': 'error',
  },
  globals: {
    Helper: true,
    Decimal: true,
  },
  plugins: [
    'vue',
  ],
}
