module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    chai: 'readonly',
    mocha: 'readonly',
    describe: 'readonly',
    it: 'readonly',
  },
  plugins: [
    'html',
  ],
  extends: [
    'plugin:vue/essential',
    'plugin:vue/strongly-recommended',
    'plugin:vue/recommended',
    '@vue/airbnb',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    parser: 'babel-eslint',
  },
  rules: {
    // #region ESlint规则
    // https://eslint.org/docs/rules/
    // https://eslint.org/docs/user-guide/configuring#extending-configuration-files
    // 'no-console': NODE_ENV === NODE_ENV_PROD ? 'warn' : 'off',
    // 'no-debugger': NODE_ENV === NODE_ENV_PROD ? 'warn' : 'off',
    'max-len': ['error', 200],
    'consistent-return': ['off'],
    'import/extensions': ['off'],
    'import/no-unresolved': ['off'],
    'import/no-extraneous-dependencies': ['off'],
    'func-names': ['off'],
    'linebreak-style': ['off'],
    'no-unused-vars': ['warn'],
    'no-useless-return': ['warn'],
    'no-use-before-define': ['error', 'nofunc'],

    // #endregion
  },
  overrides: [{
    files: [
      '**/__tests__/*.{j,t}s?(x)',
      '**/tests/unit/**/*.spec.{j,t}s?(x)',
    ],
    env: {
      mocha: true,
    },
  }],
};
