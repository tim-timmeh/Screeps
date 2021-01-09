// These are updated Screeps constants to use with linter-eslint. 
//
const constants = require('lib/constants.js');
const node = require('lib/node.js');
const prototypes = require('lib/prototypes.js');
const runtime = require('lib/runtime.js');
//
// https://github.com/PostCrafter/eslint-plugin-screeps

module.exports = {
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 9,
        "sourceType": "module",
    },
    rules: {
        'no-console': 'off',
        "no-unused-vars": 'off',
        "no-undef": 1,
    },
    "env": {
      "es6": true,
      "node": true,
    },
      "globals": Object.assign({}, constants, node, prototypes, runtime), // Combine all required object constants into 1
};
