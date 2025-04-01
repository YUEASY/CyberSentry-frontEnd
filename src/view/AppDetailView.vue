<template>
  <div class="app-detail-view">
    <!-- Breadcrumb navigation -->
    <div class="detail-header">
      <!-- <div class="breadcrumb-container">
        <a-breadcrumb class="breadcrumb">
          <a-breadcrumb-item>首页</a-breadcrumb-item>
          <a-breadcrumb-item>应用</a-breadcrumb-item>
          <a-breadcrumb-item>{{ appInfo.app_name || '应用详情' }}</a-breadcrumb-item>
        </a-breadcrumb>
      </div> -->
      <div class="header-actions">
        <a-button type="outline" size="small" @click="refreshData" :loading="loading">
          <template #icon>
            <RefreshCw size="14" />
          </template>
          刷新
        </a-button>
      </div>
    </div>

    <!-- Loading state -->
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载应用数据中...</div>
    </div>

    <!-- Content when loaded -->
    <div v-else class="detail-content">
      <!-- App info card -->
      <div class="app-info-card">
        <div class="app-info-section">
          <div class="app-icon-container">
            <img
              :src="appInfo.icon_path === '' ? '../../public/icon.png' : `/api/api/get_image/${appInfo.icon_path.replace(/\\/g, '/').split('/').pop()}`"
              alt="App Icon" class="app-icon" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          <div class="app-info">
            <div class="app-header">
              <h2 class="app-title">{{ appInfo.app_name }}</h2>
              <div class="risk-tag" :class="{ 'high-risk': appInfo.risk_level > 3 }">
                {{ appInfo.risk_level > 3 ? '高风险' : '安全' }}
              </div>
            </div>
            <div class="app-path">{{ appInfo.executable_path }}</div>
            <div class="app-update-time">
              更新时间: {{ formatTime(appInfo.update_time) }}
            </div>
          </div>
        </div>

        <!-- Protection controls -->
        <div class="protection-controls">
          <h3 class="controls-title">保护措施</h3>
          <div class="controls-grid">
            <div class="control-item">
              <span class="control-label">反录屏</span>
              <a-switch v-model="controls.antiScreenRecording"
                @change="updateRule('is_recording_prevention_enabled', controls.antiScreenRecording)" type="round"
                checked-color="#14C9C9" unchecked-color="#F53F3F" />
              <span class="control-hint">反录屏、截屏</span>
            </div>
            <div class="control-item">
              <span class="control-label">运行保护</span>
              <a-switch v-model="controls.runtimeProtection"
                @change="updateRule('is_protected', controls.runtimeProtection)" type="round" checked-color="#14C9C9"
                unchecked-color="#F53F3F" />
              <span class="control-hint">保护应用不被篡改</span>
            </div>
            <div class="control-item">
              <span class="control-label">伪装</span>
              <a-switch v-model="controls.camouflage" @change="updateRule('is_camouflaged', controls.camouflage)"
                type="round" checked-color="#14C9C9" unchecked-color="#F53F3F" />
              <span class="control-hint">伪装应用id</span>
            </div>
            <div v-if="controls.camouflage" class="control-item camouflage-input">
              <span class="control-label">伪装ID</span>
              <div class="input-with-button">
                <a-input v-model="controls.camouflagePid" placeholder="输入伪装进程ID" />
                <a-button size="small" type="primary" @click="updateRule('camouflage_pid', controls.camouflagePid)">
                  应用
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Resource charts section -->
        <div class="resource-charts">
          <h3 class="charts-title">资源监控</h3>
          <div class="charts-grid">
            <div class="chart-container">
              <h4>CPU 使用率</h4>
              <div class="chart-info">
                <span class="current-value">{{ currentCpuUsage }}%</span>
                <span class="trend" :class="cpuTrend.class">{{ cpuTrend.text }}</span>
              </div>
              <div ref="cpuChart" class="chart"></div>
            </div>
            <div class="chart-container">
              <h4>内存使用</h4>
              <div class="chart-info">
                <span class="current-value">{{ currentMemoryUsage }} MB</span>
                <span class="trend" :class="memoryTrend.class">{{ memoryTrend.text }}</span>
              </div>
              <div ref="memoryChart" class="chart"></div>
            </div>
            <div class="chart-container">
              <h4>磁盘 I/O</h4>
              <div class="chart-info">
                <span class="current-value">读: {{ currentDiskRead }} KB/s | 写: {{ currentDiskWrite }} KB/s</span>
              </div>
              <div ref="diskChart" class="chart"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail sections -->
      <!-- <div class="detail-sections">
        Malicious threads section
        <div class="detail-card">
          <div class="card-header">
            <h3>应用线程</h3>
            <a-button type="text" class="view-all-button">查看全部</a-button>
          </div>
          <div class="card-content">
            <a-table :columns="threadColumns" :data="threadData" :pagination="false" class="dark-table">
              <template #risk_level_tag="{ record }">
                <div class="risk-level-tag" :style="{ backgroundColor: getRiskLevelColor(record.risk_level) }">
                  {{ record.risk_level }}
                </div>
              </template>
            </a-table>
          </div>
        </div> -->

      <!-- File modification section -->
      <!-- <div class="detail-card">
          <div class="card-header">
            <h3>文件修改记录</h3>
            <a-button type="text" class="view-all-button">查看全部</a-button>
          </div>
          <div class="card-content">
            <a-table :columns="fileColumns" :data="fileData" :pagination="false" class="dark-table" />
          </div>
        </div> -->
      <!-- </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppInfoStore } from '@/stores/app';
