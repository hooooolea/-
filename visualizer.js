/**
 * 可视化工具类
 * 提供基础的绘图功能
 */

/**
 * 毫米级面积分配算法
 * @param {Object} grid - 网格对象
 * @param {Object} results - 目标面积分配结果
 * @returns {Object} 分配结果
 */
function precisionAllocate(grid, results) {
  const totalArea = grid.cells.reduce((sum, c) => sum + c.area, 0);
  const targets = Object.entries(results).map(([crop, area]) => ({
    crop,
    target: area,
    current: 0,
    error: 0 // 累积误差
  }));
  
  // 按随机顺序遍历单元格
  const shuffledCells = shuffle([...grid.cells]);
  
  // 动态补偿分配算法
  shuffledCells.forEach(cell => {
    // 计算每个作物的需求度
    const demands = targets.map(t => {
      const ideal = t.target - t.current;
      return (ideal + t.error) / t.target;
    });
    
    // 选择需求度最高的作物
    const maxIndex = demands.indexOf(Math.max(...demands));
    const target = targets[maxIndex];
    
    // 分配单元格
    cell.crop = target.crop;
    target.current += cell.area;
    
    // 计算并累积误差
    const idealIncrement = target.target - (target.current - cell.area);
    target.error += idealIncrement - cell.area;
  });

  // 最终误差修正（确保小数点两位精度）
  targets.forEach(t => {
    t.current = Number(t.current.toFixed(4)); // 保留四位小数进行中间计算
  });
  
  return { grid, targets };
}

/**
 * 数组随机化
 * @param {Array} array - 输入数组
 * @returns {Array} 随机化后的数组
 */
function shuffle(array) {
  for(let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * 生成田地形状（保持原有功能）
 * @param {number} totalArea - 总面积
 * @returns {Array} 多边形顶点数组
 */
export function createFieldShape(totalArea) {
  const points = [];
  const center = {x: 150, y: 150}; // 画布中心
  const numPoints = 10;
  
  for(let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const radius = 80 + Math.random() * 40;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    });
  }
  
  // 面积缩放
  const currentArea = calculatePolygonArea(points);
  const scaleFactor = Math.sqrt(totalArea / currentArea);
  return points.map(p => ({
    x: (p.x - center.x) * scaleFactor + center.x,
    y: (p.y - center.y) * scaleFactor + center.y
  }));
}

/**
 * 创建基础农田形状
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 * @returns {Object} 农田形状对象
 */
function createBaseFieldShape(width, height) {
  const center = {x: width/2, y: height/2};
  const points = [];
  const numPoints = 10;
  
  // 创建不规则多边形
  for(let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // 使用不同的随机因子创建更自然的形状
    const radius = (width * 0.4) * (0.8 + Math.random() * 0.4);
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    });
  }
  
  return {
    center,
    points,
    bounds: {
      minX: Math.min(...points.map(p => p.x)),
      minY: Math.min(...points.map(p => p.y)),
      maxX: Math.max(...points.map(p => p.x)),
      maxY: Math.max(...points.map(p => p.y))
    }
  };
}

/**
 * 计算多边形面积
 * @param {Array} points - 多边形顶点数组
 * @returns {number} 面积
 */
function calculatePolygonArea(points) {
  let area = 0;
  const n = points.length;
  
  for(let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  
  return Math.abs(area) / 2;
}

/**
 * 生成简化的区块分布
 * @param {Object} options - 配置选项
 * @param {number} options.width - 画布宽度
 * @param {number} options.height - 画布高度
 * @returns {Array} 区块数组
 */
export function generateVoronoi(options) {
  const { width, height } = options;
  const blocks = [];
  const gridSize = Math.min(width, height) / 6;
  
  // 使用简单的网格划分代替Voronoi图
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      blocks.push({
        centerX: x + gridSize/2,
        centerY: y + gridSize/2,
        vertices: [
          {x: x, y: y},
          {x: x + gridSize, y: y},
          {x: x + gridSize, y: y + gridSize},
          {x: x, y: y + gridSize}
        ],
        area: (gridSize * gridSize) / (width * height)
      });
    }
  }
  
  // 添加边界点，确保Voronoi图覆盖整个农田形状
  const boundaryPoints = [];
  const numBoundaryPoints = 32; // 进一步的边界点数量以获得更平滑的边界
  
  for (let i = 0; i < numBoundaryPoints; i++) {
    const angle = (i / numBoundaryPoints) * Math.PI * 2;
    const radius = Math.max(width, height) * 0.9;
    boundaryPoints.push({
      x: width/2 + radius * Math.cos(angle),
      y: height/2 + radius * Math.sin(angle)
    });
  }
  
  // 添加额外的内部点，确保没有空白区域
  const extraPoints = [];
  const numExtraPoints = 15;
  
  for (let i = 0; i < numExtraPoints; i++) {
    // 在中心区域添加更多点
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.min(width, height) * 0.3 * Math.random();
    extraPoints.push({
      x: width/2 + radius * Math.cos(angle),
      y: height/2 + radius * Math.sin(angle)
    });
  }
  
  // 合并所有点
  const allPoints = [...points, ...extraPoints, ...boundaryPoints];
  
  // 计算Voronoi图
  const polygons = computeVoronoiPolygons(allPoints, width, height);
  
  // 裁剪多边形，确保它们在农田形状内
  const clippedPolygons = polygons.filter(poly => {
    // 只保留中心点在画布范围内的多边形
    return poly.centerX >= 0 && poly.centerX <= width && 
           poly.centerY >= 0 && poly.centerY <= height;
  });
  
  // 随机打乱多边形的顺序，以便后续分配
  return shuffle(clippedPolygons);
}

