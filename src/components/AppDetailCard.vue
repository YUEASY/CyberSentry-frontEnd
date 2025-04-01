<template>
    <div class="app-detail-card">
        <!-- App Info Section -->
        <div class="app-info-section">
            <div class="app-icon-container">
                <img :src="appIconPath ? `/api/api/get_image/${getSafeImagePath(appIconPath)}` : '/icon.png'"
                    alt="App Icon" class="app-icon" />
            </div>
            <div class="app-info">
                <div class="app-header">
                    <h2 class="app-title">{{ appName }}</h2>
                    <div class="risk-tag" :class="{ 'high-risk': isHighRisk }">
                        {{ isHighRisk ? '高风险' : '安全' }}
                    </div>
                </div>
                <div class="app-path">{{ executablePath }}</div>
                <div class="app-update-time">
                    更新时间: {{ formatTime(updateTime) }}
                    <a-button size="small" class="update-btn" @click="refreshData">
                        <template #icon>
                            <RefreshCw size="14" />
                        </template>
                        刷新
                    </a-button>
                </div>
            </div>
        </div>

        <!-- Protection Controls Section -->
        <div class="protection-controls">
            <h3 class="section-title">保护措施</h3>
            <div class="controls-grid">
                <div class="control-item">
                    <span class="control-label">反录屏</span>
                    <a-switch v-model="controls.antiScreenRecording"
                        @change="updateRule('is_recording_prevention_enabled', controls.antiScreenRecording)"
                        type="round" checked-color="#14C9C9" unchecked-color="#F53F3F" />
                    <span class="control-hint">反录屏、截屏</span>
                </div>
                <div class="control-item">
                    <span class="control-label">运行保护</span>
                    <a-switch v-model="controls.runtimeProtection"
                        @change="updateRule('is_protected', controls.runtimeProtection)" type="round"
                        checked-color="#14C9C9" unchecked-color="#F53F3F" />
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
                        <a-button size="small" type="primary"
                            @click="updateRule('camouflage_pid', controls.camouflagePid)">
                            应用
                        </a-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resource Charts Section -->
        <div class="resource-charts">
            <h3 class="section-title">资源监控</h3>
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
                        <span class="current-value">读: {{ currentDiskRead }} KB/s | 写: {{ currentDiskWrite }}
                            KB/s</span>
                    </div>
                    <div ref="diskChart" class="chart"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, onBeforeUnmount } from 'vue';
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
import { useMRuleStore } from '@/stores/mrule';
import { useAppRMStore } from '@/stores/apprm';
import { RefreshCw } from 'lucide-vue-next';

// Register necessary components
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

const props = defineProps({
    appId: {
        type: Number,
        required: true
    },
    appName: {
        type: String,
        default: '未知应用'
    },
    executablePath: {
        type: String,
        default: ''
    },
    appIconPath: {
        type: String,
        default: ''
    },
    updateTime: {
        type: String,
        default: ''
    },
    isHighRisk: {
        type: Boolean,
        default: false
    }
});

function getSafeImagePath(path) {
    if (!path) return '';
    // 统一路径分隔符
    const normalized = path.replace(/\\/g, '/');
    // 获取最后一个非空部分
    const parts = normalized.split('/').filter(Boolean);
    console.log(path);
    console.log(parts[parts.length - 1]);
    return parts.length ? parts[parts.length - 1] : '';
}

const mruleStore = useMRuleStore();
const appRMStore = useAppRMStore();

const cpuChart = ref(null);
const memoryChart = ref(null);
const diskChart = ref(null);

const cpuChartInstance = ref(null);
const memoryChartInstance = ref(null);
const diskChartInstance = ref(null);

const controls = reactive({
    antiScreenRecording: false,
    runtimeProtection: false,
    camouflage: false,
    camouflagePid: ''
});

const resourceData = reactive({
    cpu: [],
    memory: [],
    disk: []
});

// Current values and trends
const currentCpuUsage = ref('0.00');
const currentMemoryUsage = ref('0.00');
const currentDiskRead = ref('0.00');
const currentDiskWrite = ref('0.00');

// Compute trends
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

const formatTime = (time) => {
    if (!time) return '未知';
    const date = new Date(time);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const initCharts = () => {
    // Initialize charts
    cpuChartInstance.value = echarts.init(cpuChart.value);
    memoryChartInstance.value = echarts.init(memoryChart.value);
    diskChartInstance.value = echarts.init(diskChart.value);

    // Set initial empty data
    updateCharts();
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

const fetchAppRules = async () => {
    try {
        const ruleData = await mruleStore.mruleInfo(props.appId);
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

const fetchResourceData = async () => {
    try {
        // Get app-specific resource monitoring data
        const appResourceData = await appRMStore.appRMInfoAppId(props.appId);
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
            app_id: props.appId,
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

const refreshData = () => {
    fetchAppRules();
    fetchResourceData();
};

// Refresh interval
let refreshInterval = null;

onMounted(() => {
    initCharts();
    fetchAppRules();
    fetchResourceData();

    // Refresh data every 60 seconds
    refreshInterval = setInterval(() => {
        fetchResourceData();
    }, 60000);

    // Listen for window resize to adjust chart size
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    // Clear timer and event listener
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
    cpuChartInstance.value?.resize();
    memoryChartInstance.value?.resize();
    diskChartInstance.value?.resize();
};

</script>

<style scoped>
.app-detail-card {
    background-color: rgba(30, 30, 30, 0.6);
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
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
    display: flex;
    align-items: center;
    gap: 10px;
}

.update-btn {
    background-color: rgba(40, 40, 40, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
    border-radius: 4px;
}

.update-btn:hover {
    background-color: rgba(50, 50, 50, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
}

.protection-controls {
    background-color: rgba(40, 40, 40, 0.6);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
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

.resource-charts {
    background-color: rgba(40, 40, 40, 0.6);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
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
    height: 200px;
    width: 100%;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
    .charts-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .app-info-section {
        flex-direction: column;
    }

    .charts-grid {
        grid-template-columns: 1fr;
    }

    .controls-grid {
        grid-template-columns: 1fr;
    }

    .control-item {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>