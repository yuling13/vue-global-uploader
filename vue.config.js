const path = require('path')

module.exports = {
  runtimeCompiler: true,

  chainWebpack: (config) => {
    config.stats({
      colors: true,
      assets: true,
      chunks: false,
      chunkModules: false,
    })

    // 不使用 prefetch
    config.plugins.delete('prefetch')

    config.module.rules.delete('eslint')

    config.resolve
      .extensions.add('.scss').end()
      .alias.set('~', path.resolve('src/assets')).end()

    // 關閉預設的 sourceMap
    config.optimization
      .minimizer('terser').tap(args => {
        args[0].sourceMap = false
        return args
      }).end()
  },

  devServer: {
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
}
