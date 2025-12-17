import path from 'path'
import { fileURLToPath } from 'url'
import { VueLoaderPlugin } from 'vue-loader'
import ESLintPlugin from 'eslint-webpack-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = {
    mode: 'development',
    entry: path.resolve(__dirname, 'example/index.js'),
    output: {
        path: path.resolve(__dirname, 'example/dist'),
        filename: 'dist/build.js'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        fullySpecified: false
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                },
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'example')
        },
        compress: true,
        port: 9000
    },
    plugins: [
        new VueLoaderPlugin(),
        new ESLintPlugin({
            files: [
                './src',
                './example'
            ],
            extensions: [
                'js',
                'vue'
            ]
        })
    ]
}

export default config
