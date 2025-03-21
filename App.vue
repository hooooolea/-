<script>
// #ifdef MP-WEIXIN
// 初始化微信小程序环境
const systemInfo = {
	SDKVersion: '2.30.4',
	version: '8.0.5',
	platform: 'windows',
	language: 'zh_CN',
	model: 'PC',
	system: 'Windows 10',
	windowWidth: 375,
	windowHeight: 667,
	screenWidth: 375,
	screenHeight: 667,
	pixelRatio: 2
}

// 注入全局对象
if (typeof global === 'object') {
	global.wx = global.wx || {}
	global.wx.getSystemInfoSync = () => systemInfo
}

if (typeof wx === 'object') {
	wx.getSystemInfoSync = wx.getSystemInfoSync || (() => systemInfo)
	
	// 添加其他必要的API
	wx.getAppBaseInfo = wx.getAppBaseInfo || (() => ({
		SDKVersion: '2.30.4',
		enableDebug: false,
		host: {},
		language: 'zh_CN',
		version: '8.0.5',
		theme: 'light'
	}))
	
	wx.getDeviceInfo = wx.getDeviceInfo || (() => ({
		brand: 'microsoft',
		model: 'PC',
		system: 'Windows 10',
		platform: 'windows'
	}))
	
	wx.getWindowInfo = wx.getWindowInfo || (() => ({
		pixelRatio: 2,
		screenWidth: 375,
		screenHeight: 667,
		windowWidth: 375,
		windowHeight: 667,
		statusBarHeight: 20,
		safeArea: {
			bottom: 667,
			height: 647,
			left: 0,
			right: 375,
			top: 20,
			width: 375
		},
		screenTop: 0
	}))
}
// #endif

export default {
	onLaunch: function() {
		console.log('App Launch')
		
		// #ifdef MP-WEIXIN
		// 确保wx对象存在基础信息
		if (typeof wx !== 'undefined') {
			if (!wx.getSystemInfoSync) {
				wx.getSystemInfoSync = () => ({
					SDKVersion: '2.30.4',
					version: '8.0.5',
					platform: 'windows',
					language: 'zh_CN'
				})
			}
		}
		// #endif
		
		// 检查登录状态
		try {
			const userInfo = uni.getStorageSync('userInfo')
			if (!userInfo) {
				// 未登录则跳转到登录页
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/login/login'
					})
				}, 100)
			}
		} catch (error) {
			console.error('登录状态检查失败:', error)
		}
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style>
	/*每个页面公共css */
</style>
