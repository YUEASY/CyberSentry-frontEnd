<script setup>
import { useAppRMStore } from '@/stores/apprm';
import { useMRuleStore } from '@/stores/mrule';
import { ref, onMounted, defineProps, computed } from 'vue';
import { useRouter } from 'vue-router';
import defineIcon from '../../public/icon.png';
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  Save, 
  X, 
  ChevronRight,
  BarChart2
} from 'lucide-vue-next';

const props = defineProps({
  crisisValue: {
    type: Number,
    default: 0
  }
});

const router = useRouter();
const appRM = useAppRMStore();
const mrule = useMRuleStore();

// State
const cpu5 = ref([]);
const memo5 = ref([]);
const showPopup = ref(false);
const appMRule = ref({
  is_camouflaged: false,
  camouflage_pid: '',
  is_recording_prevention_enabled: false,
  is_protected: false
});
const detaileData = ref({});
const loading = ref(true);
const activeTab = ref('cpu'); // 'cpu' or 'memory'

// Fetch data on mount
onMounted(() => {
  fetchData();
  
  // Set up interval to refresh data
  setInterval(fetchData, 6000);
});

// Fetch app resource data
const fetchData = async () => {
  try {
    loading.value = true;
    const [cpuData, memoryData] = await Promise.all([
      appRM.appRMCPUInfo(),
      appRM.appRMMEMORYInfo()
    ]);
    
    cpu5.value = cpuData || [];
    memo5.value = memoryData || [];
    
    // Update selected app data if needed
    if (detaileData.value.app_id) {
      const updatedApp = activeTab.value === 'cpu' 
        ? cpu5.value.find(app => app.app_id === detaileData.value.app_id)
        : memo5.value.find(app => app.app_id === detaileData.value.app_id);
        
      if (updatedApp) {
        detaileData.value = { ...updatedApp };
      }
    }
  } catch (error) {
    console.error('Error fetching app data:', error);
  } finally {
    loading.value = false;
  }
};

// Close popup
const closePopup = () => {
  showPopup.value = false;
};

// Open popup
const openPopup = () => {
  showPopup.value = true;
};

// Update app monitoring rules
const postAppMRule = async () => {
  try {
    await mrule.modiMrule(appMRule.value);
    // Show success indicator
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to update app rules:', error);
  }
};

// Select an app to view details
const selectApp = async (app_id, type) => {
  activeTab.value = type;
  
  let selectedApp;
  if (type === 'cpu') {
    selectedApp = cpu5.value.find(data => data.app_id === app_id);
  } else {
    selectedApp = memo5.value.find(data => data.app_id === app_id);
  }

  if (selectedApp) {
    detaileData.value = { ...selectedApp };
  }
  
  try {
    const data = await mrule.mruleInfo(app_id);
    if (data && data !== 'error') {
      appMRule.value = { 
        app_id,
        is_camouflaged: data.is_camouflaged || false,
        camouflage_pid: data.camouflage_pid || '',
        is_recording_prevention_enabled: data.is_recording_prevention_enabled || false,
        is_protected: data.is_protected || false
      };
    } else {
      appMRule.value = {
        app_id,
        is_camouflaged: false,
        camouflage_pid: '',
        is_recording_prevention_enabled: false,
        is_protected: false
      };
    }
  } catch (error) {
    console.error('Error fetching app rules:', error);
  }
  
  openPopup();
};

// Navigate to app detail view
const goToAppDetail = (appId) => {
  router.push(`/apps/${appId}`);
  closePopup();
};

// Get progress bar color based on value
const getProgressBarColor = (value) => {
  if (!value) return 'green';
  if (value < 33) return '#52c41a';
  if (value < 66) return '#faad14';
  return '#ff4d4f';
};

// Get power level color
const getPowerLevelColor = (level) => {
  if (!level) return 'gray';
  const numLevel = Number(level);
  if (numLevel >= 4) return '#ff4d4f';
  if (numLevel >= 3) return '#faad14';
  if (numLevel >= 2) return '#1890ff';
  return '#52c41a';
};

