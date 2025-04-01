<script setup>
import AppList from '@/components/AppList.vue';
import CpuLineCharts from '@/components/echarts/CpuLineCharts.vue';
import MemoryLineCharts from '@/components/echarts/MemoryLineCharts.vue';
import DiskCharts from '@/components/echarts/DiskCharts.vue';
import NetworkCharts from '@/components/echarts/NetworkCharts.vue';
import { useSysMStore } from '@/stores/sys';
import { onMounted, ref, shallowRef, computed } from 'vue';
import PowerCharts from '@/components/echarts/PowerCharts.vue';
import TempCharts from '@/components/echarts/TempCharts.vue';
import { useMTLogStore } from '@/stores/mtlog';
import { 
  Activity, 
  AlertTriangle, 
  Cpu, 
  Database, 
  HardDrive, 
  Network, 
  RefreshCw, 
  Thermometer, 
  X 
} from 'lucide-vue-next';

const sys = useSysMStore();
const mtlog = useMTLogStore();
const infos = ref([]);
const lastInfo = ref([]);
const mthreadLogs = ref([]);
const mthreadnum = ref(0);
const currentTime = ref(new Date().toLocaleTimeString());
const isLoading = ref(true);

onMounted(() => {
  // Update current time every second
  setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString();
  }, 1000);

  // Fetch system data every 3 seconds
  fetchData();
  setInterval(fetchData, 3000);
});

