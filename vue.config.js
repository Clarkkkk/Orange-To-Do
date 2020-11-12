const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
function resolve(dir) {
  return path.join(__dirname, dir);
}

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
      // 定义运行时缓存
      runtimeCaching: [
        {
          // To match cross-origin requests, use a RegExp that matches
          // the start of the origin:
          urlPattern: new RegExp(/^https?:\/\/.*126\.net/),
          handler: 'staleWhileRevalidate',
          options: {
            // Configure which responses are considered cacheable.
            cacheableResponse: {
              statuses: [200]
            }
          }
        },
        {
          // To match cross-origin requests, use a RegExp that matches
          // the start of the origin:
          urlPattern: new RegExp('^https://clarkkkk.xyz'),
          handler: 'staleWhileRevalidate',
          options: {
            // Configure which responses are considered cacheable.
            cacheableResponse: {
              statuses: [200]
            }
          }
        },
        {
          urlPattern: new RegExp('^https://cdn'),
          handler: 'NetworkFirst',
          options: {
            networkTimeoutSeconds: 20,
            cacheName: 'cdn-cache',
            cacheableResponse: {
              statuses: [200]
            }
          }
        }
      ]
    },
    name: 'neteasemusic',
    themeColor: '#e91a3d',
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
  publicPath: process.env.NODE_ENV === 'production' ? '/Netease-Music-Page/' : '/',
};
