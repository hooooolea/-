const TerserPlugin = require('terser-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const path = require('path')

module.exports = {
    configureWebpack: {
        optimization: {
            minimize: process.env.NODE_ENV === 'production',
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        ecma: undefined,
                        parse: {},
                        compress: {
                            drop_console: false,
                            drop_debugger: false,
                            pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log'] : []
                        },
                        mangle: true,
                        module: false,
                        output: null,
                        format: {
                            comments: false
                        },
                        toplevel: false,
                        nameCache: null,
                        ie8: false,
                        keep_classnames: false,
                        keep_fnames: false,
                        safari10: false
                    },
                    extractComments: false
                })
            ],
            splitChunks: {
                chunks: 'all',
                minSize: 20000,
                maxSize: 0,
                minChunks: 1,
                maxAsyncRequests: 30,
                maxInitialRequests: 30,
                automaticNameDelimiter: '~',
                enforceSizeThreshold: 50000,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        name: 'vendors'
                    },
                    common: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                        name: 'common'
                    }
                }
            }
        },
        plugins: process.env.NODE_ENV === 'production' ? [] : [
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false
            })
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './'),
                '@components': path.resolve(__dirname, './components'),
                '@utils': path.resolve(__dirname, './utils')
            }
        }
    },
    transpileDependencies: ['@dcloudio/uni-mp-vue'],
    productionSourceMap: false,
    chainWebpack: config => {
        // 删除预加载
        config.plugins.delete('preload')
        config.plugins.delete('prefetch')
    }
} 