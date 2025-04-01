<script setup>
import { ref, watch, defineProps } from 'vue';
import ECharts from './ECharts.vue';

const data = ref({});

const batteryFlagMap = [
    {type: '电池电量高', value: 90},
    {type: '电池电量低', value: 45},
    {type: '电池电量危急', value: 20},
    {type: '电池充电中', value: 100},
    {type: '无电池', value: 10},
    {type: '电池状态未知', value: 0},
    {type: '未知电池标志', value: 0},
]

const check = (a) => {
    console.log("a", a)
    return batteryFlagMap.find(t => t.type === a) || {type: '电池电量高', value: 99};
};

const props = defineProps({
    infos: Array
})

// 初始化数据
const initializeData = () => {
    data.value = props.infos && props.infos.length > 0 
        ? check(props.infos.at(props.infos.length - 1)?.battery_flag_raw) 
        : { type: '电池状态未知', value: 0 };

};

watch(() => props.infos, (newInfos) => {

    data.value = newInfos && newInfos.length > 0 
        ? check(newInfos.at(newInfos.length - 1)?.battery_flag_raw) 
        : { type: '电池状态未知', value: 0 };


    chartOptions.value.series[0].detail.formatter(data.value.type);
    chartOptions.value.series[0].data[0].value = data.value.value;
}, { deep: true });


// 初始化数据
initializeData();

// 设置图表选项
const chartOptions = ref({
    series: [
    {
      type: 'gauge',
      min: 0,
      max: 240,
      itemStyle: {
        color: '#58D9F9',
        shadowColor: 'rgba(0,138,255,0.45)',
        shadowBlur: 10,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      progress: {
        show: true,
        roundCap: true,
        width: 10
      },
      pointer: {
        icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
        length: '75%',
        width: 10,
      },
      axisLine: {
        roundCap: true,
        lineStyle: {
          width: 10
        }
      },
      axisLabel: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      title: {
        show: false
      },
      detail: {
        offsetCenter: [0, '50%'],
        valueAnimation: true,
        formatter: function (name) {
          return name ?? data.value.type;
        },
      },
      data: [
        {
          value: data.value.value
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
    color: rgba(6, 82, 198, 0.783);
    /* box-shadow: 0 4px 8px rgba(72, 71, 71, 0.393); 添加阴影 */

}
</style>
