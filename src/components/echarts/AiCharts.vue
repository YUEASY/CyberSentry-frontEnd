<script setup>
import { ref, onMounted } from 'vue';
import ECharts from './ECharts.vue';
import { useAiAResStore } from '@/stores/aiAres';
import { useUserStore } from '@/stores/user';

const data = ref([]);

const aiAres = useAiAResStore()
const user = useUserStore()
// 初始化数据
const initializeData = () => {
    const datas = aiAres.aiAnalysisResUserId(user.user_id)
    if (Array.isArray(datas)) {
        datas.forEach(d => {
            data.value.push([d.analysis_time, d.score]);
        });
    }
};

onMounted(() => {
    initializeData();

    setInterval(async () => {
        const datas = await aiAres.aiAnalysisResUserId(user.user_id)
        data.value = []
        if (Array.isArray(datas)) {
        datas.forEach(d => {
            data.value.push([d.analysis_time, d.score]);
        });
    }

    }, 1000 * 15 * 1);
})

// 设置图表选项
const chartOptions = ref({
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      return [pt[0], '10%'];
    },
    formatter: function (params) {
        const value = params[0].data[1];
      const time = params[0].data[0]; // X 轴时间
      return `时间：${time}<br>分数：${value}`;
    }
  },
  grid: {
    left: '10%',
    right: '10%',
    top: '10%',
    bottom: '10%'
  },
  xAxis: {
    type: 'time',
    axisLine: { show: true },  
    axisLabel: {
      color: 'white' ,
      formatter: (value) => {
        return new Date(value).toLocaleTimeString(); 
      }
    },
    splitLine: { show: false } 
  },
  yAxis: {
    axisLine: { show: true },  
    axisLabel: {
      color: 'white' // 设置 Y 轴数字颜色
    },
    splitLine: { show: false } 
  },
series: [
    {
        symbolSize: 20,
        data: data.value,
        type: 'scatter',
        itemStyle: {
            color: 'rgba(233, 220, 167, 0.877)' // 设置球体颜色为蓝色
        }
    }
]
});

</script>

<template>
  <ECharts 
    :options="chartOptions" 
    width="100%" 
    height="300px"
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
