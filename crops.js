// 作物数据库
export const crops = [
    {
        id: 1,
        name: '玉米',
        category: '粮食作物',
        cost: 900,
        yield: 21164,
        carbon: 6690,
        suitable_soil: ['黑土', '壤土'],
        growing_period: '120-140天',
        water_demand: '中等',
        description: '玉米是重要的粮食作物，适应性强，产量高'
    },
    {
        id: 2,
        name: '苜蓿',
        category: '饲料作物',
        cost: 720,
        yield: 7452,
        carbon: 2172,
        suitable_soil: ['壤土', '砂质土'],
        growing_period: '3-4年',
        water_demand: '低',
        description: '多年生豆科牧草，可固氮改良土壤'
    },
    {
        id: 3,
        name: '大豆',
        category: '经济作物',
        cost: 1005,
        yield: 9423,
        carbon: 5090,
        suitable_soil: ['黑土', '壤土'],
        growing_period: '90-120天',
        water_demand: '中等',
        description: '重要的油料作物，可固氮改良土壤'
    },
    {
        id: 4,
        name: '水稻',
        category: '粮食作物',
        cost: 1200,
        yield: 18000,
        carbon: 5500,
        suitable_soil: ['粘土'],
        growing_period: '120-140天',
        water_demand: '高',
        description: '主要粮食作物，需水量大'
    },
    {
        id: 5,
        name: '小麦',
        category: '粮食作物',
        cost: 850,
        yield: 15000,
        carbon: 4800,
        suitable_soil: ['壤土', '黑土'],
        growing_period: '200-240天',
        water_demand: '中等',
        description: '重要的粮食作物，适应性强'
    }
]; 