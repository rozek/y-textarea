const path = require('path')
const { defineConfig } = require('vite')
import typescript from '@rollup/plugin-typescript'

const resolvePath = (str) => path.resolve(__dirname, str)

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/y-textArea.ts'),
      name: 'y-textArea',
      fileName: (format) => `y-textArea.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['yjs'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          yjs: 'Y',
        },
      },
      plugins: [
        typescript({
          target: 'esnext',
          rootDir: resolvePath('./src'),
          declaration: true,
          declarationDir: resolvePath('./dist'),
          exclude: resolvePath('./node_modules/**'),
          allowSyntheticDefaultImports: true,
        }),
      ],
    },
  },
})
