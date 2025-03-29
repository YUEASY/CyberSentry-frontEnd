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
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    top: 80,
    bottom: 30
  },
  xAxis: {
    type: 'value',
    position: 'top',
    splitLine: {
      lineStyle: {
        type: 'dashed'
      }
    }
  },
  yAxis: {
    type: 'category',
    axisLine: { show: false },
    axisLabel: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
  },
  series: [
    {
      name: '分数',
      type: 'bar',
      stack: 'Total',
      label: {
        show: true,
        formatter: '{b}'
      },
      data: [
        0.2,
        0.44,
        0.08,
        0.47,
        0.18
      ]
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
