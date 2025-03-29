<template>
    <a-row style="height: 100%;">
        <a-col :flex="6" style="display: flex; flex-direction: column; align-items: center; height: 100%;">
            <!-- 表头 -->
            <div class="list-item header">
                <div class="header-item icon-column">图标</div>
                <div class="header-item name-column">应用名称</div>
                <div class="header-item">CPU</div>
                <div class="header-item">内存</div>
                <div class="header-item">磁盘读取</div>
                <div class="header-item">磁盘写入</div>
                <div class="header-item">功耗等级</div>
            </div>

            <a-spin :loading="loading" style="width: 100%; flex: 1;">
                <a-list :scrollbar="true" :bordered="false" style="flex: 1; width: 100%;">
                    <a-list-item v-for="d in paginatedDatas" :key="d.app_id" :bordered="false"
                        :style="{ 'border': 'none', 'padding': '0px', innerHeight: '100%' }">
                        <div class="list-item" @click="() => selectApp(d.app_id)"
                            :class="{ 'active': detaileData.app_id === d.app_id }">
                            <div class="icon-column">
                                <img :width="50" :src="d.icon_path === '' ? defineIcon : `/api/image/${d.icon_path}`"
                                    class="app-icon" :alt="d.app_name" />
                            </div>
                            <div class="name-column app-name">{{ d.app_name }}</div>
                            <div class="app-element">{{ d.cpu_usage?.toFixed(2) }}%</div>
                            <div class="app-element">{{ (d.memory_usage_mb / 1024 / 16)?.toFixed(2) }}%</div>
                            <div class="app-element">{{ d.disk_io_read?.toFixed(2) }}</div>
                            <div class="app-element">{{ d.disk_io_write?.toFixed(2) }}</div>
                            <div class="app-element">
                                <a-tag :color="getPowerLevelColor(d.power_use_level)">{{ d.power_use_level }}</a-tag>
                            </div>
                        </div>
                    </a-list-item>
                </a-list>
            </a-spin>

            <a-pagination class="pagination" :total="datas.length" :current="currentPage"
                @change="(page) => currentPage = page" show-total size="small" />
        </a-col>

        <a-col :flex="4">
            <div v-if="Object.keys(detaileData).length > 0" class="app-detailed-wrapper">
                <!-- 修改后的应用详情区 -->
                <div class="app-detailed-head">
                    <img :width="80" class="app-detailed-img"
                        :src="detaileData.icon_path === '' ? defineIcon : `/api/image/${detaileData.icon_path}`"
                        :alt="detaileData.app_name" />
                    <div class="app-detailed-name">
                        {{ detaileData.app_name }}
                        <div class="app-detailed-power">
                            电源消耗评级:
                            <a-tag :color="getPowerLevelColor(detaileData.power_use_level)" size="medium">
                                {{ detaileData.power_use_level }}
                            </a-tag>
                        </div>
                    </div>
                </div>

                <!-- 资源使用情况卡片 -->
                <div class="resource-cards">
                    <div class="resource-card">
                        <div class="resource-title">CPU 使用率</div>
                        <div class="resource-value">{{ detaileData.cpu_usage?.toFixed(2) }}%</div>
                        <a-progress :percent="Number(detaileData.cpu_usage?.toFixed(2)/100)"
                            :stroke-color="getResourceColor(detaileData.cpu_usage)"
                            :track-color="'rgba(255, 255, 255, 0.1)'" />
                    </div>
                    <div class="resource-card">
                        <div class="resource-title">内存使用率</div>
                        <div class="resource-value">{{ (detaileData.memory_usage_mb / 1024 / 16)?.toFixed(2) }}%</div>
                        <a-progress :percent="Number((detaileData.memory_usage_mb / 1024 / 16)?.toFixed(2)/100)"
                            :stroke-color="getResourceColor((detaileData.memory_usage_mb / 1024 / 16))"
                            :track-color="'rgba(255, 255, 255, 0.1)'" />
                    </div>
                    <div class="resource-card">
                        <div class="resource-title">磁盘读取 (KB/s)</div>
                        <div class="resource-value">{{ detaileData.disk_io_read?.toFixed(2) }}</div>
                        <a-progress :percent="Math.min(100, Number(detaileData.disk_io_read?.toFixed(2)) / 10)"
                            :stroke-color="'#14C9C9'" :track-color="'rgba(255, 255, 255, 0.1)'" />
                    </div>
                    <div class="resource-card">
                        <div class="resource-title">磁盘写入 (KB/s)</div>
                        <div class="resource-value">{{ detaileData.disk_io_write?.toFixed(2) }}</div>
                        <a-progress :percent="Math.min(100, Number(detaileData.disk_io_write?.toFixed(2)) / 10)"
                            :stroke-color="'#14C9C9'" :track-color="'rgba(255, 255, 255, 0.1)'" />
                    </div>
                </div>

                <!-- 保护控制区域 -->
                <div class="protection-controls">
                    <div class="control-header">保护措施</div>

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

                    <a-input-search v-if="appMRule.is_camouflaged"
                        :style="{ width: '100%', marginTop: '8px', marginBottom: '16px' }"
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

                <!-- 详情按钮 -->
                <div class="detail-button-container">
                    <a-button type="primary" @click="goToAppDetail(detaileData.app_id)">
                        查看详细分析
                    </a-button>
                </div>
            </div>
            <div v-else class="empty-detail">
                <a-empty description="请选择一个应用以查看详情" />
            </div>
        </a-col>
    </a-row>
