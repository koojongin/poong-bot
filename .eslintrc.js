module.exports = {
  "ignorePatterns": ['.eslintrc.js','static/'],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  "env": {
    "node":true,
  },
  "plugins": ['prettier', '@typescript-eslint/eslint-plugin'],
  "extends": ['prettier', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  "globals": {
    "$": true,
    "moment": true
  },
  "rules": {
    "no-unused-vars": "off",
    "no-shadow": "off",
    "camelcase": "off",
    "max-len": "off",
    "import/no-cycle": "off",
    "radix": "off",
    "import/order": "off",
    "eslint-disable-next-line": "off",
    "no-use-before-define": "off",
    "import/no-unresolved": "off"
  }
}
