<template>
  <view class="container">
    <area-selector 
      :region="selectedRegion"
      @change="handleRegionChange"
    />
  </view>
</template>

<script>
import AreaSelector from '@/components/AreaSelector.vue'

export default {
  components: {
    AreaSelector
  },
  data() {
    return {
      selectedRegion: []
    }
  },
  methods: {
    handleRegionChange(region) {
      this.selectedRegion = region
      uni.navigateBack()
    }
  }
}
</script>

<style>
.container {
  /* 样式定义 */
}
</style>