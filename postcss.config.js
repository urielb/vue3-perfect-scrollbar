import path from 'path'
import { fileURLToPath } from 'url'
import postcssImport from 'postcss-import'
import cssnano from 'cssnano'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default ctx => ({
    plugins: {
        'postcss-import': {
            resolve(id, basedir) {
                if (/^~/.test(id)) return path.resolve('./node_modules', id.replace('~', ''))
                return path.resolve(basedir, id)
            }
        },
        'cssnano': ctx.env === 'production'
    }
})
