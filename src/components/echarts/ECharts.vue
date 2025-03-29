<script setup>
import { onMounted, onUnmounted, ref, watch, computed, defineProps } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  options: Object, // ECharts 配置
  theme: String,   // 主题（light/dark）
  width: { type: String, default: '100%' }, // 图表宽度
  height: { type: String, default: '400px' }, // 图表高度
  customClass: { type: String, default: '' }, // 允许传入自定义 class
  customStyle: { type: Object, default: () => ({}) }, // 允许传入自定义 style
});

const chartRef = ref(null);
let chartInstance = null;

// 初始化 ECharts
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value, props.theme || 'light');
    if (props.options) {
      chartInstance.setOption(props.options);
    }
  }
};

// 监听窗口变化，自动调整大小
const resizeChart = () => {
  chartInstance?.resize();
};

// 监听 `options` 变化，更新图表
watch(() => props.options, (newOptions) => {
  if (chartInstance && newOptions) {
    chartInstance.setOption(newOptions);
  }
}, { deep: true });

onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  chartInstance?.dispose();
});

// 计算 `div` 的动态样式
const chartStyles = computed(() => ({
  width: props.width,
  height: props.height,
  ...props.customStyle
}));
</script>

<template>
  <div
    :class="['echart-container', customClass]"
    :style="chartStyles"
  >
  <div
  :style="chartStyles"

  ref="chartRef"></div>
</div>
</template>

<style>
.echart-container {
  min-width: 300px;
  min-height: 160px;
  background-color: transparent;

}
.echart-name {
  font-size: 24px;
  font-weight: 500px;
  color: white;
  padding-top: 10px;
  padding-left: 10px;
}
</style>
