// 引入优化算法库和可视化工具类
const solver = require('../../utils/solver.js');
const visualizer = require('../../utils/visualizer.js');

Page({
  data: {
    // 表单数据
    formData: {
      totalArea: null, // 总种植面积
      budget: null, // 种植预算
    },
    // 选择的地区信息
    selectedArea: null,
    // 土壤类型选项
    soilTypes: ['黑土', '砂质土', '粘土', '壤土'],
    soilTypeIndex: 3, // 默认选择壤土
    
    // 作物选项列表
    crops: [
      { name: '玉米', selected: true, cost: 900, yield: 21164, carbon: 6690 },
      { name: '苜蓿', selected: true, cost: 720, yield: 4572 * 1.63, carbon: 2172 },
      { name: '大豆', selected: true, cost: 1005, yield: 9423, carbon: 5090 },
      { name: '水稻', selected: false, cost: 1200, yield: 18750, carbon: 7200 },
      { name: '小麦', selected: false, cost: 850, yield: 15000, carbon: 5500 },
      { name: '花生', selected: false, cost: 1100, yield: 7500, carbon: 4200 },
      { name: '油菜', selected: false, cost: 780, yield: 6000, carbon: 3800 },
      { name: '高粱', selected: false, cost: 820, yield: 12000, carbon: 4800 }
    ],
    
    // 规划结果数据
    results: null,
    resultItems: [], // 用于在视图中展示的结果数组
    showResult: false,
    totalResultArea: 0,
    
    // 作物颜色配置
    cropColors: {
      x1: '#2ecc71', // 玉米
      x2: '#3498db', // 苜蓿
      x3: '#f1c40f', // 大豆
      x4: '#e74c3c', // 水稻
      x5: '#9b59b6', // 小麦
      x6: '#1abc9c', // 花生
      x7: '#d35400', // 油菜
      x8: '#34495e'  // 高粱
    },
    // 图例配置
    legendItems: [],
    // 参数填写说明
    tips: {
      totalArea: {
        range: '建议种植面积：10-1000亩',
        example: '参考示例：100亩（适合中小规模种植）',
        note: '请根据实际可耕种土地面积填写'
      },
      budget: {
        range: '建议投入资金：1万-100万元',
        example: '参考示例：5万元（适合中小规模投入）',
        note: '包括种子、化肥、农药等种植成本'
      }
    }
  },
  
  onLoad: function(options) {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      // 跳转到登录页面
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/login/login'
        });
      }, 1500);
      return;
    }
    
    // 获取地区选择和服务选择页面传递的参数
    if (options.province && options.city && options.district) {
      this.setData({
        selectedArea: {
          province: decodeURIComponent(options.province),
          city: decodeURIComponent(options.city),
          district: decodeURIComponent(options.district)
        }
      });
      console.log('已选择地区:', this.data.selectedArea);
      
      // 获取服务类型参数
      if (options.serviceType) {
        this.setData({
          selectedServiceType: decodeURIComponent(options.serviceType)
        });
        console.log('已选择服务类型:', this.data.selectedServiceType);
      }
      
      // 显示已选择的地区和服务类型
      wx.showToast({
        title: '已选择: ' + this.data.selectedArea.province + ' ' + this.data.selectedArea.city + ' ' + this.data.selectedArea.district,
        icon: 'none',
        duration: 2000
      });
    } else {
      // 如果没有地区参数，跳转到地区选择页面
      wx.navigateTo({
        url: '/pages/location-select/index'
      });
    }
  },
  
  // 处理总面积输入
  onTotalAreaInput: function(e) {
    this.setData({
      'formData.totalArea': e.detail.value
    });
  },
  
  // 处理预算输入
  onBudgetInput: function(e) {
    this.setData({
      'formData.budget': e.detail.value
    });
  },
  
  // 土壤类型选择变化处理
  soilTypeChange: function(e) {
    this.setData({
      soilTypeIndex: e.detail.value
    });
  },
  
  // 切换作物选择状态
  toggleCrop: function(e) {
    const index = e.currentTarget.dataset.index;
    const key = `crops[${index}].selected`;
    const currentValue = this.data.crops[index].selected;
    this.setData({
      [key]: !currentValue
    });
  },
  
  // 获取作物名称
  getCropName: function(cropKey) {
    const cropMap = {
      x1: '玉米',
      x2: '苜蓿',
      x3: '大豆',
      x4: '水稻',
      x5: '小麦',
      x6: '花生',
      x7: '油菜',
      x8: '高粱'
    };
    return cropMap[cropKey] || cropKey;
  },
  
  // 生成规划方案
  generatePlan: function() {
    // 验证输入
    if (!this.validateInput()) {
      return;
    }
    
    // 获取选中的作物
    const selectedCrops = this.data.crops.filter(crop => crop.selected);
    if (selectedCrops.length < 2) {
      wx.showToast({
        title: '请至少选择两种作物',
        icon: 'none'
      });
      return;
    }
    
    // 调用优化求解函数
    try {
      // 这里调用solver.js中的优化函数
      const results = solver.solveCropOptimization({
        totalArea: parseFloat(this.data.formData.totalArea),
        budget: parseFloat(this.data.formData.budget),
        soilType: this.data.soilTypes[this.data.soilTypeIndex],
        crops: selectedCrops
      });
      
      // 转换结果为视图可用格式
      const resultItems = [];
      let totalArea = 0;
      
      Object.keys(results).forEach((crop, index) => {
        const area = results[crop];
        resultItems.push({
          crop: crop,
          name: this.getCropName(crop),
          area: area.toFixed(2)
        });
        totalArea += area;
      });
      
      // 准备图例数据
      const legendItems = [];
      Object.keys(this.data.cropColors).forEach(crop => {
        if (results[crop] !== undefined) {
          legendItems.push({
            crop: crop,
            name: this.getCropName(crop),
            color: this.data.cropColors[crop]
          });
        }
      });
      
      this.setData({
        results: results,
        resultItems: resultItems,
        totalResultArea: totalArea.toFixed(2),
        showResult: true,
        legendItems: legendItems
      });
      
      // 绘制分布图
      setTimeout(() => {
        this.drawDistributionChart();
      }, 100);
    } catch (error) {
      console.error('优化计算错误:', error);
      wx.showToast({
        title: '计算出错，请检查输入参数',
        icon: 'none'
      });
    }
  },
  
  // 验证输入
  validateInput: function() {
    if (!this.data.formData.totalArea || this.data.formData.totalArea <= 0) {
      wx.showToast({
        title: '请输入有效的总面积',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.formData.budget || this.data.formData.budget <= 0) {
      wx.showToast({
        title: '请输入有效的预算',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },
  
  // 绘制分布图
  drawDistributionChart: function() {
    const query = wx.createSelectorQuery();
    query.select('#distributionChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = 300 * dpr;
        canvas.height = 300 * dpr;
        ctx.scale(dpr, dpr);

        // 清空画布
        ctx.clearRect(0, 0, 300, 300);

        // 生成块状区域
        const fragments = visualizer.generateVoronoi({
          width: 300,
          height: 300
        });

        // 块状颜色分配（确保最小显示单元）
        const coloredFragments = visualizer.allocateColors(fragments, this.data.results, {
          colors: this.data.cropColors
        });

        // 绘制分布图
        visualizer.drawDistribution(ctx, coloredFragments);
      });
  }
  },
  
  // 处理退出登录
  handleLogout: function() {
    // 清除本地存储
    wx.removeStorageSync('userInfo');
    
    // 显示提示
    wx.showToast({
      title: '已退出登录',
      icon: 'success',
      duration: 2000
    });
    
    // 跳转到登录页面
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }, 1500);
  }
});