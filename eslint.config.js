import js from '@eslint/js';
import imports from 'eslint-plugin-import';
import sort from 'eslint-plugin-simple-import-sort';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

import svelteConfig from './svelte.config.js';

export default ts.config(
    {
        ignores: [
            //'src-tauri',
            'build',
            '.svelte-kit',
            'node_modules',
            'static',
        ],
    },
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs.recommended,
    {
        plugins: {
            'simple-import-sort': sort,
            'import': imports,
        },
        languageOptions: {
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 'latest',
            },
        },
        rules: {
            'simple-import-sort/imports': [
                'warn',
                {
                    groups: [
                        ['^\\u0000'],
                        ['^node:'],
                        // Move `$app/*` into the "external" group
                        ['^@?\\w', '^\\$app'],
                        ['^\\.'],
                        // Consts first
                        ['^\\$lib/const', '^'],
                    ],
                }
            ],
            'simple-import-sort/exports': 'warn',
            'import/first': 'warn',
        }
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            },
        },
    },
    {
        files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
        // See more details at: https://typescript-eslint.io/packages/parser/
        languageOptions: {
            parserOptions: {
                projectService: true,
                extraFileExtensions: ['.svelte'], // Add support for additional file extensions, such as .svelte
                parser: ts.parser,
                // Specify a parser for each language, if needed:
                // parser: {
                //   ts: ts.parser,
                //   js: espree,    // Use espree for .js files (add: import espree from 'espree')
                //   typescript: ts.parser
                // },

                // We recommend importing and specifying svelte.config.js.
                // By doing so, some rules in eslint-plugin-svelte will automatically read the configuration and adjust their behavior accordingly.
                // While certain Svelte settings may be statically loaded from svelte.config.js even if you don’t specify it,
                // explicitly specifying it ensures better compatibility and functionality.
                svelteConfig
            }
        }
    },
    {
        rules: {
            'svelte/no-at-html-tags': 'off',
            '@typescript-eslint/no-unused-imports': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    'vars': 'all',
                    'varsIgnorePattern': '^_',
                    'args': 'after-used',
                    'argsIgnorePattern': '^_'
                }
            ]

        }
    }
);
