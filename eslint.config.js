const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.es2021,
        marked: "readonly",
        DOMPurify: "readonly",
        Utils: "readonly"
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
      "max-len": ["warn", { "code": 80 }],
      "no-useless-assignment": "off" // eslint 10 new default; intentionally relaxed (initial-then-overwrite pattern is common in this codebase)
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
