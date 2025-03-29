<script setup>
import AppList from '@/components/AppList.vue';
import CpuLineCharts from '@/components/echarts/CpuLineCharts.vue';
import MemoryLineCharts from '@/components/echarts/MemoryLineCharts.vue';
import DiskCharts from '@/components/echarts/DiskCharts.vue';
import NetworkCharts from '@/components/echarts/NetworkCharts.vue';
import { useSysMStore } from '@/stores/sys';
import { onMounted, ref, shallowRef } from 'vue';
import AiCharts from '@/components/echarts/AiCharts.vue';
import { useMTLogStore } from '@/stores/mtlog';

const sys = useSysMStore()
const infos = ref([])
const lastInfo = ref([])
const mtlog = useMTLogStore()
const mthreadnum = ref(0)
const currentTime = ref(new Date().toLocaleTimeString());

onMounted(() => {
    setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString();
    }, 1000 * 1);

    setInterval(async () => {
        infos.value = await sys.sysMonitorShortInfo()
        if (Array.isArray(infos.value) && infos.value.length > 0) {
            lastInfo.value = infos.value[infos.value.length - 1]; 
            crisisValue.value = (((lastInfo.value.cpu_usage / 4) * 3 + lastInfo.value.memory_usage / 16 / 4 / 1024) % 110).toFixed(2);
        } else {
            crisisValue.value = 0; 
        }
        const datas = await mtlog.maliciousThreadLogs()
        if (Array.isArray(datas)) {
            mthreadnum.value = datas.length
        }
    }, 1000 * 3);
})

// 根据危机值获取进度条颜色
const getProgressBarColor = (value) => {
  if (value < 33) {
    return 'green';
  } else if (value < 66) {
    return 'orange';
  } else {
    return 'red';
}
};

// 定义一个存储危机值的状态
const crisisValue = ref(0);


const activeChart = shallowRef("CpuLineCharts");

const components = {
  CpuLineCharts,
  MemoryLineCharts,
  DiskCharts,
  NetworkCharts,
};

</script>

<template>
    <a-row>
        <a-col :flex="7">
            <a-row>
            <a-col :flex="5" style="margin-top: 70px;">
                <div class="time-container">
                    <p class="time-text">{{ currentTime }}</p>
                </div>

              <component :is="components[activeChart]" :infos="infos" />

                <AiCharts style="margin-top: 35px;"/>
            </a-col>
            <a-col :flex="2">
                    <p>
                        总状态{{ crisisValue }}%
                    </p>
                    <div class="progress-bar-container">
                        <div 
                         class="progress-bar" 
                         :style="{ width: crisisValue + '%', backgroundColor: getProgressBarColor(crisisValue) }"
                        ></div>
                    </div>
                    <p style="margin-top: 10px;">
                        温度：{{ lastInfo.temperature }}℃
                    </p>
                    <p style="margin-top: 10px;">
                        恶意线程个数：{{ mthreadnum }}
                    </p>

                <div class="app-detailed-body">
                    <div 
                        class="detail-item" 
                        :class="{ active: activeChart === 'CpuLineCharts'}"
                        @click="activeChart = 'CpuLineCharts'">
                        CPU
                        <div class="detail-item-data">{{ lastInfo?.cpu_usage?.toFixed(2) }} %</div>
                    </div>
                    <div 
                        class="detail-item" 
                        :class="{ active: activeChart === 'MemoryLineCharts'}"
                        @click="activeChart = 'MemoryLineCharts'">
                        内存
                        <div class="detail-item-data">{{ (lastInfo?.memory_usage / 16 / 1024).toFixed(2) }} %</div>
                    </div>
                    <div 
                        class="detail-item" 
                        :class="{ active: activeChart === 'DiskCharts'}"
                        @click="activeChart = 'DiskCharts'">
                        磁盘
                        <div class="detail-item-data">{{ lastInfo?.network_upload?.toFixed(2) }} MB/s </div>
                    </div>
                    <div 
                        class="detail-item" 
                        :class="{ active: activeChart === 'NetworkCharts'}"
                        @click="activeChart = 'NetworkCharts'">
                        磁盘网络
                        <div class="detail-item-data">{{ lastInfo?.network_download?.toFixed(2) }} MB/s</div>
                    </div>
                </div>
                <div 
                    class="ai-item" 
                >
                    AI记录
                </div>
            </a-col> 
            </a-row>

        </a-col>
        <a-col :flex="3" >
            <AppList />
        </a-col>
    </a-row>
</template>


<style scoped>

.time-text {
    font-size: 24px;
    margin-bottom: 50px;
    color: azure;
    font-weight: 600;
}

.ai-item {

    margin-top: 50px;
    color: rgba(233, 220, 167, 0.877);
    font-size: 20px;
    font-weight: 600;
}

.progress-bar-container {
    width: 240px;
    height: 15px;
    background-color: #9b9b9b;
    border-radius: 5px 10px 5px 10px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(142, 127, 90, 0.393); /* 添加阴影 */
    margin-left: 10px;
}

.progress-bar {
    height: 100%;
    transition: width 0.5s ease;
    box-shadow: 0 2px 4px rgba(72, 71, 71, 0.393); /* 为进度条添加阴影 */

}

.time-container {
    display: flex;
    /* justify-content: center; */
    align-items: center;
    justify-content: center;
}

.app-detailed-body {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: space-between; /* 让元素均匀分布 */
  gap: 10px; /* 控制元素之间的间距 */
  margin-top: 40px;
  margin-right: 20px;
}

p {
    color: rgba(233, 220, 167, 0.877);
    font-size: 20px;
    font-weight: 600;

}

/* 每个数据项 */
.detail-item{
  flex: 0 0 calc(50% - 10px); /* 每个元素占 50% 宽度，并减去间距 */
  box-sizing: border-box; /* 确保 padding 不影响宽度 */
  padding: 10px;
  border: 1px solid rgba(233, 220, 167, 0.877);
  color: azure;
  border-radius: 5px;
  text-align: center;
  /* background: rgba(255, 255, 255, 0.1); */
  font-size: 16px;
  box-shadow: 0 0 8px rgb(192, 182, 151);
  cursor: pointer;
}

.detail-item.active {
    background-color: rgba(185, 164, 81, 0.877);
    font-weight: bold;
    box-shadow: none;
    border: none;
}

.detail-item-data {
    color: azure;
    font-weight: 300;
}


</style>