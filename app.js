require('./common/vendor.js');

App({
    globalData: {
        config: {
            // 在这里添加默认的配置项
            initialized: true,
            version: '1.0.0'
        }
    },
    onLaunch: function() {
        // 确保globalData.config在应用启动时被初始化
        if (!this.globalData) {
            this.globalData = {}
        }
        if (!this.globalData.config) {
            this.globalData.config = {
                initialized: true,
                version: '1.0.0'
            }
        }
        console.log('App Launch')
    },
    onShow: function() {
        console.log('App Show')
    },
    onHide: function() {
        console.log('App Hide')
    }
});