// Format resource value with color
const getResourceColor = (value) => {
  if (!value) return '#14C9C9';
  if (value > 80) return '#ff4d4f';
  if (value > 60) return '#faad14';
  if (value > 40) return '#ffbb00';
  return '#14C9C9';
};

// Success indicator for save operation
const saveSuccess = ref(false);

// Sort apps by usage
const sortedCpuApps = computed(() => {
  return [...cpu5.value].sort((a, b) => b.cpu_usage - a.cpu_usage).slice(0, 5);
});

const sortedMemoryApps = computed(() => {
  return [...memo5.value].sort((a, b) => b.memory_usage_mb - a.memory_usage_mb).slice(0, 5);
});
</script>

<template>
  <div class="app-list-wrapper">
    <!-- System status header -->
    <div class="app-list-header" v-if="props.crisisValue !== undefined">
      <div class="status-info">
        <Activity class="status-icon" />
        <span>系统状态</span>
      </div>
      <div class="status-bar">
        <div class="status-value">{{ props.crisisValue }}%</div>
        <div class="progress-bar-container">
          <div 
            class="progress-bar" 
            :style="{ 
              width: `${Math.min(props.crisisValue, 100)}%`, 
              backgroundColor: getProgressBarColor(props.crisisValue) 
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- App list tabs -->
    <div class="app-list-tabs">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'cpu' }"
        @click="activeTab = 'cpu'"
      >
        <Cpu size="16" />
        <span>CPU 使用率</span>
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'memory' }"
        @click="activeTab = 'memory'"
      >
        <Database size="16" />
        <span>内存使用率</span>
      </button>
    </div>

    <!-- App list content -->
    <div class="app-list-content" :class="{ 'is-loading': loading }">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
      
      <!-- CPU apps list -->
      <div v-if="activeTab === 'cpu'" class="app-items">
        <div 
          v-for="app in sortedCpuApps" 
          :key="app.app_id" 
          class="app-item"
          @click="() => selectApp(app.app_id, 'cpu')"
        >
          <div class="app-icon-container">
            <img 
              :src="app.icon_path ? `/api/api/get_image/${app.icon_path}` : defineIcon"
              :alt="app.app_name"
              class="app-icon"
            />
          </div>
          <div class="app-info">
            <div class="app-name" :title="app.app_name">{{ app.app_name }}</div>
            <div class="app-usage">
              <div class="usage-bar">
                <div 
                  class="usage-progress" 
                  :style="{ 
                    width: `${Math.min(app.cpu_usage, 100)}%`,
                    backgroundColor: getResourceColor(app.cpu_usage)
                  }"
                ></div>
              </div>
              <div class="usage-value">{{ app.cpu_usage?.toFixed(2) }}%</div>
            </div>
          </div>
        </div>
        
        <div v-if="sortedCpuApps.length === 0" class="empty-list">
          暂无应用数据
        </div>
      </div>
      
      <!-- Memory apps list -->
      <div v-else class="app-items">
        <div 
          v-for="app in sortedMemoryApps" 
          :key="app.app_id" 
          class="app-item"
          @click="() => selectApp(app.app_id, 'memory')"
        >
          <div class="app-icon-container">
            <img 
              :src="app.icon_path ? `/api/api/get_image/${app.icon_path}` : defineIcon"
              :alt="app.app_name"
              class="app-icon"
            />
          </div>
          <div class="app-info">
            <div class="app-name" :title="app.app_name">{{ app.app_name }}</div>
            <div class="app-usage">
              <div class="usage-bar">
                <div 
                  class="usage-progress" 
                  :style="{ 
                    width: `${Math.min((app.memory_usage_mb / 1024 / 16), 100)}%`,
                    backgroundColor: getResourceColor(app.memory_usage_mb / 1024 / 16)
                  }"
                ></div>
              </div>
              <div class="usage-value">{{ (app.memory_usage_mb / 1024 / 16)?.toFixed(2) }}%</div>
            </div>
          </div>
        </div>
        
        <div v-if="sortedMemoryApps.length === 0" class="empty-list">
          暂无应用数据
        </div>
      </div>
    </div>
    
    <!-- App detail popup -->
    <div v-if="showPopup" class="overlay" @click="closePopup"></div>
    <div v-if="showPopup" class="popup">
      <div class="popup-header">
        <h3>应用详情</h3>
        <button class="close-button" @click="closePopup">
          <X size="18" />
        </button>
      </div>
      
      <div class="popup-content">
        <!-- App info section -->
        <div class="app-info-section">
          <div class="app-icon-large">
            <img 
              :src="detaileData.icon_path ? `/api/api/get_image/${detaileData.icon_path}` : defineIcon"
              :alt="detaileData.app_name"
            />
          </div>
          <div class="app-details">
            <h2 class="app-title">{{ detaileData.app_name }}</h2>
            <div class="app-path">{{ detaileData.executable_path || '未知路径' }}</div>
            <div class="app-power-level">
              <span>电源消耗评级:</span>
              <span 
                class="power-badge"
                :style="{ backgroundColor: getPowerLevelColor(detaileData.power_use_level) }"
              >
                {{ detaileData.power_use_level || '未知' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Resource metrics -->
        <div class="resource-metrics">
          <div class="resource-card">
            <div class="resource-header">
              <Cpu size="16" />
              <span>CPU 使用率</span>
            </div>
            <div class="resource-value">{{ detaileData.cpu_usage?.toFixed(2) || '0.00' }}%</div>
            <div class="resource-bar">
              <div 
                class="resource-progress" 
                :style="{ 
                  width: `${Math.min(detaileData.cpu_usage || 0, 100)}%`,
                  backgroundColor: getResourceColor(detaileData.cpu_usage)
                }"
              ></div>
            </div>
          </div>
          
          <div class="resource-card">
            <div class="resource-header">
              <Database size="16" />
              <span>内存使用率</span>
            </div>
            <div class="resource-value">
              {{ (detaileData.memory_usage_mb / 1024 / 16)?.toFixed(2) || '0.00' }}%
            </div>
            <div class="resource-bar">
              <div 
                class="resource-progress" 
                :style="{ 
                  width: `${Math.min((detaileData.memory_usage_mb / 1024 / 16) || 0, 100)}%`,
                  backgroundColor: getResourceColor(detaileData.memory_usage_mb / 1024 / 16)
                }"
              ></div>
            </div>
          </div>
          
          <div class="resource-card">
            <div class="resource-header">
              <HardDrive size="16" />
              <span>磁盘读取</span>
            </div>
            <div class="resource-value">{{ detaileData.disk_io_read?.toFixed(2) || '0.00' }} KB/s</div>
          </div>
          
          <div class="resource-card">
            <div class="resource-header">
              <HardDrive size="16" />
              <span>磁盘写入</span>
            </div>
            <div class="resource-value">{{ detaileData.disk_io_write?.toFixed(2) || '0.00' }} KB/s</div>
          </div>
        </div>
        
        <!-- Protection controls -->
        <div class="protection-controls">
          <h4 class="section-title">保护措施</h4>
          
          <div class="control-item">
            <div class="control-info">
              <div class="control-label">进程伪装</div>
              <div class="control-desc">隐藏真实进程ID，使用伪装ID替代</div>
            </div>
            <a-switch 
              v-model="appMRule.is_camouflaged" 
              @change="postAppMRule"
              type="round" 
              checked-color="#14C9C9" 
              unchecked-color="#F53F3F"
            >
              <template #checked>ON</template>
              <template #unchecked>OFF</template>
            </a-switch>
          </div>
          
          <div v-if="appMRule.is_camouflaged" class="camouflage-input">
            <a-input-search 
              v-model="appMRule.camouflage_pid" 
              placeholder="输入伪装进程ID" 
              allow-clear 
              search-button
            >
              <template #prefix>进程ID</template>
              <template #button-default>
                <div @click="postAppMRule" class="send-button">
                  <Save v-if="!saveSuccess" size="14" />
                  <div v-else class="success-icon">✓</div>
                </div>
              </template>
            </a-input-search>
          </div>
          
          <div class="control-item">
            <div class="control-info">
              <div class="control-label">反录屏</div>
              <div class="control-desc">防止应用界面被录制或截取</div>
            </div>
            <a-switch 
              v-model="appMRule.is_recording_prevention_enabled" 
              @change="postAppMRule"
              type="round" 
              checked-color="#14C9C9" 
              unchecked-color="#F53F3F"
            >
              <template #checked>ON</template>
              <template #unchecked>OFF</template>
            </a-switch>
          </div>
          
          <div class="control-item">
            <div class="control-info">
              <div class="control-label">应用保护</div>
              <div class="control-desc">防止应用被非法访问或修改</div>
            </div>
            <a-switch 
              v-model="appMRule.is_protected" 
              @change="postAppMRule"
              type="round" 
              checked-color="#14C9C9" 
              unchecked-color="#F53F3F"
            >
              <template #checked>ON</template>
              <template #unchecked>OFF</template>
            </a-switch>
          </div>
        </div>
        
        <!-- View detailed analysis button -->
        <div class="detail-button">
          <button @click="goToAppDetail(detaileData.app_id)" class="view-detail-btn">
            <BarChart2 size="16" />
            <span>查看详细分析</span>
            <ChevronRight size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main container */