const fetchData = async () => {
  try {
    isLoading.value = true;
    infos.value = await sys.sysMonitorShortInfo();
    
    if (Array.isArray(infos.value) && infos.value.length > 0) {
      lastInfo.value = infos.value[infos.value.length - 1]; 
      crisisValue.value = (((lastInfo.value.cpu_usage / 4) * 3 + lastInfo.value.memory_usage / 16 / 4 / 1024) % 110).toFixed(2);
    } else {
      crisisValue.value = 0; 
    }
    
    // Fetch malicious thread logs
    const datas = await mtlog.maliciousThreadLogs();
    if (Array.isArray(datas)) {
      mthreadLogs.value = datas;
      mthreadnum.value = datas.length;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    isLoading.value = false;
  }
};

const showPopup = ref(false);

const closePopup = () => {
  showPopup.value = false;
};

const openPopup = () => {
  showPopup.value = true;
};

// Crisis value for system status
const crisisValue = ref(0);

// Active chart selection
const activeChart = shallowRef("CpuLineCharts");

const components = {
  CpuLineCharts,
  MemoryLineCharts,
  DiskCharts,
  NetworkCharts,
};

// Format risk level for display
const formatRiskLevel = (level) => {
  if (level >= 8) return { text: '严重', color: '#ff4d4f' };
  if (level >= 5) return { text: '警告', color: '#faad14' };
  return { text: '低风险', color: '#52c41a' };
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Refresh data manually
const refreshData = () => {
  fetchData();
};

// Add these computed properties after the refreshData function
const getLoadStatus = (value) => {
  if (!value) return { text: '正常', color: '#52c41a' };
  if (value < 33) return { text: '正常', color: '#52c41a' };
  if (value < 66) return { text: '中等', color: '#faad14' };
  if (value < 85) return { text: '较高', color: '#fa8c16' };
  return { text: '危险', color: '#ff4d4f' };
};

const cpuLoad = computed(() => {
  return lastInfo.value?.cpu_usage?.toFixed(2) || '0.00';
});

const memoryLoad = computed(() => {
  return (lastInfo.value?.memory_usage / 16 / 1024)?.toFixed(2) || '0.00';
});

const diskLoad = computed(() => {
  return lastInfo.value?.disk_usage?.toFixed(2) || '0.00';
});

</script>

<template>
  <div class="dashboard-container">
    <!-- Left sidebar: System overview -->
    <div class="dashboard-sidebar">
      <div class="sidebar-header">
        <div class="system-time">
          <Activity class="time-icon" />
          <span>{{ currentTime }}</span>
        </div>
        <button class="refresh-button" @click="refreshData" :disabled="isLoading">
          <RefreshCw :class="{'spin': isLoading}" />
        </button>
      </div>
      
      <div class="sidebar-section">
        <h3 class="section-title">系统状态</h3>
        <div class="system-gauges">
          <div class="gauge-container">
            <TempCharts :infos="infos" />
            <div class="gauge-label">
              <Thermometer size="16" />
              <span>温度</span>
            </div>
          </div>
          <div class="gauge-container">
            <PowerCharts :infos="infos" />
            <div class="gauge-label">
              <Database size="16" />
              <span>电源</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="sidebar-section">
        <h3 class="section-title">安全监控</h3>
        <div 
          class="security-alert" 
          :class="{ 'has-alerts': mthreadnum > 0 }"
          @click="openPopup"
        >
          <AlertTriangle size="20" />
          <span>恶意线程 ({{ mthreadnum }})</span>
        </div>
        
        <!-- Replace the existing system-status div with this enhanced version -->
        <div class="system-status">
          <div class="status-header">
            <span>系统负载</span>
            <div class="status-badge" :style="{ backgroundColor: getLoadStatus(crisisValue).color }">
              {{ getLoadStatus(crisisValue).text }}
            </div>
          </div>
          
          <div class="progress-bar-container">
            <div 
              class="progress-bar" 
              :style="{ 
                width: `${Math.min(crisisValue, 100)}%`, 
                backgroundColor: crisisValue < 33 ? '#52c41a' : crisisValue < 66 ? '#faad14' : '#ff4d4f' 
              }"
            ></div>
          </div>
          
          <div class="status-value-display">{{ crisisValue }}%</div>
          
          <div class="load-details">
            <div class="load-item">
              <div class="load-label">CPU</div>
              <div class="load-value" :style="{ color: getLoadStatus(cpuLoad).color }">{{ cpuLoad }}%</div>
            </div>
            <div class="load-item">
              <div class="load-label">内存</div>
              <div class="load-value" :style="{ color: getLoadStatus(memoryLoad).color }">{{ memoryLoad }}%</div>
            </div>
            <div class="load-item">
              <div class="load-label">磁盘</div>
              <div class="load-value" :style="{ color: getLoadStatus(diskLoad).color }">{{ diskLoad }} MB/s</div>
            </div>
          </div>
          
          <div class="load-recommendation" v-if="crisisValue > 66">
            <AlertTriangle size="14" />
            <span>建议关闭不必要的应用以降低系统负载</span>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Center content: Main charts -->
    <div class="dashboard-main">
      <div class="main-header">
        <h2>系统性能监控</h2>
      </div>
      
      <div class="main-content">
        <component 
          :is="components[activeChart]" 
          :infos="infos" 
          class="main-chart"
        />
      </div>
    </div>
    
    <!-- Right sidebar: Metrics and app list -->
    <div class="dashboard-metrics">
      <div class="metrics-container">
        <div 
          class="metric-card" 
          :class="{ active: activeChart === 'CpuLineCharts'}"
          @click="activeChart = 'CpuLineCharts'"
        >
          <div class="metric-header">
            <Cpu size="18" />
            <span>CPU</span>
          </div>
          <div class="metric-value">{{ lastInfo?.cpu_usage?.toFixed(2) || '0.00' }}%</div>
        </div>
        
        <div 
          class="metric-card" 
          :class="{ active: activeChart === 'MemoryLineCharts'}"
          @click="activeChart = 'MemoryLineCharts'"
        >
          <div class="metric-header">
            <Database size="18" />
            <span>内存</span>
          </div>
          <div class="metric-value">{{ (lastInfo?.memory_usage / 16 / 1024)?.toFixed(2) || '0.00' }}%</div>
        </div>
        
        <div 
          class="metric-card" 
          :class="{ active: activeChart === 'DiskCharts'}"
          @click="activeChart = 'DiskCharts'"
        >
          <div class="metric-header">
            <HardDrive size="18" />
            <span>磁盘</span>
          </div>
          <div class="metric-value">{{ lastInfo?.disk_usage?.toFixed(2) || '0.00' }} MB/s</div>
        </div>
        
        <div 
          class="metric-card" 
          :class="{ active: activeChart === 'NetworkCharts'}"
          @click="activeChart = 'NetworkCharts'"
        >
          <div class="metric-header">
            <Network size="18" />
            <span>网络</span>
          </div>
          <div class="metric-value">
            <div>↓ {{ lastInfo?.network_download?.toFixed(2) || '0.00' }} MB/s</div>
            <div>↑ {{ lastInfo?.network_upload?.toFixed(2) || '0.00' }} MB/s</div>
          </div>
        </div>
      </div>
      
      <div class="app-list-container">
        <h3 class="section-title">应用监控</h3>
        <AppList :crisisValue="crisisValue" />
      </div>
    </div>
    
    <!-- Malicious thread popup -->
    <div v-if="showPopup" class="overlay" @click="closePopup"></div>
    <div v-if="showPopup" class="popup">
      <div class="popup-header">
        <h3>恶意线程监控</h3>
        <button class="close-button" @click="closePopup">
          <X size="18" />
        </button>
      </div>
      
      <div class="popup-content">
        <div v-if="mthreadLogs.length === 0" class="empty-state">
          <AlertTriangle size="48" />
          <p>暂无恶意线程记录</p>
        </div>
        
        <div v-else class="thread-list">
          <div v-for="(thread, index) in mthreadLogs" :key="index" class="thread-item">
            <div class="thread-header">
              <span class="thread-name">{{ thread.thread_name }}</span>
              <span 
                class="risk-badge"
                :style="{ backgroundColor: formatRiskLevel(thread.risk_level).color }"
              >
                {{ formatRiskLevel(thread.risk_level).text }}
              </span>
            </div>
            
            <div class="thread-details">
              <div class="thread-detail">
                <span class="detail-label">应用ID:</span>
                <span class="detail-value">{{ thread.app_id }}</span>
              </div>
              <div class="thread-detail">
                <span class="detail-label">线程哈希:</span>
                <span class="detail-value">{{ thread.thread_hash.substring(0, 16) }}...</span>
              </div>
              <div class="thread-detail">
                <span class="detail-label">检测时间:</span>
                <span class="detail-value">{{ formatDate(thread.detection_time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main dashboard container */
.dashboard-container {
  display: flex;
  color: #e0e0e0;
  gap: 20px;
  padding: 20px;
}

/* Left sidebar */
.dashboard-sidebar {
  flex: 0 0 250px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.system-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: rgba(233, 220, 167, 0.877);
  font-weight: 600;
}

.time-icon {
  color: rgba(233, 220, 167, 0.877);
}

.refresh-button {
  background: transparent;
  border: none;
  color: rgba(233, 220, 167, 0.877);
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sidebar-section {
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 370px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.system-gauges {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.gauge-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  color: #a0a0a0;
}

.security-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  margin-bottom: 15px;
  transition: all 0.3s ease;

}

.security-alert:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.security-alert.has-alerts {
  background-color: rgba(255, 77, 79, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { background-color: rgba(255, 77, 79, 0.2); }
  50% { background-color: rgba(255, 77, 79, 0.3); }
  100% { background-color: rgba(255, 77, 79, 0.2); }
}

.system-status {
  margin-top: 15px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.status-value {
  font-weight: 600;
  color: rgba(233, 220, 167, 0.877);
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.5s ease, background-color 0.5s ease;
}

/* Center content */
.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevent flex item from overflowing */
}

.main-header {
  margin-bottom: 20px;
}

.main-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.main-content {
  flex: 1;
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.main-chart {
  flex: 1;
  min-height: 400px;
}

/* Right sidebar */
.dashboard-metrics {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.metric-card {
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.metric-card:hover {
  background-color: rgba(40, 40, 40, 0.6);
  border-color: rgba(233, 220, 167, 0.3);
}

.metric-card.active {
  background-color: rgba(185, 164, 81, 0.2);
  border-color: rgba(233, 220, 167, 0.877);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #ffffff;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: rgba(233, 220, 167, 0.877);
}

.app-list-container {
  flex: 1;
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Popup styles */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  backdrop-filter: blur(3px);
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1a1a1a;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  color: #ffffff;
}

.close-button {
  background: transparent;
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 4px;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.popup-content {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 60px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #a0a0a0;
  gap: 15px;
}

.thread-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.thread-item {
  background-color: rgba(40, 40, 40, 0.6);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.thread-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.thread-name {
  font-weight: 600;
  color: #ffffff;
}

.risk-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.thread-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.thread-detail {
  display: flex;
  gap: 10px;
}

.detail-label {
  color: #a0a0a0;
  width: 80px;
  flex-shrink: 0;
}

.detail-value {
  color: #e0e0e0;
  word-break: break-all;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .dashboard-container {
    flex-direction: column;
  }
  
  .dashboard-sidebar {
    flex: none;
    width: 100%;
  }
  
  .dashboard-metrics {
    flex: none;
    width: 100%;
  }
  
  .metrics-container {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .system-gauges {
    justify-content: center;
  }
  
  .gauge-container {
    max-width: 200px;
  }
}

@media (max-width: 768px) {
  .metrics-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .popup {
    width: 90%;
  }
}

.system-module-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.system-module-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background-color: rgba(40, 40, 40, 0.6);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.system-module-card:hover {
  background-color: rgba(50, 50, 50, 0.6);
}

.module-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(233, 220, 167, 0.1);
  color: rgba(233, 220, 167, 0.877);
}

.module-info {
  flex: 1;
}

.module-name {
  font-size: 12px;
  color: #a0a0a0;
  margin-bottom: 4px;
}

.module-value {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.system-uptime {
  background-color: rgba(40, 40, 40, 0.6);
  border-radius: 6px;
  padding: 10px;
}

.uptime-label {
  font-size: 12px;
  color: #a0a0a0;
  margin-bottom: 4px;
}

.uptime-value {
  font-size: 14px;
  font-weight: 500;
  color: rgba(233, 220, 167, 0.877);
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 10px;
}

.status-value-display {
  font-size: 24px;
  font-weight: 700;
  color: rgba(233, 220, 167, 0.877);
  text-align: center;
  margin: 10px 0;
}

.load-details {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  background-color: rgba(40, 40, 40, 0.6);
  border-radius: 6px;
  padding: 10px;
}

.load-item {
  text-align: center;
  flex: 1;
}

.load-label {
  font-size: 12px;
  color: #a0a0a0;
  margin-bottom: 5px;
}

.load-value {
  font-size: 14px;
  font-weight: 600;
}

.load-recommendation {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px;
  border-radius: 6px;
  background-color: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  font-size: 12px;
}
</style>

