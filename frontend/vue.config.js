const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        "http": false,
        "https": false,
        "url": false,
        "buffer": false,
        "crypto": false,
        "stream": false,
        "assert": false,
        "os": false,
        "tty": false
      }
    }
  }
})
