<script setup>
import { ref, defineProps } from 'vue';
import ECharts from './ECharts.vue';
import { watch } from 'vue';

const data = ref(10);

const props = defineProps({
    infos: Array
})

// 初始化数据
const initializeData = () => {
     data.value = props.infos && props.infos.length > 0 
        ? props.infos.at(props.infos.length - 1).temperature
        : 0
};

watch(() => props.infos, (newInfos) => {

    data.value = newInfos && newInfos.length > 0 
        ? newInfos.at(newInfos.length - 1).temperature
        : 3

    chartOptions.value.series[0].data[0].value = data.value;
    chartOptions.value.series[1].data[0].value = data.value;

}, { deep: true });


// 初始化数据
initializeData();

// 设置图表选项
const chartOptions = ref({
    series: [
    {
      type: 'gauge',
      center: ['50%', '60%'],
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 12,
      itemStyle: {
        color: '#FFAB91'
      },
      progress: {
        show: true,
        width: 10
      },
      pointer: {
        show: false
      },
      axisLine: {
        lineStyle: {
          width: 10
        }
      },
      axisTick: {
        distance: -18,
        splitNumber: 5,
        lineStyle: {
          width: 2,
          color: '#999'
        }
      },
      splitLine: {
        distance: -30,
        length: 7,
        lineStyle: {
          width: 2,
          color: '#999'
        }
      },
      axisLabel: {
        show: false
      },
      anchor: {
        show: false
      },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '5%'],
        formatter: '{value} °C',
        color: 'inherit'
      },
      data: [
        {
          value: data.value
        }
      ]
    },
    {
      type: 'gauge',
      center: ['50%', '60%'],
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      itemStyle: {
        color: '#FD7347'
      },
      progress: {
        show: true,
        width: 3
      },
      pointer: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      detail: {
        show: false
      },
      data: [
        {
          value: data.value
        }
      ]
    }
  ]
});

</script>

<template>
  <ECharts 
    :options="chartOptions" 
    width="100%" 
    height="200px"
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