/**
 * 计算Voronoi多边形
 * @param {Array} points - 种子点数组
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 * @returns {Array} 多边形数组
 */
function computeVoronoiPolygons(points, width, height) {
  const polygons = [];
  
  // 为每个点计算其Voronoi单元
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    
    // 跳过边界点生成的多边形
    if (point.x <= 0 || point.y <= 0 || point.x >= width || point.y >= height) {
      continue;
    }
    
    // 计算该点的Voronoi多边形
    const vertices = [];
    
    // 对于每个点，我们找到与其他点的垂直平分线，并计算它们的交点
    // 这些交点构成了Voronoi多边形的顶点
    
    // 简化版：我们使用固定数量的方向来近似Voronoi多边形
    const numDirections = 16; // 增加方向数量以获得更精确的多边形
    const maxDistance = Math.max(width, height) * 2;
    
    for (let dir = 0; dir < numDirections; dir++) {
      const angle = (dir / numDirections) * Math.PI * 2;
      let minDist = maxDistance;
      let closestIntersection = null;
      
      // 沿着这个方向，找到最近的垂直平分线
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        
        const otherPoint = points[j];
        
        // 计算两点之间的中点（垂直平分线经过此点）
        const midX = (point.x + otherPoint.x) / 2;
        const midY = (point.y + otherPoint.y) / 2;
        
        // 计算从point到otherPoint的向量，然后旋转90度得到垂直平分线的方向
        const dx = otherPoint.x - point.x;
        const dy = otherPoint.y - point.y;
        const perpX = -dy;
        const perpY = dx;
        
        // 计算从当前点沿angle方向的射线与垂直平分线的交点
        const rayX = point.x + Math.cos(angle);
        const rayY = point.y + Math.sin(angle);
        
        // 计算交点（使用线性代数）
        const t = ((midX - point.x) * perpY - (midY - point.y) * perpX) /
                 ((rayX - point.x) * perpY - (rayY - point.y) * perpX);
        
        if (t > 0) { // 确保交点在射线的正方向
          const intersectX = point.x + t * (rayX - point.x);
          const intersectY = point.y + t * (rayY - point.y);
          
          // 计算交点到当前点的距离
          const dist = Math.sqrt(
            Math.pow(intersectX - point.x, 2) + 
            Math.pow(intersectY - point.y, 2)
          );
          
          // 保留最近的交点
          if (dist < minDist) {
            minDist = dist;
            closestIntersection = { x: intersectX, y: intersectY };
          }
        }
      }
      
      // 添加找到的交点
      if (closestIntersection) {
        vertices.push(closestIntersection);
      }
    }
    
    // 按照极角排序顶点，确保多边形是凸的
    if (vertices.length > 2) {
      vertices.sort((a, b) => {
        return Math.atan2(a.y - point.y, a.x - point.x) - 
               Math.atan2(b.y - point.y, b.x - point.x);
      });
      
      // 裁剪多边形，确保在画布范围内
      const clippedVertices = clipPolygonToCanvas(vertices, width, height);
      
      if (clippedVertices.length > 2) {
        // 计算多边形面积
        const area = calculatePolygonArea(clippedVertices);
        const normalizedArea = area / (width * height);
        
        polygons.push({
          vertices: clippedVertices,
          centerX: point.x,
          centerY: point.y,
          area: normalizedArea
        });
      }
    }
  }
  
  return polygons;
}

/**
 * 将多边形裁剪到画布范围内
 * @param {Array} vertices - 多边形顶点
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 * @returns {Array} 裁剪后的顶点
 */
function clipPolygonToCanvas(vertices, width, height) {
  // 简单裁剪：将超出画布的顶点移动到边界上
  return vertices.map(v => ({
    x: Math.max(0, Math.min(width, v.x)),
    y: Math.max(0, Math.min(height, v.y))
  }));
}

