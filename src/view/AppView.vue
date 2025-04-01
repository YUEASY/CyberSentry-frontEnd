<template>
    <div class="app-view-container">
        <div class="app-view-layout">
            <!-- Left side: App list -->
            <div class="app-list-section">
                <!-- List header -->
                <div class="list-header">
                    <h2 class="section-title">应用列表</h2>
                    <div class="header-actions">
                        <a-button type="outline" size="small" @click="init" :loading="loading">
                            <template #icon>
                                <RefreshCw size="14" />
                            </template>
                            刷新
                        </a-button>
                    </div>
                </div>

                <!-- Table header -->
                <div class="list-item header">
                    <div class="header-item icon-column">图 标</div>
                    <div class="header-item name-column">应用名称</div>
                    <div class="header-item sortable" @click="toggleSort('cpu')">
                        CPU
                        <span v-if="sortBy === 'cpu'" class="sort-indicator">
                            {{ sortDirection === 'asc' ? '↑' : '↓' }}
                        </span>
                    </div>
                    <div class="header-item sortable" @click="toggleSort('memory')">
                        内存
                        <span v-if="sortBy === 'memory'" class="sort-indicator">
                            {{ sortDirection === 'asc' ? '↑' : '↓' }}
                        </span>
                    </div>
                    <div class="header-item">磁盘读取</div>
                    <div class="header-item">磁盘写入</div>
                    <div class="header-item">功耗等级</div>
                </div>

                <!-- App list -->
                <a-spin :loading="loading" class="app-list-spinner">
                    <a-list :scrollbar="true" :bordered="false" class="app-list">
                        <a-list-item v-for="d in paginatedDatas" :key="d.app_id" :bordered="false"
                            class="app-list-item">
                            <div class="list-item" @click="() => selectApp(d.app_id)"
                                :class="{ 'active': detaileData.app_id === d.app_id }">
                                <div class="icon-column">
                                    <img :width="50"
                                        :src="d.icon_path === '' ? defineIcon : `/api/api/get_image/${d.icon_path}`"
                                        class="app-icon" :alt="d.app_name" />
                                </div>
                                <div class="name-column app-name">{{ d.app_name }}</div>
                                <div class="app-element">
                                    <span :style="{ color: getResourceColor(d.cpu_usage) }">{{
                                        Math.min(d.cpu_usage,100).toFixed(2)
                                        }}%</span>
                                </div>
                                <div class="app-element">
                                    <span :style="{ color: getResourceColor((d.memory_usage_mb / 16)) }">
                                        {{ Math.min((d.memory_usage_mb / 16), 100).toFixed(2) }}%
                                    </span>
                                </div>
                                <div class="app-element">{{ d.disk_io_read?.toFixed(2) }}</div>
                                <div class="app-element">{{ d.disk_io_write?.toFixed(2) }}</div>
                                <div class="app-element">
                                    <div class="power-badge"
                                        :style="{ backgroundColor: getPowerLevelColor(d.power_use_level) }">
                                        {{ d.power_use_level }}
                                    </div>
                                </div>
                            </div>
                        </a-list-item>
                    </a-list>
                </a-spin>

                <!-- Pagination -->
                <a-pagination class="pagination" :total="datas.length" :current="currentPage"
                    @change="(page) => currentPage = page" show-total size="small" />
            </div>

            <!-- Right side: App details -->
            <div class="app-detail-section">
                <div v-if="Object.keys(detaileData).length > 0" class="app-detail-content">
                    <!-- App header -->
                    <div class="app-detail-header">
                        <div class="app-icon-container">
                            <img :src="detaileData.icon_path === '' ? defineIcon : `/api/api/get_image/${detaileData.icon_path}`"
                                :alt="detaileData.app_name" class="app-detail-icon" />
                        </div>
                        <div class="app-info">
                            <h2 class="app-title">{{ detaileData.app_name }}</h2>
                            <div class="app-path">{{ detaileData.executable_path || '未知路径' }}</div>
                            <div class="app-power">
                                <span>电源消耗评级:</span>
                                <div class="power-badge"
                                    :style="{ backgroundColor: getPowerLevelColor(detaileData.power_use_level) }">
                                    {{ detaileData.power_use_level }}
                                </div>
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
                            <div class="resource-value" :style="{ color: getResourceColor(detaileData.cpu_usage) }">
                                {{ Math.min(detaileData.cpu_usage, 100).toFixed(2) }}%
                            </div>
                            <div class="resource-bar">
                                <div class="resource-progress" :style="{
                                    width: `${Math.min(detaileData.cpu_usage || 0, 100)}%`,
                                    backgroundColor: getResourceColor(detaileData.cpu_usage)
                                }"></div>
                            </div>
                        </div>

                        <div class="resource-card">
                            <div class="resource-header">
                                <Database size="16" />
                                <span>内存使用率</span>
                            </div>
                            <div class="resource-value"
                                :style="{ color: getResourceColor((detaileData.memory_usage_mb / 16)) }">
                                {{ Math.min((detaileData.memory_usage_mb / 16), 100).toFixed(2) }}%
                            </div>
                            <div class="resource-bar">
                                <div class="resource-progress" :style="{
                                    width: `${Math.min((detaileData.memory_usage_mb / 16) || 0, 100)}%`,
                                    backgroundColor: getResourceColor((detaileData.memory_usage_mb / 16))
                                }"></div>
                            </div>
                        </div>

                        <div class="resource-card">
                            <div class="resource-header">
                                <HardDrive size="16" />
                                <span>磁盘读取</span>
                            </div>
                            <div class="resource-value">{{ detaileData.disk_io_read?.toFixed(2) }} KB/s</div>
                            <div class="resource-bar">
                                <div class="resource-progress" :style="{
                                    width: `${Math.min((detaileData.disk_io_read / 100) || 0, 100)}%`,
                                    backgroundColor: '#14C9C9'
                                }"></div>
                            </div>
                        </div>

                        <div class="resource-card">
                            <div class="resource-header">
                                <HardDrive size="16" />
                                <span>磁盘写入</span>
                            </div>
                            <div class="resource-value">{{ detaileData.disk_io_write?.toFixed(2) }} KB/s</div>
                            <div class="resource-bar">
                                <div class="resource-progress" :style="{
                                    width: `${Math.min((detaileData.disk_io_write / 100) || 0, 100)}%`,
                                    backgroundColor: '#14C9C9'
                                }"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Protection controls -->
                    <div class="protection-controls">
                        <h3 class="control-header">保护措施</h3>

                        <div class="control-item">
                            <div class="control-info">
                                <div class="control-title">进程伪装</div>
                                <div class="control-desc">隐藏真实进程ID，使用伪装ID替代</div>
                            </div>
                            <a-switch type="round" checked-color="#14C9C9" unchecked-color="#F53F3F"
                                v-model="appMRule.is_camouflaged" @change="postAppMRule">
                                <template #checked>ON</template>
                                <template #unchecked>OFF</template>
                            </a-switch>
                        </div>

                        <a-input-search v-if="appMRule.is_camouflaged" class="camouflage-input"
                            v-model="appMRule.camouflage_pid" allow-clear search-button>
                            <template #prefix>伪装进程ID</template>
                            <template #button-default>
                                <div @click="postAppMRule">应用</div>
                            </template>
                        </a-input-search>

                        <div class="control-item">
                            <div class="control-info">
                                <div class="control-title">反录屏</div>
                                <div class="control-desc">防止应用界面被录制或截取</div>
                            </div>
                            <a-switch type="round" checked-color="#14C9C9" unchecked-color="#F53F3F"
                                v-model="appMRule.is_recording_prevention_enabled" @change="postAppMRule">
                                <template #checked>ON</template>
                                <template #unchecked>OFF</template>
                            </a-switch>
                        </div>

                        <div class="control-item">
                            <div class="control-info">
                                <div class="control-title">应用保护</div>
                                <div class="control-desc">防止应用被非法访问或修改</div>
                            </div>
                            <a-switch type="round" checked-color="#14C9C9" unchecked-color="#F53F3F"
                                v-model="appMRule.is_protected" @change="postAppMRule">
                                <template #checked>ON</template>
                                <template #unchecked>OFF</template>
                            </a-switch>
                        </div>
                    </div>

                    <!-- Detail button -->
                    <div class="detail-button-container">
                        <a-button type="primary" @click="goToAppDetail(detaileData.app_id)" class="detail-button">
                            <BarChart2 size="16" />
                            <span>查看详细分析</span>
                            <ChevronRight size="16" />
                        </a-button>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-else class="empty-detail">
                    <div class="empty-icon">
                        <AppWindow size="48" />
                    </div>
                    <p class="empty-text">请选择一个应用以查看详情</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppRMStore } from '@/stores/apprm';
