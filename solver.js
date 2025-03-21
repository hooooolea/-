/**
 * 作物种植优化算法
 * 将Python的PuLP线性规划算法转换为JavaScript实现
 */

/**
 * 求解作物种植面积优化问题
 * @param {Object} params - 优化参数
 * @param {number} params.totalArea - 总种植面积(亩)
 * @param {number} params.budget - 种植预算(元)
 * @param {number} params.profitTarget - 经济效益目标(元)
 * @param {string} params.soilType - 土壤类型
 * @param {Array} params.crops - 作物数据数组
 * @param {Array} params.requirements - 规划要求数组
 * @returns {Object} 优化结果，包含各作物的种植面积和经济指标
 */
export function solveCropOptimization(params) {
  // 解构参数
  const { totalArea, budget, profitTarget, soilType, crops, requirements = [] } = params;
  
  // 根据土壤类型调整系数
  const soilFactors = {
    '黑土': { yieldRate: 1.2, cost: 0.9 },
    '砂质土': { yieldRate: 0.8, cost: 1.1 },
    '粘土': { yieldRate: 0.9, cost: 1.0 },
    '壤土': { yieldRate: 1.0, cost: 1.0 }
  };
  
  const factor = soilFactors[soilType] || soilFactors['壤土'];
  
  // 根据规划要求调整系数
  const requirementFactors = {
    eco: { yieldRate: 0.9, cost: 1.1, price: 1.2 }, // 环保要求：产量降低，成本增加，价格提升
    labor: { yieldRate: 0.95, cost: 0.9 }, // 劳动力限制：产量略降，成本降低
    market: { yieldRate: 1.0, price: 1.1 }, // 市场需求：价格提升
    tech: { yieldRate: 1.1, cost: 1.05 } // 技术水平：产量提升，成本略增
  };
  
  // 计算综合调整系数
  let yieldFactor = 1.0;
  let costFactor = 1.0;
  let priceFactor = 1.0;
  
  requirements.forEach(req => {
    if (requirementFactors[req]) {
      const { yieldRate = 1.0, cost = 1.0, price = 1.0 } = requirementFactors[req];
      yieldFactor *= yieldRate;
      costFactor *= cost;
      priceFactor *= price;
    }
  });
  
  // 应用土壤和要求的综合系数
  yieldFactor *= factor.yieldRate;
  costFactor *= factor.cost;
  
  // 计算总成本和产量
  let totalCost = 0;
  let totalYield = 0;
  let totalProfit = 0;
  
  // 根据作物数据和约束条件计算初始分配
  const selectedCrops = crops.filter(crop => crop.selected);
  
  // 基于比例关系的简化计算
  const cropRatios = {
    '玉米': 7.2,
    '苜蓿': 1,
    '大豆': 1.95
  };
  
  // 计算总比例
  let totalRatio = 0;
  selectedCrops.forEach(crop => {
    if (cropRatios[crop.name]) {
      totalRatio += cropRatios[crop.name];
    }
  });
  
  // 根据比例分配面积
  const results = {};
  
  let allocatedArea = 0;
  
  selectedCrops.forEach(crop => {
    const ratio = cropRatios[crop.name] || 1;
    const area = parseFloat(((ratio / totalRatio) * totalArea).toFixed(2));
    
    results[crop.id] = area;
    
    allocatedArea += area;
    
    // 计算成本、产量和收益
    const cropCost = crop.cost * area * costFactor;
    const cropYield = crop.yield * area * yieldFactor;
    const cropPrice = crop.price * priceFactor;
    const cropProfit = cropYield * cropPrice - cropCost;
    
    totalCost += cropCost;
    totalYield += cropYield;
    totalProfit += cropProfit;
  });
  
  // 确保总面积不超过限制
  if (allocatedArea > totalArea) {
    const scaleFactor = totalArea / allocatedArea;
    Object.keys(results).forEach(key => {
      results[key] = parseFloat((results[key] * scaleFactor).toFixed(2));
    });
  }
  
  // 确保总成本不超过预算
  if (totalCost > budget) {
    const scaleFactor = budget / totalCost;
    Object.keys(results).forEach(key => {
      results[key] = parseFloat((results[key] * scaleFactor).toFixed(2));
    });
  }
  
  // 如果设置了经济效益目标，尝试调整以达到目标
  if (profitTarget && totalProfit < profitTarget) {
    // 根据收益潜力调整分配
    const profitPotentials = selectedCrops.map(crop => ({
      id: crop.id,
      potential: (crop.price * priceFactor * crop.yield * yieldFactor - crop.cost * costFactor) / crop.cost
    }));
    
    // 按收益潜力排序
    profitPotentials.sort((a, b) => b.potential - a.potential);
    
    // 逐步调整分配比例
    const adjustmentFactor = Math.min(1.2, profitTarget / totalProfit);
    profitPotentials.forEach(({ id }, index) => {
      if (index < Math.ceil(profitPotentials.length / 2)) {
        results[id] = parseFloat((results[id] * adjustmentFactor).toFixed(2));
      } else {
        results[id] = parseFloat((results[id] / adjustmentFactor).toFixed(2));
      }
    });
  }
  
  // 添加经济指标到结果中
  results.metrics = {
    totalCost,
    totalYield,
    totalProfit,
    profitRate: (totalProfit / totalCost * 100).toFixed(2) + '%',
    requirementEffects: {
      yieldFactor: yieldFactor.toFixed(2),
      costFactor: costFactor.toFixed(2),
      priceFactor: priceFactor.toFixed(2)
    }
  };
  
  return results;
}

/**
 * 生成作物分布图数据
 * 注意：在小程序中，我们使用Canvas直接绘制，不需要此函数
 * 此函数保留作为参考，实际绘图在页面组件中完成
 */
export function generateDistributionData(areas) {
  // 在小程序中，我们直接在页面组件中使用Canvas API绘制
  // 此函数仅作为参考，实际未使用
  return areas;
}
