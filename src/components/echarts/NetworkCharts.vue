<script setup>
import { ref, watch, defineProps } from 'vue';
import ECharts from './ECharts.vue';

const data1 = ref([]);
const data2 = ref([]);

const props = defineProps({
    infos: Array
})

// 初始化数据
const initializeData = () => {
  props.infos.forEach(info => {
    data1.value.push([new Date(info.sample_time).getTime(), info.network_upload?.toFixed(2)]);
    data2.value.push([new Date(info.sample_time).getTime(), info.network_download?.toFixed(2)]);

  });
  
};

watch(() => props.infos, (newInfos) => {
  data1.value = []
  data2.value = []
  newInfos.forEach(info => {
    data1.value.push([new Date(info.sample_time).getTime(), info.network_upload?.toFixed(2)]);
    data2.value.push([new Date(info.sample_time).getTime(), info.network_download?.toFixed(2)]);

  });

  chartOptions.value.series[0].data = data1.value;
  chartOptions.value.series[1].data = data2.value;

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
      const upload = params[0]?.data[1] || 0;
      const download = params[1]?.data[1] || 0;
      return `上传: ${upload} MB/s<br>下载: ${download} MB/s`;
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
      fontWeight: '200', // 设置 y 轴数字字体加粗
      fontFamily: 'Arial', // 设置 y 轴数字字体
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
      name: '发送',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: 'yellow' // 设置线条颜色为黄色
      },
      data: data1.value
    },
    {
      name: '接收',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: 'rgba(6, 82, 198, 0.783)' // 设置线条颜色为黄色
      },
      data: data2.value
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
