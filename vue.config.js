const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const zlib = require('zlib');
const webpack = require('webpack');

module.exports = {
  chainWebpack: config => {
    config.module.rule('zip')
      .test(/\.(zip)(\?.*)?$/)
      .use('file-loader')
        .loader('file-loader')
        .options({
          name: 'assets/zip/[name].[hash:8].[ext]'
        })
  },
  productionSourceMap: false,
  transpileDependencies: [
    'vuetify'
  ],
  css: {
    extract: { ignoreOrder: true },
  },
  configureWebpack: {
    optimization: {
      minimize: true,
      minimizer: [new UglifyJsPlugin({parallel: true})],
    },
    plugins: [
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
      })
    ]
  },
  pluginOptions: {
    compression:{
      brotli: {
        filename: '[file].br[query]',
        algorithm: 'brotliCompress',
        include: /\.(js|css|html|svg|json)(\?.*)?$/i,
        compressionOptions: {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        },
        minRatio: 0.8,
      },
      gzip: {
        filename: '[file].gz[query]',
        algorithm: 'gzip',
        include: /\.(js|css|html|svg|json)(\?.*)?$/i,
        minRatio: 0.8,
      }
    },
    webpackBundleAnalyzer: {
      openAnalyzer: false
    }
  }
}