</template>

<script setup>
import { useAppRMStore } from '@/stores/apprm';
import { useMRuleStore } from '@/stores/mrule';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import defineIcon from '../../public/icon.png';

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
const pageSize = 10;
const detaileData = ref({});

const paginatedDatas = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    if (datas.value.length > 0) {
        return datas.value.slice(start, end);
    }
    return [];
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

const goToAppDetail = (appId) => {
    router.push(`/apps/${appId}`);
};

const getPowerLevelColor = (level) => {
    if (!level) return 'gray';
    const numLevel = Number(level);
    if (numLevel >= 4) return 'red';
    if (numLevel >= 3) return 'orange';
    if (numLevel >= 2) return 'blue';
    return 'green';
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
/* 列表样式 */
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
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    font-weight: 500;
    cursor: default;
}

.header-item {
    flex: 1;
    text-align: center;
    color: rgb(200, 200, 200);
    font-size: 14px;
}

.icon-column {
    flex: 0 0 60px;
    display: flex;
    justify-content: center;
}

.name-column {
    flex: 2;
    text-align: left;
    padding-left: 10px;
}

.app-icon {
    box-shadow: 0 0 8px rgba(95, 74, 5, 0.5);
    border-radius: 10px;
}

.app-name {
    font-size: 14px;
    color: rgb(220, 220, 220);
    font-weight: 400;
}

.app-element {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: rgb(220, 220, 220);
    font-weight: 300;
}

.pagination {
    margin-top: 16px;
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
    width: 100%;
}

/* 详情区样式 */
.app-detailed-wrapper {
    height: 100%;
    width: 100%;
    padding: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
}

.app-detailed-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
}

.app-detailed-img {
    box-shadow: 0 0 12px rgba(95, 74, 5, 0.7);
    border-radius: 12px;
    margin-bottom: 16px;
}

.app-detailed-name {
    font-size: 22px;
    color: white;
    text-align: center;
    width: 100%;
}

.app-detailed-power {
    margin-top: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}

/* 资源卡片部分 */
.resource-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
}

.resource-card {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 16px;
}

.resource-title {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
}

.resource-value {
    font-size: 24px;
    font-weight: 500;
    color: white;
    margin-bottom: 8px;
}

/* 控制区样式 */
.protection-controls {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
}

.control-header {
    font-size: 18px;
    color: white;
    margin-bottom: 16px;
    font-weight: 500;
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
    color: white;
}

.control-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4px;
}

.detail-button-container {
    display: flex;
    justify-content: center;
    margin-top: auto;
    padding-top: 16px;
}

.empty-detail {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
}

@media (max-width: 1200px) {
    .resource-cards {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .control-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .control-item .arco-switch {
        margin-top: 8px;
    }
}
</style>
