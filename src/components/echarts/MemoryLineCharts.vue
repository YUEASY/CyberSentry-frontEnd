<script setup>
import { ref, watch, defineProps } from 'vue';
import ECharts from './ECharts.vue';

const data = ref([]);

const props = defineProps({
    infos: Array
})

// 初始化数据
const initializeData = () => {
  props.infos.forEach(info => {
    data.value.push([new Date(info.sample_time).getTime(), (info.memory_usage / 1024)?.toFixed(2)]);
  });
  
};

watch(() => props.infos, (newInfos) => {
  data.value = []

  newInfos.forEach(info => {
    data.value.push([new Date(info.sample_time).getTime(), (info.memory_usage / 1024)?.toFixed(2)]);
  });

  chartOptions.value.series[0].data = data.value;
}, { deep: true });

// 初始化数据
initializeData();

// 设置图表选项
const chartOptions = ref({
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      return [pt[0], '10%'];
    },
    formatter: function (params) {
      const value = params[0].data[1];
      return `${value} G`;
    }
  },
  xAxis: {
    type: 'time',
    boundaryGap: false,
    show: false
  },
  yAxis: {
    max: 16,
    type: 'value',
    boundaryGap: [0, '100%'],
    axisLabel: {
      color: 'white', // 设置 y 轴数字颜色为白色
      fontSize: 12, // 设置 y 轴数字字体大小
      fontWeight: 'bold', // 设置 y 轴数字字体加粗
      fontFamily: 'Arial', // 设置 y 轴数字字体
      formatter: '{value}G' // 显示为百分比
    },
    splitLine: {
      show: true, // 显示网格线
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)', // 让网格线变淡 (白色, 透明度 0.2)
        width: 1 // 细一点
      }
    }
  },
  series: [
    {
      name: '占用',
      type: 'line',
      smooth: true,
      symbol: 'none',
      areaStyle: {
      color: 'rgba(6, 82, 198, 0.783)'
      },
      data: data.value
    }
  ]
});

</script>

<template>
  <ECharts 
    :options="chartOptions" 
    width="100%" 
    height="233px"
    custom-class="custom-chart"
    :custom-style="{}"
  />
</template>

<style scoped>
.custom-chart {
    background-color: transparent;
    /* box-shadow: 0 4px 8px rgba(72, 71, 71, 0.393); 添加阴影 */

}
</style>
