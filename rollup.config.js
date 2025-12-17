import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json' with { type: 'json' }

const browser = {
    input: 'src/index.js',
    output: {
        format: 'umd',
        name: 'Vue3PerfectScrollbar',
        file: pkg.browser
    },
    plugins: [
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env']
        }),
        resolve({
            browser: true
        }),
        commonjs()
    ]
}

const browserMin = {
    input: 'src/index.js',
    output: {
        format: 'umd',
        name: 'Vue3PerfectScrollbar',
        file: 'dist/vue3-perfect-scrollbar.umd.min.js'
    },
    plugins: [
        resolve({
            browser: true
        }),
        commonjs(),
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env']
        }),
        terser()
    ]
}

const nodeModules = {
    input: 'src/index.js',
    output: [
        {
            format: 'cjs',
            file: pkg.main
        },
        {
            format: 'esm',
            file: pkg.module
        }
    ],
    plugins: [
    ],
    external: ['perfect-scrollbar']
}

export default [
    browser,
    browserMin,
    nodeModules
]
