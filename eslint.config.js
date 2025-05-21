module.exports = [
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        browser: true,
        es2021: true,
        marked: "readonly",
        DOMPurify: "readonly"
      }
    },
    rules: {
      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "no-unused-vars": "warn",
      "no-console": ["warn", { "allow": ["error", "warn"] }],
      "camelcase": "warn",
      "max-len": ["warn", { "code": 80 }]
    }
  }
];