import { useMRuleStore } from '@/stores/mrule';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import defineIcon from '../../public/icon.png';
import {
    RefreshCw,
    Cpu,
    Database,
    HardDrive,
    BarChart2,
    ChevronRight,
    AppWindow
} from 'lucide-vue-next';

const router = useRouter();
const mrule = useMRuleStore();
const appRM = useAppRMStore();

const appMRule = ref({
    is_camouflaged: false,
    camouflage_pid: '',
    is_recording_prevention_enabled: false,
    is_protected: false
});

const datas = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const pageSize = 5;
const detaileData = ref({});

const sortBy = ref(null);
const sortDirection = ref('desc'); // 'asc' or 'desc'

const paginatedDatas = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    if (sortedDatas.value.length > 0) {
        return sortedDatas.value.slice(start, end);
    }
    return [];
});

const sortedDatas = computed(() => {
    if (!sortBy.value) return datas.value;

    return [...datas.value].sort((a, b) => {
        let valueA, valueB;

        if (sortBy.value === 'cpu') {
            valueA = a.cpu_usage;
            valueB = b.cpu_usage;
        } else if (sortBy.value === 'memory') {
            valueA = a.memory_usage_mb;
            valueB = b.memory_usage_mb;
        }

        if (sortDirection.value === 'asc') {
            return valueA - valueB;
        } else {
            return valueB - valueA;
        }
    });
});

