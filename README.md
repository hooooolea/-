## 登录界面装饰图配置说明

### 更换装饰图片
1. 左侧装饰图路径：/static/left-deco.png
2. 右侧装饰图路径：/static/right-deco.png

### 调整图片尺寸（第12行附近CSS样式）
```css
.left-deco,
.right-deco {
    width: 160rpx;  /* 调整宽度值 */
    height: 160rpx; /* 调整高度值 */
}
```

### 注意事项
- 装饰图尺寸建议保持为logo图片的60%
- 图片格式推荐使用透明背景PNG
- 修改后需重新编译小程序生效