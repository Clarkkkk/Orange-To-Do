const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  lintOnSave: false,
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      importWorkboxFrom: 'local', // 从''cdn"导入workbox,也可以‘local’
      skipWaiting: true, // 安装完SW不等待直接接管网站
      clientsClaim: true,
      navigateFallback: '/index.html',
      exclude: [/\.(?:png|jpg|jpeg|map)$/], // 在预缓存中排除图片和sourceMap
    },
    name: 'orange-to-do',
    themeColor: '#FFA500',
    appleMobileWebAppCapable: 'yes',
    manifestPath: 'public/manifest.json',
    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      androidChrome: 'img/icons/android-chrome-192x192.png',
      appleTouchIcon: 'img/icons/apple-touch-icon.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/mstile-150x150.png'
    }
  },
  configureWebpack: {
    plugins: [
      // copy sw.js path.resolve(__dirname, ‘sw.js所在路径’)
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, './src/service-worker.js'),
          to: path.resolve(__dirname, './dist'),
          ignore: ['.*']
        }
      ])
    ]
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/Orange-To-Do-Page/' : '/',
};
