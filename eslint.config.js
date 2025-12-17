import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginN from 'eslint-plugin-n'
import pluginPromise from 'eslint-plugin-promise'

export default [
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        plugins: {
            n: pluginN,
            promise: pluginPromise
        },
        languageOptions: {
            ecmaVersion: 2018,
            sourceType: 'module',
            parserOptions: {
                ecmaVersion: 2018
            }
        },
        rules: {
        }
    }
]