import { useMTLogStore } from '@/stores/mtlog';
import { useFileMLogStore } from '@/stores/filemlog';
import { useMRuleStore } from '@/stores/mrule';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { RefreshCw } from 'lucide-vue-next';
import { useAppRMStore } from '@/stores/apprm';

// Register necessary ECharts components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  BarChart,
  LineChart,
  CanvasRenderer
]);

const route = useRoute();
const appId = ref(parseInt(route.params.id) || -1);
const loading = ref(true);

const appInfoStore = useAppInfoStore();
const apprm = useAppRMStore()
const mtLogStore = useMTLogStore();
const fileMLogStore = useFileMLogStore();
const mruleStore = useMRuleStore();

// App info state
const appInfo = reactive({
  app_name: '',
  executable_path: '',
  icon_path: '',
  update_time: '',
  risk_level: 0
});

// Controls state
const controls = reactive({
  antiScreenRecording: false,
  runtimeProtection: false,
  camouflage: false,
  camouflagePid: ''
});

// Chart references
const cpuChart = ref(null);
const memoryChart = ref(null);
const diskChart = ref(null);

// Chart instances
const cpuChartInstance = ref(null);
const memoryChartInstance = ref(null);
const diskChartInstance = ref(null);

// Resource data
const resourceData = reactive({
  cpu: [],
  memory: [],
  disk: []
});

// Current values
const currentCpuUsage = ref('0.00');
const currentMemoryUsage = ref('0.00');
const currentDiskRead = ref('0.00');
const currentDiskWrite = ref('0.00');


// Table data
const threadData = ref([]);
const fileData = ref([]);

// Computed trends
const cpuTrend = computed(() => {
  if (resourceData.cpu.length < 2) return { text: '稳定', class: 'stable' };
  const last = resourceData.cpu[resourceData.cpu.length - 1]?.cpu_usage || 0;
  const secondLast = resourceData.cpu[resourceData.cpu.length - 2]?.cpu_usage || 0;
  const diff = last - secondLast;

  if (diff > 5) return { text: '↑ 上升', class: 'up' };
  if (diff < -5) return { text: '↓ 下降', class: 'down' };
  return { text: '→ 稳定', class: 'stable' };
});