/**
 * 简化的颜色分配
 * @param {Array} blocks - 区块数组
 * @param {Object} results - 面积分配结果
 * @param {Object} options - 配置选项
 * @param {Object} options.colors - 颜色映射
 * @returns {Array} 带颜色的区块数组
 */
export function allocateColors(blocks, results, options) {
  const { colors } = options;
  const totalArea = Object.values(results).reduce((a, b) => a + b, 0);
  const crops = Object.keys(results);
  
  // 简单地按比例分配区块
  blocks.forEach((block, index) => {
    const cropIndex = Math.floor(index / blocks.length * crops.length);
    const crop = crops[cropIndex];
    block.crop = crop;
    block.color = colors[crop] || '#cccccc';
  });
  
  // 调整总区块数以匹配可用区块
  const cropAllocations = crops.map(crop => ({
    crop,
    targetArea: results[crop],
    currentArea: 0,
    blocks: [],
    color: colors[crop] || '#cccccc'
  }));
  
  const totalBlocks = cropAllocations.reduce((sum, crop) => sum + crop.blockCount, 0);
  if (totalBlocks > blocks.length) {
    // 按比例缩减
    const ratio = blocks.length / totalBlocks;
    cropAllocations.forEach(crop => {
      crop.blockCount = Math.max(1, Math.floor(crop.blockCount * ratio));
    });
  }
  
  // 按面积大小排序区块（从大到小）
  const sortedBlocks = [...blocks].sort((a, b) => b.area - a.area);
  
  // 为每种作物选择种子区块（从最大的区块开始）
  cropAllocations.sort((a, b) => b.targetArea - a.targetArea);
  for (let i = 0; i < cropAllocations.length && i < sortedBlocks.length; i++) {
    const crop = cropAllocations[i];
    const block = sortedBlocks[i];
    
    crop.blocks.push(block);
    crop.currentArea += block.area;
    block.assigned = true;
    block.crop = crop.crop;
    block.color = crop.color;
  }
  
  // 按照区块的邻近性分配剩余区块
  // 首先，为每个区块计算到已分配区块的距离
  const unassignedBlocks = sortedBlocks.filter(block => !block.assigned);
  
  // 为每个作物分配剩余区块，优先分配给距离最近的作物区块
  while (unassignedBlocks.length > 0) {
    // 找出分配比例最低的作物
    cropAllocations.sort((a, b) => 
      (a.currentArea / a.targetArea) - (b.currentArea / b.targetArea)
    );
    
    const crop = cropAllocations[0];
    
    // 如果已经达到或超过目标面积，跳过
    if (crop.currentArea >= crop.targetArea && cropAllocations.every(c => c.currentArea >= c.targetArea)) {
      break;
    }
    
    // 找到距离当前作物已分配区块最近的未分配区块
    let closestBlockIndex = -1;
    let minDistance = Infinity;
    
    for (let i = 0; i < unassignedBlocks.length; i++) {
      const block = unassignedBlocks[i];
      
      // 计算到当前作物已分配区块的最小距离
      let blockMinDistance = Infinity;
      for (const assignedBlock of crop.blocks) {
        const distance = Math.sqrt(
          Math.pow(block.centerX - assignedBlock.centerX, 2) +
          Math.pow(block.centerY - assignedBlock.centerY, 2)
        );
        blockMinDistance = Math.min(blockMinDistance, distance);
      }
      
      if (blockMinDistance < minDistance) {
        minDistance = blockMinDistance;
        closestBlockIndex = i;
      }
    }
    
    // 分配最近的区块
    if (closestBlockIndex !== -1) {
      const block = unassignedBlocks[closestBlockIndex];
      crop.blocks.push(block);
      crop.currentArea += block.area;
      block.assigned = true;
      block.crop = crop.crop;
      block.color = crop.color;
      
      // 从未分配列表中移除
      unassignedBlocks.splice(closestBlockIndex, 1);
    } else {
      // 如果没有找到合适的区块，跳出循环
      break;
    }
  }
  
  // 如果还有未分配的区块，按比例分配给各作物
  if (unassignedBlocks.length > 0) {
    cropAllocations.sort((a, b) => 
      (a.currentArea / a.targetArea) - (b.currentArea / b.targetArea)
    );
    
    for (const block of unassignedBlocks) {
      const crop = cropAllocations[0]; // 取分配比例最低的作物
      crop.blocks.push(block);
      crop.currentArea += block.area;
      block.assigned = true;
      block.crop = crop.crop;
      block.color = crop.color;
      
      // 重新排序作物，确保分配均衡
      cropAllocations.sort((a, b) => 
        (a.currentArea / a.targetArea) - (b.currentArea / b.targetArea)
      );
    }
  }
  
  // 合并所有区块并返回
  return blocks.map(block => ({
    ...block,
    crop: block.crop,
    color: block.color
  }));
}