const postAppMRule = async () => {
    try {
        await mrule.modiMrule(appMRule.value);
    } catch (error) {
        console.error('更新规则失败:', error);
    }
};

const selectApp = async (app_id) => {
    const selectedApp = paginatedDatas.value.find(data => data.app_id === app_id);
    if (selectedApp) {
        detaileData.value = { ...selectedApp };

        try {
            const ruleInfo = await mrule.mruleInfo(app_id);
            if (ruleInfo && ruleInfo !== 'error') {
                appMRule.value = {
                    app_id,
                    is_camouflaged: ruleInfo.is_camouflaged || false,
                    camouflage_pid: ruleInfo.camouflage_pid || '',
                    is_recording_prevention_enabled: ruleInfo.is_recording_prevention_enabled || false,
                    is_protected: ruleInfo.is_protected || false
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
            console.error('获取应用规则失败:', error);
        }
    }
};

const toggleSort = (field) => {
    if (sortBy.value === field) {
        // Toggle direction if already sorting by this field
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        // Set new sort field and default to descending
        sortBy.value = field;
        sortDirection.value = 'desc';
    }
};

const goToAppDetail = (appId) => {
    router.push(`/apps/${appId}`);
};

const getPowerLevelColor = (level) => {
    if (!level) return 'gray';
    if (level == '高') return '#ff4d4f';
    if (level == '中') return '#faad14';
    return '#52c41a';
};

const getResourceColor = (percentage) => {
    if (!percentage) return '#14C9C9';
    const num = Number(percentage);
    if (num >= 80) return '#F53F3F';
    if (num >= 60) return '#FF7D00';
    if (num >= 40) return '#FFBB00';
    return '#14C9C9';
};

const init = async () => {
    loading.value = true;
    try {
        datas.value = await appRM.appRMInfos() || [];
    } catch (error) {
        console.error('获取应用资源监控数据失败:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    init();

    // 设置定时刷新
    const refreshInterval = setInterval(async () => {
        try {
            const newData = await appRM.appRMInfos();
            if (newData) {
                datas.value = newData;

                // 如果有选中的应用，更新其详情
                if (detaileData.value.app_id) {
                    const updatedApp = newData.find(app => app.app_id === detaileData.value.app_id);
                    if (updatedApp) {
                        detaileData.value = { ...updatedApp };
                    }
                }
            }
        } catch (error) {
            console.error('刷新应用数据失败:', error);
        }
    }, 1000 * 60 * 3); // 每3分钟刷新一次

    return () => {
        clearInterval(refreshInterval);
    };
});
</script>

<style scoped>
.app-view-container {
    height: 800px;
    margin-right: 30px;
    background-color: #1e1e1e;
    color: #e0e0e0;
    padding: 20px;
}

.app-view-layout {
    display: flex;
    gap: 20px;
    max-width: 1600px;
    margin: 0 auto;
}

/* Left side: App list */
.app-list-section {
    flex: 3;
    display: flex;
    flex-direction: column;
    background-color: rgba(30, 30, 30, 0.6);
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 10px;
}

/* Table header */
.list-item {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: background 0.2s;
}

.list-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.list-item.active {
    background: rgba(20, 201, 201, 0.1);
    border-left: 4px solid #14C9C9;
}

.list-item.header {
    background: rgba(0, 0, 0, 0.2);
    font-weight: 500;
    cursor: default;
}

.header-item {
    flex: 1;
    text-align: center;
    color: rgba(233, 220, 167, 0.877);
    font-size: 14px;
}

.icon-column {
    flex: 0 0 60px;
    display: flex;
    justify-content: flex-end;
}

.name-column {
    flex: 2;
    padding-left: 10px;
}

.app-list-spinner {
    flex: 1;
    overflow: hidden;
}

.app-list {
    height: 100%;
    overflow-y: auto;
}

.app-list-item {
    padding: 0;
    border: none;
}

.app-icon {
    box-shadow: 0 0 8px rgba(95, 74, 5, 0.5);
    border-radius: 10px;
}

.app-name {
    font-size: 14px;
    color: #ffffff;
    font-weight: 400;
}

.app-element {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #e0e0e0;
    font-weight: 300;
}

.power-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
}

.pagination {
    margin: 16px auto;
    display: flex;
    justify-content: center;
}

/* Right side: App details */
.app-detail-section {
    flex: 2;
    background-color: rgba(30, 30, 30, 0.6);
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.app-detail-content {
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.app-detail-header {
    display: flex;
    gap: 20px;
}

.app-icon-container {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.app-detail-icon {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    box-shadow: 0 0 12px rgba(95, 74, 5, 0.7);
    object-fit: contain;
}

.app-info {
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

.app-power {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #e0e0e0;
}

/* Resource metrics */
.resource-metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.resource-card {
    background-color: rgba(40, 40, 40, 0.6);
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
    background-color: rgba(40, 40, 40, 0.6);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.control-header {
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

.control-title {
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

/* Detail button */
.detail-button-container {
    margin-top: auto;
    display: flex;
    justify-content: center;
}

.detail-button {
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

.detail-button:hover {
    background-color: #0fb8b8;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Empty state */
.empty-detail {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #a0a0a0;
    padding: 40px;
}

.empty-icon {
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-text {
    font-size: 16px;
}

/* Override Arco Design styles for dark theme */
:deep(.arco-btn) {
    border-radius: 4px;
}

:deep(.arco-pagination-item) {
    background-color: #333333;
    color: #e0e0e0;
    border-color: #444444;
}

:deep(.arco-pagination-item.arco-pagination-item-active) {
    background-color: #14C9C9;
    color: #000000;
    border-color: #14C9C9;
}

:deep(.arco-input-wrapper) {
    background-color: #333333;
    border-color: #444444;
}

:deep(.arco-input) {
    color: #e0e0e0;
}

:deep(.arco-input-group-wrapper) {
    background-color: #333333;
}

:deep(.arco-input-group-addbefore) {
    background-color: #444444;
    color: #a0a0a0;
    border-color: #444444;
}

:deep(.arco-btn-secondary) {
    background-color: #444444;
    color: #e0e0e0;
    border-color: #444444;
}

.header-item.sortable {
    cursor: pointer;
    position: relative;
    user-select: none;
}

.header-item.sortable:hover {
    color: #14C9C9;
}

.sort-indicator {
    margin-left: 4px;
    font-weight: bold;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
    .app-view-layout {
        flex-direction: column;
    }

    .resource-metrics {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .control-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}
</style>