const memoryTrend = computed(() => {
  if (resourceData.memory.length < 2) return { text: '稳定', class: 'stable' };
  const last = resourceData.memory[resourceData.memory.length - 1]?.memory_usage_mb || 0;
  const secondLast = resourceData.memory[resourceData.memory.length - 2]?.memory_usage_mb || 0;
  const diff = last - secondLast;

  if (diff > 50) return { text: '↑ 上升', class: 'up' };
  if (diff < -50) return { text: '↓ 下降', class: 'down' };
  return { text: '→ 稳定', class: 'stable' };
});

// Helper functions
const formatTime = (time) => {
  if (!time) return '未知';
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};



// Chart initialization
const initCharts = () => {
  // Initialize charts
  cpuChartInstance.value = echarts.init(cpuChart.value);
  memoryChartInstance.value = echarts.init(memoryChart.value);
  diskChartInstance.value = echarts.init(diskChart.value);

  // Set initial empty data
  updateCharts();

  // Handle window resize
  window.addEventListener('resize', handleResize);
};

const updateCharts = () => {
  // Extract time and data
  const times = resourceData.cpu.map(item => {
    const date = new Date(item.sample_time);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  });

  const cpuData = resourceData.cpu.map(item => item.cpu_usage);
  const memoryData = resourceData.memory.map(item => item.memory_usage_mb);
  const diskReadData = resourceData.disk.map(item => item.disk_io_read);
  const diskWriteData = resourceData.disk.map(item => item.disk_io_write);

  // Update current values
  if (cpuData.length > 0) {
    currentCpuUsage.value = cpuData[cpuData.length - 1]?.toFixed(2) || '0.00';
  }

  if (memoryData.length > 0) {
    currentMemoryUsage.value = memoryData[memoryData.length - 1]?.toFixed(2) || '0.00';
  }

  if (diskReadData.length > 0) {
    currentDiskRead.value = diskReadData[diskReadData.length - 1]?.toFixed(2) || '0.00';
  }

  if (diskWriteData.length > 0) {
    currentDiskWrite.value = diskWriteData[diskWriteData.length - 1]?.toFixed(2) || '0.00';
  }

  // CPU chart configuration
  const cpuOption = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c}%',
      backgroundColor: 'rgba(30, 30, 30, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#e0e0e0'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: times.length > 0 ? times : ['--'],
      axisLabel: {
        color: '#a0a0a0'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '%',
      nameTextStyle: {
        color: '#a0a0a0'
      },
      axisLabel: {
        color: '#a0a0a0'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.05)'
        }
      }
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        data: cpuData.length > 0 ? cpuData : [0],
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: '#14C9C9'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: 'rgba(20, 201, 201, 0.5)'
            }, {
              offset: 1,
              color: 'rgba(20, 201, 201, 0.1)'
            }]
          }
        }
      }
    ]
  };

  // Memory chart configuration
  const memoryOption = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} MB',
      backgroundColor: 'rgba(30, 30, 30, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#e0e0e0'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: times.length > 0 ? times : ['--'],
      axisLabel: {
        color: '#a0a0a0'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'MB',
      nameTextStyle: {
        color: '#a0a0a0'
      },
      axisLabel: {
        color: '#a0a0a0'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.05)'
        }
      }
    },
    series: [
      {
        name: '内存使用',
        type: 'line',
        data: memoryData.length > 0 ? memoryData : [0],
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: 'rgba(233, 220, 167, 0.877)'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: 'rgba(233, 220, 167, 0.5)'
            }, {
              offset: 1,
              color: 'rgba(233, 220, 167, 0.1)'
            }]
          }
        }
      }
    ]
  };

  // Disk chart configuration
  const diskOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        return params[0].axisValueLabel + '<br/>' +
          params[0].marker + params[0].seriesName + ': ' + params[0].value + ' KB/s<br/>' +
          params[1].marker + params[1].seriesName + ': ' + params[1].value + ' KB/s';
      },
      backgroundColor: 'rgba(30, 30, 30, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#e0e0e0'
      }
    },
    legend: {
      data: ['读取', '写入'],
      right: 10,
      top: 0,
      textStyle: {
        color: '#a0a0a0'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '30px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: times.length > 0 ? times : ['--'],
      axisLabel: {
        color: '#a0a0a0'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'KB/s',
      nameTextStyle: {
        color: '#a0a0a0'
      },
      axisLabel: {
        color: '#a0a0a0'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.05)'
        }
      }
    },
    series: [
      {
        name: '读取',
        type: 'line',
        data: diskReadData.length > 0 ? diskReadData : [0],
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#FF7D00'
        }
      },
      {
        name: '写入',
        type: 'line',
        data: diskWriteData.length > 0 ? diskWriteData : [0],
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#F53F3F'
        }
      }
    ]
  };

  // Set chart options
  cpuChartInstance.value.setOption(cpuOption);
  memoryChartInstance.value.setOption(memoryOption);
  diskChartInstance.value.setOption(diskOption);
};

