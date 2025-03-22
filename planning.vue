<template>
	<!-- 精准规划页面容器 -->
	<view class="planning-container">
		<!-- 页面标题 -->
		<view class="title">精准种植规划</view>
		
		<!-- 退出登录按钮 -->
		<view class="logout-btn" @tap="handleLogout">退出登录</view>
		
		<!-- 输入表单区域 -->
		<view class="input-section">
			<view class="section-title">输入参数</view>
			
			<!-- 总面积输入 -->
			<view class="input-item">
				<text class="input-label">总种植面积 (亩)</text>
				<input type="number" v-model="formData.totalArea" placeholder="" class="input-field" />
				<text class="input-tip">示例：45亩（一般农户种植面积在10-100亩之间，请根据实际土地面积填写）</text>
			</view>
			
			<!-- 土壤类型选择 -->
			<view class="input-item">
				<text class="input-label">土壤类型</text>
				<picker @change="soilTypeChange" :value="soilTypeIndex" :range="soilTypes" class="picker">
					<view class="picker-value">{{ soilTypes[soilTypeIndex] }}</view>
				</picker>
				<text class="input-tip">黑土：适合玉米、大豆等；砂质土：适合花生、甜菜等；粘土：适合水稻、棉花等；壤土：适合多种作物</text>
			</view>
			
			<!-- 作物选择 -->
			<view class="input-item">
				<text class="input-label">作物选择</text>
				<view class="checkbox-group">
					<view class="checkbox-item" v-for="(crop, index) in crops" :key="index">
						<checkbox :checked="crop.selected" @tap="toggleCrop(index)" />
						<text>{{crop.name}}</text>
					</view>
				</view>
				<text class="input-tip">建议选择2-4种作物搭配种植，可以降低市场风险，提高土地利用率</text>
			</view>
			
			<!-- 预算输入 -->
			<view class="input-item">
				<text class="input-label">种植预算 (元)</text>
				<input type="number" v-model="formData.budget" placeholder="" class="input-field" />
				<text class="input-tip">示例：50000元（每亩地投入约1000-2000元，包括种子、化肥、农药、人工等成本）</text>
			</view>
			
			<!-- 提交按钮 -->
			<button class="submit-btn" @tap="generatePlan">生成规划方案</button>
		</view>
		
		<!-- 结果展示区域 -->
		<view class="result-section" v-if="showResult">
			<view class="section-title">优化结果</view>
			
			<!-- 结果数据展示 -->
			<view class="result-data">
				<view class="result-item" v-for="(area, crop) in results" :key="crop">
					<text class="result-label">{{getCropName(crop)}}</text>
					<text class="result-value">{{area.toFixed(2)}} 亩</text>
				</view>
				<view class="result-item total">
					<text class="result-label">总面积</text>
					<text class="result-value">{{totalResultArea.toFixed(2)}} 亩</text>
				</view>
			</view>
			
			<!-- 分布图展示 -->
			<view class="distribution-chart">
				<view class="chart-title">作物分布示意图</view>
				<view class="chart-container">
					<!-- 这里将使用canvas绘制分布图 -->
					<canvas canvas-id="distributionChart" 
					class="chart-canvas"
					@touchstart="handleChartTouch"
					@touchmove="handleChartMove"
					@touchend="handleChartEnd"></canvas>
				</view>
				
				<!-- 图例说明 -->
				<view class="chart-legend">
					<view class="legend-item" v-for="(color, crop) in cropColors" :key="crop">
						<view class="color-block" :style="{backgroundColor: color}"></view>
						<text>{{getCropName(crop)}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
// 引入优化算法库
import * as solver from '../../utils/solver.js';

// 引入可视化工具类
import * as visualizer from '../../utils/visualizer.js';

export default {
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
	},
	data() {
		return {
			// 表单数据
			formData: {
				totalArea: null, // 清空默认值
				budget: null, // 清空默认值
			},
			// 土壤类型选项
			soilTypes: ['黑土', '砂质土', '粘土', '壤土'],
			soilTypeIndex: 3, // 默认选择壤土
			
			// 作物选项
			crops: [
				{ name: '水稻', selected: true, cost: 1200, yield: 18500, carbon: 5800 },
				{ name: '小麦', selected: true, cost: 850, yield: 15000, carbon: 4500 },
				{ name: '玉米', selected: true, cost: 900, yield: 21164, carbon: 6690 },
				{ name: '大豆', selected: false, cost: 1005, yield: 9423, carbon: 5090 },
				{ name: '花生', selected: false, cost: 1100, yield: 12000, carbon: 4200 },
				{ name: '苜蓿', selected: false, cost: 720, yield: 7452, carbon: 2172 },
				{ name: '棉花', selected: false, cost: 1500, yield: 3500, carbon: 3800 },
				{ name: '油菜', selected: false, cost: 780, yield: 8500, carbon: 3200 },
				{ name: '高粱', selected: false, cost: 850, yield: 11000, carbon: 4100 },
				{ name: '甜菜', selected: false, cost: 950, yield: 13500, carbon: 3800 },
				{ name: '向日葵', selected: false, cost: 890, yield: 9800, carbon: 3600 },
				{ name: '芝麻', selected: false, cost: 980, yield: 4500, carbon: 2800 }
			],
			
			// 作物颜色映射
			cropColors: {
				x1: '#FFB74D', // 水稻
				x2: '#FFF176', // 小麦
				x3: '#2ecc71', // 玉米
				x4: '#f1c40f', // 大豆
				x5: '#FF7043', // 花生
				x6: '#3498db', // 苜蓿
				x7: '#E1BEE7', // 棉花
				x8: '#81C784', // 油菜
				x9: '#FFD54F', // 高粱
				x10: '#F06292', // 甜菜
				x11: '#FFB300', // 向日葵
				x12: '#8D6E63'  // 芝麻
			}
		};
	},
	
	computed: {
		// 计算总结果面积
		totalResultArea() {
			if (!this.results) return 0;
			return Object.values(this.results).reduce((sum, area) => sum + area, 0);
		}
	},
	
	methods: {
		// 土壤类型选择变化处理
		soilTypeChange(e) {
			this.soilTypeIndex = e.detail.value;
		},
		
		// 切换作物选择状态
		toggleCrop(index) {
			this.crops[index].selected = !this.crops[index].selected;
		},
		
		// 获取作物名称
		getCropName(cropKey) {
			const cropMap = {
				x1: '水稻',
				x2: '小麦',
				x3: '玉米',
				x4: '大豆',
				x5: '花生',
				x6: '苜蓿',
				x7: '棉花'
			};
			return cropMap[cropKey] || cropKey;
		},
		
		// 生成规划方案
		generatePlan() {
			// 验证输入
			if (!this.validateInput()) {
				return;
			}
			
			// 获取选中的作物
			const selectedCrops = this.crops.filter(crop => crop.selected);
			if (selectedCrops.length < 2) {
				uni.showToast({
					title: '请至少选择两种作物',
					icon: 'none'
				});
				return;
			}
			
			// 调用优化求解函数
			try {
				// 这里调用solver.js中的优化函数
				this.results = solver.solveCropOptimization({
					totalArea: parseFloat(this.formData.totalArea),
					budget: parseFloat(this.formData.budget),
					soilType: this.soilTypes[this.soilTypeIndex],
					crops: selectedCrops
				});
				
				this.showResult = true;
				
				// 绘制分布图
				this.$nextTick(() => {
					this.drawDistributionChart();
				});
			} catch (error) {
				console.error('优化计算错误:', error);
				uni.showToast({
					title: '计算出错，请检查输入参数',
					icon: 'none'
				});
			}
		},
		
		// 验证输入
		validateInput() {
			if (!this.formData.totalArea || this.formData.totalArea <= 0) {
				uni.showToast({
					title: '请输入有效的总面积',
					icon: 'none'
				});
				return false;
			}
			
			if (!this.formData.budget || this.formData.budget <= 0) {
				uni.showToast({
					title: '请输入有效的预算',
					icon: 'none'
				});
				return false;
			}
			
			return true;
		},
		
		// 绘制分布图
		drawDistributionChart() {
			const ctx = uni.createCanvasContext('distributionChart', this);
			const width = 300;
			const height = 300;
			
			// 清空画布
			ctx.clearRect(0, 0, width, height);
			
			// 生成块状区域
			const fragments = visualizer.generateVoronoi({
				width,
				height
			});
			
			// 块状颜色分配（确保最小显示单元）
			const coloredFragments = visualizer.allocateColors(fragments, this.results, {
				colors: this.cropColors
			});
			
			// 绘制分布图
			visualizer.drawDistribution(ctx, coloredFragments);
			
			// 绘制到画布
			ctx.draw();
		},
		
		// 处理退出登录
		handleLogout() {
			// 清除本地存储
			uni.removeStorageSync('userInfo');
			
			// 显示提示
			uni.showToast({
				title: '已退出登录',
				icon: 'success',
				duration: 2000
			});
			
			// 跳转到登录页面
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/login/login'
				});
			}, 1500);
		},
		
		// 处理图表触摸开始事件
		handleChartTouch(e) {
			this.touchStartX = e.touches[0].x;
			this.touchStartY = e.touches[0].y;
		},
		
		// 处理图表移动事件
		handleChartMove(e) {
			// 实现拖动查看详细区域功能
		},
		
		// 处理图表触摸结束事件
		handleChartEnd() {
			// 实现点击区块显示详细信息
		}
	}
}
</script>

