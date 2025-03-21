<template>
	<view class="location-select">
		<view class="header">
			<text class="title">选择地区</text>
		</view>
		
		<view class="picker-container">
			<!-- 省份选择 -->
			<view class="picker-item">
				<text class="picker-label">省份</text>
				<picker @change="provinceChange" :value="provinceIndex" :range="provinces" range-key="name">
					<view class="picker-value">
						{{ selectedProvince ? selectedProvince.name : '请选择省份' }}
					</view>
				</picker>
			</view>
			
			<!-- 城市选择 -->
			<view class="picker-item">
				<text class="picker-label">城市</text>
				<picker @change="cityChange" :value="cityIndex" :range="cities" range-key="name" :disabled="!selectedProvince">
					<view class="picker-value">
						{{ selectedCity ? selectedCity.name : '请选择城市' }}
					</view>
				</picker>
			</view>
			
			<!-- 区县选择 -->
			<view class="picker-item">
				<text class="picker-label">区县</text>
				<picker @change="districtChange" :value="districtIndex" :range="districts" range-key="name" :disabled="!selectedCity">
					<view class="picker-value">
						{{ selectedDistrict ? selectedDistrict.name : '请选择区县' }}
					</view>
				</picker>
			</view>
		</view>
		
		<!-- 确认按钮 -->
		<button class="confirm-btn" @tap="confirmLocation" :disabled="!isLocationComplete">
			确认选择
		</button>
	</view>
</template>

<script>
import { areaData } from '../../utils/area-data.js';

export default {
	data() {
		return {
			provinces: [],
			cities: [],
			districts: [],
			provinceIndex: 0,
			cityIndex: 0,
			districtIndex: 0,
			selectedProvince: null,
			selectedCity: null,
			selectedDistrict: null
		}
	},
	computed: {
		isLocationComplete() {
			return this.selectedProvince && this.selectedCity && this.selectedDistrict;
		}
	},
	onLoad() {
		// 检查登录状态
		const userInfo = uni.getStorageSync('userInfo');
		if (!userInfo) {
			uni.showToast({
				title: '请先登录',
				icon: 'none',
				duration: 2000
			});
			// 跳转到登录页面
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/login/login'
				});
			}, 1500);
			return;
		}
		
		// 初始化省份数据
		this.provinces = areaData;
	},
	
	onShow() {
		// 检查登录状态
		const userInfo = uni.getStorageSync('userInfo');
		if (!userInfo) {
			uni.reLaunch({
				url: '/pages/login/login'
			});
			return;
		}
	},
	methods: {
		// 省份选择改变
		provinceChange(e) {
			const index = e.detail.value;
			this.provinceIndex = index;
			this.selectedProvince = this.provinces[index];
			this.cities = this.selectedProvince.children || [];
			this.selectedCity = null;
			this.selectedDistrict = null;
			this.cityIndex = 0;
			this.districtIndex = 0;
		},
		
		// 城市选择改变
		cityChange(e) {
			const index = e.detail.value;
			this.cityIndex = index;
			this.selectedCity = this.cities[index];
			this.districts = this.selectedCity.children || [];
			this.selectedDistrict = null;
			this.districtIndex = 0;
		},
		
		// 区县选择改变
		districtChange(e) {
			const index = e.detail.value;
			this.districtIndex = index;
			this.selectedDistrict = this.districts[index];
		},
		
		// 确认地区选择
		confirmLocation() {
			if (!this.isLocationComplete) {
				uni.showToast({
					title: '请完成地区选择',
					icon: 'none'
				});
				return;
			}
			
			// 直接跳转到规划页面
			uni.navigateTo({
				url: `/pages/service-select/index?province=${encodeURIComponent(this.selectedProvince.name)}&city=${encodeURIComponent(this.selectedCity.name)}&district=${encodeURIComponent(this.selectedDistrict.name)}`
			});
		}
	}
}
</script>

<style lang="scss">
.location-select {
	padding: 40rpx;
	min-height: 100vh;
	background: linear-gradient(135deg, #e8f5e9 0%, #2e7d32 100%);
	
	.header {
		margin-bottom: 60rpx;
		text-align: center;
		
		.title {
			font-size: 48rpx;
			font-weight: bold;
			color: #333;
			text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
		}
	}
	
	.picker-container {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 40rpx;
		
		.picker-item {
			margin-bottom: 30rpx;
			
			.picker-label {
				font-size: 28rpx;
				color: #333;
				margin-bottom: 10rpx;
				display: block;
			}
			
			.picker-value {
				height: 80rpx;
				line-height: 80rpx;
				border: 2rpx solid #e0e0e0;
				border-radius: 8rpx;
				padding: 0 20rpx;
				font-size: 28rpx;
				color: #333;
				background: #fff;
			}
		}
	}
	
	.confirm-btn {
		background-color: #4CAF50;
		color: #fff;
		font-size: 32rpx;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		margin-top: 60rpx;
		box-shadow: 0 6rpx 16rpx rgba(76, 175, 80, 0.3);
		
		&:disabled {
			background-color: #ccc;
			box-shadow: none;
		}
		
		&:active {
			transform: scale(0.98);
		}
	}
}
</style>