const handleResize = () => {
  cpuChartInstance.value?.resize();
  memoryChartInstance.value?.resize();
  diskChartInstance.value?.resize();
};

// Data fetching
const fetchAppInfo = async () => {
  try {
    const data = await appInfoStore.appInfoId(appId.value);
    if (data && data !== 'error') {
      Object.assign(appInfo, data);
    }
  } catch (error) {
    console.error('获取应用信息失败:', error);
  }
};

const fetchAppRules = async () => {
  try {
    const ruleData = await mruleStore.mruleInfo(appId.value);
    if (ruleData && ruleData !== 'error') {
      controls.antiScreenRecording = ruleData.is_recording_prevention_enabled || false;
      controls.runtimeProtection = ruleData.is_protected || false;
      controls.camouflage = ruleData.is_camouflaged || false;
      controls.camouflagePid = ruleData.camouflage_pid || '';
    }
  } catch (error) {
    console.error('获取应用规则失败:', error);
  }
};

const fetchThreadData = async () => {
  try {
    const data = await mtLogStore.maliciousThreadLogs();
    if (data && data !== 'error') {
      threadData.value = data.filter(item => item.app_id === appId.value).slice(0, 5);
    }
  } catch (error) {
    console.error('获取线程数据失败:', error);
  }
};

const fetchFileData = async () => {
  try {
    const data = await fileMLogStore.fileModiLogs();
    if (data && data !== 'error') {
      fileData.value = data.filter(item => item.app_id === appId.value).slice(0, 5);
    }
  } catch (error) {
    console.error('获取文件修改记录失败:', error);
  }
};

const fetchResourceData = async () => {
  try {
    // Get app-specific resource monitoring data
    const appResourceData = await apprm.appRMInfoAppId(appId.value);
    if (appResourceData && appResourceData !== 'error') {
      // Sort by time
      const sortedData = Array.isArray(appResourceData)
        ? [...appResourceData].sort((a, b) => new Date(a.sample_time) - new Date(b.sample_time))
        : [];

      // Show at most the last 10 data points
      const recentData = sortedData.slice(-10);

      resourceData.cpu = recentData;
      resourceData.memory = recentData;
      resourceData.disk = recentData;

      // Update charts
      updateCharts();
    }
  } catch (error) {
    console.error('获取资源数据失败:', error);
  }
};

const updateRule = async (ruleKey, value) => {
  try {
    const ruleUpdate = {
      app_id: appId.value,
      is_camouflaged: controls.camouflage,
      camouflage_pid: controls.camouflagePid,
      is_recording_prevention_enabled: controls.antiScreenRecording,
      is_protected: controls.runtimeProtection
    };

    // Update specific rule
    ruleUpdate[ruleKey] = value;

    const result = await mruleStore.modiMrule(ruleUpdate);
    if (result && result !== 'error') {
      console.log('规则更新成功');
    }
  } catch (error) {
    console.error('更新规则失败:', error);
  }
};

const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchAppInfo(),
      fetchAppRules(),
      fetchThreadData(),
      fetchFileData(),
      fetchResourceData()
    ]);
  } finally {
    loading.value = false;
  }
};

