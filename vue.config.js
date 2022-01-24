const path = require('path')
const mergeBaseWebpackConfig = config => {
  config.stats({
    colors: true,
    assets: true,
    chunks: false,
    chunkModules: false,
  })

  // 不使用 prefetch
  config.plugins.delete('prefetch')

  config.module.rules.delete('svg')
  config.module.rule('svg')
    .test(/\.svg$/)
    .use('svg-url-loader').loader('svg-url-loader').options({ encoding: 'base64' }).end()

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
}

const mergeDevelopmentWebpackConfig = config => {
  config.plugin('webpack-notifie')
    .use(require('webpack-notifier'), [{
      contentImage: path.join(__dirname, 'public', 'favicon.png'),
    }])
}

module.exports = {
  runtimeCompiler: true,

  chainWebpack: config => {
    mergeBaseWebpackConfig(config)
    mergeDevelopmentWebpackConfig(config)
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