.app-list-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 345px;
}

/* Header with system status */
.app-list-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(233, 220, 167, 0.877);
  font-size: 16px;
  font-weight: 600;
}

.status-icon {
  color: rgba(233, 220, 167, 0.877);
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: rgba(233, 220, 167, 0.877);
  min-width: 50px;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.5s ease, background-color 0.5s ease;
}

/* Tabs */
.app-list-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: rgba(40, 40, 40, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
}

.tab-button.active {
  background-color: rgba(20, 201, 201, 0.2);
  border-color: #14C9C9;
  color: #ffffff;
}

/* App list content */
.app-list-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  padding: 4px;
}

.app-list-content.is-loading {
  opacity: 0.7;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #14C9C9;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.app-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.app-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.app-item:hover {
  background-color: rgba(40, 40, 40, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.app-icon-container {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(95, 74, 5, 0.5);
  object-fit: contain;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-name {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-usage {
  display: flex;
  align-items: center;
  gap: 10px;
}

.usage-bar {
  flex: 1;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.usage-progress {
  height: 100%;
  transition: width 0.5s ease, background-color 0.5s ease;
}

.usage-value {
  font-size: 12px;
  color: rgba(233, 220, 167, 0.877);
  min-width: 50px;
  text-align: right;
}

.empty-list {
  padding: 30px;
  text-align: center;
  color: #a0a0a0;
  font-size: 14px;
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
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
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
  max-height: calc(90vh - 60px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* App info section */
.app-info-section {
  display: flex;
  gap: 20px;
  align-items: center;
}

.app-icon-large {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-icon-large img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(95, 74, 5, 0.7);
  object-fit: contain;
}

.app-details {
  flex: 1;
  min-width: 0;
}

.app-title {
  font-size: 22px;
  color: #ffffff;
  margin: 0 0 8px 0;
  word-break: break-word;
}

.app-path {
  font-size: 14px;
  color: #a0a0a0;
  margin-bottom: 8px;
  word-break: break-word;
}

.app-power-level {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #e0e0e0;
}

.power-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

/* Resource metrics */
.resource-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.resource-card {
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a0a0a0;
  margin-bottom: 10px;
}

.resource-value {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 10px;
}

.resource-bar {
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.resource-progress {
  height: 100%;
  transition: width 0.5s ease, background-color 0.5s ease;
}

/* Protection controls */
.protection-controls {
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.control-info {
  flex: 1;
}

.control-label {
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 4px;
}

.control-desc {
  font-size: 12px;
  color: #a0a0a0;
}

.camouflage-input {
  margin-bottom: 16px;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  color: #52c41a;
  font-weight: bold;
}

/* View detail button */
.detail-button {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.view-detail-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #14C9C9;
  color: #000000;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-detail-btn:hover {
  background-color: #0fb8b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .popup {
    width: 90%;
  }
  
  .resource-metrics {
    grid-template-columns: 1fr;
  }
  
  .app-info-section {
    flex-direction: column;
    text-align: center;
  }
  
  .control-item {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .control-item .arco-switch {
    margin-left: auto;
  }
}
</style>