<style lang="scss">
// 规划页面容器样式
.planning-container {
	padding: 40rpx;
	background: linear-gradient(135deg, #e8f5e9 0%, #2e7d32 100%);
	min-height: 100vh;
	
	// 页面标题
	.title {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 40rpx;
		text-align: center;
	}
	
	// 退出登录按钮样式
	.logout-btn {
		position: absolute;
		top: 40rpx;
		right: 40rpx;
		padding: 16rpx 30rpx;
		background-color: #ff4d4f;
		color: #fff;
		border-radius: 30rpx;
		font-size: 28rpx;
		box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.2);
		transition: all 0.3s ease;
		
		&:active {
			transform: scale(0.95);
			box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.15);
		}
	}
	
	// 输入区域样式
	.input-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #4CAF50;
			margin-bottom: 30rpx;
			border-left: 8rpx solid #4CAF50;
			padding-left: 20rpx;
		}
		
		.input-item {
			margin-bottom: 24rpx;
			
			.input-label {
				display: block;
				font-size: 28rpx;
				color: #333;
				margin-bottom: 12rpx;
			}
			
			.input-field {
				height: 80rpx;
				border: 2rpx solid #e0e0e0;
				border-radius: 8rpx;
				padding: 0 20rpx;
				font-size: 28rpx;
				width: 100%;
				box-sizing: border-box;
			}
			
			.input-tip {
				display: block;
				font-size: 24rpx;
				color: #4CAF50;
				margin-top: 8rpx;
				padding-left: 10rpx;
				line-height: 1.4;
			}
			
			.picker {
				height: 80rpx;
				border: 2rpx solid #e0e0e0;
				border-radius: 8rpx;
				padding: 0 20rpx;
				font-size: 28rpx;
				width: 100%;
				box-sizing: border-box;
				display: flex;
				align-items: center;
			}
			
			.checkbox-group {
				display: flex;
				flex-wrap: wrap;
				
				.checkbox-item {
					display: flex;
					align-items: center;
					margin-right: 30rpx;
					margin-bottom: 16rpx;
					
					text {
						font-size: 28rpx;
						margin-left: 8rpx;
					}
				}
			}
		}
		
		.submit-btn {
			background-color: #4CAF50;
			color: #fff;
			font-size: 32rpx;
			font-weight: bold;
			height: 88rpx;
			line-height: 88rpx;
			border-radius: 44rpx;
			margin-top: 30rpx;
			box-shadow: 0 6rpx 16rpx rgba(76, 175, 80, 0.3);
		}
	}
	
	// 结果区域样式
	.result-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		animation: fadeIn 0.5s ease;
		
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #4CAF50;
			margin-bottom: 30rpx;
			border-left: 8rpx solid #4CAF50;
			padding-left: 20rpx;
		}
		
		.result-data {
			margin-bottom: 30rpx;
			
			.result-item {
				display: flex;
				justify-content: space-between;
				padding: 16rpx 0;
				border-bottom: 2rpx solid #f0f0f0;
				
				&.total {
					font-weight: bold;
					margin-top: 16rpx;
					border-top: 2rpx solid #e0e0e0;
					border-bottom: none;
					padding-top: 20rpx;
				}
				
				.result-label {
					font-size: 28rpx;
					color: #333;
				}
				
				.result-value {
					font-size: 28rpx;
					color: #4CAF50;
					font-weight: bold;
				}
			}
		}
		
		.distribution-chart {
			// 添加外框增强可视性
			border: 2rpx solid #e0e0e0;
			border-radius: 16rpx;
			padding: 20rpx;
			margin-top: 30rpx;
			
			.chart-title {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 20rpx;
				text-align: center;
			}
			
			.chart-container {
				width: 90%;
				height: 65vh;
				position: relative;
				margin: 20rpx auto;
				background: var(--chart-bg, #f8f9fa);
				border-radius: 16rpx;
				overflow: hidden;
				touch-action: none;
			}
			
			.chart-canvas {
				width: 100%;
				height: 100%;
				transition: transform 0.3s;
			}
			
			.chart-legend {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				margin-top: 20rpx;
				// 增加边界线
				border-top: 2rpx dashed #e0e0e0;
				padding-top: 25rpx;
				margin-top: 25rpx;
				
				.legend-item {
					display: flex;
					align-items: center;
					margin: 0 20rpx 16rpx;
					// 添加hover效果
					padding: 8rpx 15rpx;
					border-radius: 8rpx;
					transition: all 0.3s;
					
					&:active {
						background: #f5f5f5;
					}
					
					.color-block {
						width: 30rpx;
						height: 30rpx;
						border-radius: 6rpx;
						margin-right: 10rpx;
					}
					
					text {
						font-size: 26rpx;
						color: #666;
					}
				}
			}
		}
	}
}

// 定义关键帧动画
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>