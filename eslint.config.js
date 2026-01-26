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
      "indent": "off", // Disabled - handled by Prettier
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "double", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "no-unused-vars": "warn",
      "no-console": ["warn", { "allow": ["error", "warn"] }],
      "camelcase": "warn",
      "max-len": ["warn", { "code": 80 }]
    }
  },
  {
    files: [
      "assets/js/command-data.js",
      "assets/js/command-palette.js",
      "assets/js/main.js",
      "assets/js/platform-utils.js",
      "assets/js/search-manager.js",
      "assets/js/teaching.js",
      "assets/js/utils.js"
    ],
    rules: {
      "max-len": [
        "warn",
        {
          "code": 120,
          "ignoreUrls": true,
          "ignoreStrings": true,
          "ignoreTemplateLiterals": true,
          "ignoreComments": true,
          "ignoreRegExpLiterals": true
        }
      ]
    }
  },
  {
    files: [
      "assets/js/main.js",
      "assets/js/search-manager.js",
      "assets/js/teaching.js"
    ],
    rules: {
      "no-console": ["warn", { "allow": ["error", "warn", "log"] }]
    }
  }
];