/**
 * 绘制多边形分布图
 * @param {Object} ctx - Canvas上下文
 * @param {Array} coloredBlocks - 带颜色的多边形区块数组
 */
export function drawDistribution(ctx, coloredBlocks) {
  // 清空画布
  ctx.clearRect(0, 0, 300, 300);
  
  // 绘制每个区块
  for (const block of coloredBlocks) {
    if (block && block.vertices && block.vertices.length > 2) {
      // 设置填充颜色
      ctx.setFillStyle(block.color || '#cccccc');
      ctx.setStrokeStyle('#ffffff');
      ctx.setLineWidth(1);
      
      // 开始绘制路径
      ctx.beginPath();
      
      // 移动到第一个顶点
      ctx.moveTo(block.vertices[0].x, block.vertices[0].y);
      
      // 连接其他顶点
      for (let i = 1; i < block.vertices.length; i++) {
        ctx.lineTo(block.vertices[i].x, block.vertices[i].y);
      }
      
      // 闭合路径
      ctx.closePath();
      
      // 填充和描边
      ctx.fill();
      ctx.stroke();
    }
  }
}



/**
 * 绘制坐标系
 * @param {Object} ctx - Canvas上下文
 * @param {number} x - 坐标系左上角X坐标
 * @param {number} y - 坐标系左上角Y坐标
 * @param {number} width - 坐标系宽度
 * @param {number} height - 坐标系高度
 */
function drawCoordinateSystem(ctx, x, y, width, height) {
  const axisColor = '#888888';
  const textColor = '#555555';
  const gridColor = '#eeeeee';
  
  // 设置绘图样式
  ctx.setGlobalAlpha(1.0);
  ctx.setLineWidth(1);
  ctx.setFontSize(10);
  ctx.setTextAlign('center');
  ctx.setTextBaseline('middle');
  
  // 绘制网格线
  ctx.setStrokeStyle(gridColor);
  ctx.setLineWidth(0.5);
  
  // 水平网格线
  for (let i = 0; i <= 4; i++) {
    const yPos = y + height * i / 4;
    ctx.beginPath();
    ctx.moveTo(x, yPos);
    ctx.lineTo(x + width, yPos);
    ctx.stroke();
  }
  
  // 垂直网格线
  for (let i = 0; i <= 4; i++) {
    const xPos = x + width * i / 4;
    ctx.beginPath();
    ctx.moveTo(xPos, y);
    ctx.lineTo(xPos, y + height);
    ctx.stroke();
  }
  
  // 绘制坐标轴
  ctx.setStrokeStyle(axisColor);
  ctx.setLineWidth(1);
  
  // X轴
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
  
  // Y轴
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  // 绘制刻度和标签
  ctx.setFillStyle(textColor);
  
  // X轴刻度和标签
  for (let i = 0; i <= 4; i++) {
    const xPos = x + width * i / 4;
    const value = -2 + i;
    
    // 刻度线
    ctx.beginPath();
    ctx.moveTo(xPos, y + height);
    ctx.lineTo(xPos, y + height + 5);
    ctx.stroke();
    
    // 标签
    ctx.fillText(value.toString(), xPos, y + height + 12);
  }
  
  // Y轴刻度和标签
  for (let i = 0; i <= 4; i++) {
    const yPos = y + height - height * i / 4;
    const value = -2 + i;
    
    // 刻度线
    ctx.beginPath();
    ctx.moveTo(x, yPos);
    ctx.lineTo(x - 5, yPos);
    ctx.stroke();
    
    // 标签
    ctx.setTextAlign('right');
    ctx.fillText(value.toString(), x - 8, yPos);
    ctx.setTextAlign('center');
  }
  
  // 添加坐标轴标题
  ctx.setFontSize(12);
  ctx.fillText('X', x + width + 15, y + height);
  ctx.fillText('Y', x, y - 15);
}

/**
 * 绘制单个多边形区块
 * @param {Object} ctx - Canvas上下文
 * @param {Object} block - 多边形区块对象 */
export function drawFragment(ctx, block) {
  if (!block.crop || !block.color || !block.vertices || block.vertices.length < 3) return;
  
  ctx.setFillStyle(block.color);
  ctx.beginPath();
  ctx.moveTo(block.vertices[0].x, block.vertices[0].y);
  
  // 绘制多边形路径
  for (let i = 1; i < block.vertices.length; i++) {
    ctx.lineTo(block.vertices[i].x, block.vertices[i].y);
  }
  
  ctx.closePath();
  ctx.fill();
}
