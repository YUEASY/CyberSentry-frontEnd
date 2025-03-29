const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://47.98.248.64:8080', // 后端服务器地址
        changeOrigin: true, // 是否改变请求源
        pathRewrite: { '^/api': '' }, // 重写路径
      },
    },
  },

})
