<script setup>
import { ref, onMounted } from 'vue';
import ECharts from './ECharts.vue';

const oneSecond = 1000;
const fiveSeconds = 5 * oneSecond;
const data = ref([]);

// 初始化数据
const initializeData = () => {
  const now = +new Date();
  data.value = [[now, Math.random() * 300]];
};

// 更新数据
const updateData = () => {
  const now = +new Date();
  data.value.push([now, Math.round((Math.random() - 0.5) * 20 + data.value[data.value.length - 1][1])]);
  if (data.value.length > 20000) {
    data.value.shift();
  }
};

// 初始化数据
initializeData();

// 设置图表选项
const chartOptions = ref({
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      return [pt[0], '10%'];
    }
  },
  xAxis: {
    type: 'time',
    boundaryGap: false,
    show: false
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '100%'],
    axisLabel: {
      color: 'white', // 设置 y 轴数字颜色为红色
      fontSize: 12, // 设置 y 轴数字字体大小
      fontWeight: 'bold', // 设置 y 轴数字字体加粗
      fontFamily: 'Arial', // 设置 y 轴数字字体
      }
  },
  series: [
    {
      name: '占用',
      type: 'line',
      smooth: true,
      symbol: 'none',
      areaStyle: {
        color: 'rgba(246, 209, 91, 1.00)'

      },      
      lineStyle: {
        color: 'yellow' // 设置线条颜色为黄色
      },
      data: data.value
    }
  ]
});

// 每5秒更新一次数据
onMounted(() => {
  setInterval(() => {
    updateData();
    chartOptions.value.series[0].data = data.value;
  }, fiveSeconds);
});
</script>

<template>
  <ECharts 
    :options="chartOptions" 
    width="500px" 
    height="220px"
    custom-class="custom-chart"
    name="cpu"
    :custom-style="{}"
  />
</template>

<style scoped>
.custom-chart {
    background-color: transparent;
    box-shadow: 0 4px 8px rgba(72, 71, 71, 0.393); /* 添加阴影 */

}
</style>