// Initialize on mount
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchAppInfo(),
      fetchAppRules(),
      fetchThreadData(),
      fetchFileData()
    ]);

    // Initialize charts after DOM is ready
    setTimeout(() => {
      initCharts();
      fetchResourceData();
    }, 100);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.app-detail-view {
  /* min-height: 100vh; */
  background-color: #1e1e1e;
  color: #e0e0e0;
  padding: 20px;
  margin-right: 40px;
  margin-top: 20px;
}

/* Header section */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.breadcrumb-container {
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 8px;
  padding: 10px 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: rgba(233, 220, 167, 0.877);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #a0a0a0;
}

/* Content area */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* App info card */
.app-info-card {
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.app-info-section {
  display: flex;
  gap: 20px;
}

.app-icon-container {
  width: 120px;
  height: 120px;
  background-color: rgba(40, 40, 40, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.app-icon {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.app-info {
  flex: 1;
}

.app-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 15px;
}

.app-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #ffffff;
}

.risk-tag {
  background-color: #52c41a;
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 14px;
}

.risk-tag.high-risk {
  background-color: #ff4d4f;
}

.app-path {
  font-size: 16px;
  color: #a0a0a0;
  margin-bottom: 10px;
  word-break: break-word;
}

.app-update-time {
  font-size: 14px;
  color: #a0a0a0;
}

/* Protection controls */
.protection-controls {
  background-color: rgba(40, 40, 40, 0.6);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.controls-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  width: 80px;
  font-weight: 500;
  color: #ffffff;
}

.control-hint {
  margin-left: 10px;
  font-size: 12px;
  color: #a0a0a0;
}

.camouflage-input {
  grid-column: span 2;
}

.input-with-button {
  display: flex;
  gap: 10px;
  flex: 1;
}

/* Resource charts */
.resource-charts {
  background-color: rgba(40, 40, 40, 0.6);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.charts-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.chart-container {
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.chart-container h4 {
  margin: 0;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 10px;
  font-weight: 500;
}

.chart-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.current-value {
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
}

.trend {
  font-size: 14px;
  padding: 2px 8px;
  border-radius: 12px;
}

.trend.up {
  color: #f53f3f;
  background-color: rgba(245, 63, 63, 0.1);
}

.trend.down {
  color: #52c41a;
  background-color: rgba(82, 196, 26, 0.1);
}

.trend.stable {
  color: rgba(233, 220, 167, 0.877);
  background-color: rgba(233, 220, 167, 0.1);
}

.chart {
  height: 180px;
  width: 100%;
}

/* Detail sections */
.detail-sections {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-card {
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 10px;
  padding: 0;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: rgba(40, 40, 40, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.view-all-button {
  color: rgba(233, 220, 167, 0.877);
}

.card-content {
  padding: 16px 20px;
}

.risk-level-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

/* Override Arco Design styles for dark theme */
:deep(.arco-breadcrumb) {
  color: #a0a0a0;
}

:deep(.arco-breadcrumb-item-link) {
  color: #a0a0a0;
}

:deep(.arco-breadcrumb-item-link:hover) {
  color: rgba(233, 220, 167, 0.877);
}

:deep(.arco-btn) {
  border-radius: 4px;
}

:deep(.arco-btn-primary) {
  background-color: #14C9C9;
  border-color: #14C9C9;
}

:deep(.arco-btn-primary:hover) {
  background-color: #0fb8b8;
  border-color: #0fb8b8;
}

:deep(.arco-input-wrapper) {
  background-color: #333333;
  border-color: #444444;
}

:deep(.arco-input) {
  color: #e0e0e0;
}

:deep(.dark-table .arco-table-th) {
  background-color: rgba(30, 30, 30, 0.6) !important;
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.dark-table .arco-table-td) {
  background-color: transparent !important;
  color: #e0e0e0 !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.dark-table .arco-table-tr:hover .arco-table-td) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-sections {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .app-info-section {
    flex-direction: column;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .control-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>