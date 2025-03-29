<template>
    <div class="app-detail-card">
        <!-- App Info Section -->
        <div class="app-info-section">
            <div class="app-icon-container">
                <img :src="appIconPath ? formatIconPath(appIconPath) : '/placeholder.png'" alt="App Icon"
                    class="app-icon" />
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
                    <a-button size="small" class="update-btn" @click="refreshData">刷新</a-button>
                </div>
            </div>
        </div>

        <!-- Protection Controls Section -->
        <div class="protection-controls">
            <div class="control-item">
                <span class="control-label">反录屏</span>
                <a-switch v-model="controls.antiScreenRecording"
                    @change="updateRule('is_recording_prevention_enabled', controls.antiScreenRecording)" />
                <span class="control-hint">反录屏、截屏</span>
            </div>
            <div class="control-item">
                <span class="control-label">运行保护</span>
                <a-switch v-model="controls.runtimeProtection"
                    @change="updateRule('is_protected', controls.runtimeProtection)" />
                <span class="control-hint">保护应用不被篡改</span>
            </div>
            <div class="control-item">
                <span class="control-label">伪装</span>
                <a-switch v-model="controls.camouflage" @change="updateRule('is_camouflaged', controls.camouflage)" />
                <span class="control-hint">伪装应用id</span>
            </div>
            <div v-if="controls.camouflage" class="control-item">
                <span class="control-label">伪装ID</span>
                <a-input v-model="controls.camouflagePid" placeholder="输入伪装进程ID" style="width: 200px;" />
                <a-button size="small" type="primary" @click="updateRule('camouflage_pid', controls.camouflagePid)"
                    style="margin-left: 10px;">
                    应用
                </a-button>
            </div>
        </div>

        <!-- Resource Charts Section -->
        <div class="resource-charts">
            <div class="chart-container">
                <h3>CPU 使用率</h3>
                <div class="chart-info">
                    <span class="current-value">{{ currentCpuUsage }}%</span>
                    <span class="trend" :class="cpuTrend.class">{{ cpuTrend.text }}</span>
                </div>
                <div ref="cpuChart" class="chart"></div>
            </div>
            <div class="chart-container">
                <h3>内存使用</h3>
                <div class="chart-info">
                    <span class="current-value">{{ currentMemoryUsage }} MB</span>
                    <span class="trend" :class="memoryTrend.class">{{ memoryTrend.text }}</span>
                </div>
                <div ref="memoryChart" class="chart"></div>
            </div>
            <div class="chart-container">
                <h3>磁盘 I/O</h3>
                <div class="chart-info">
                    <span class="current-value">读: {{ currentDiskRead }} KB/s | 写: {{ currentDiskWrite }} KB/s</span>
                </div>
                <div ref="diskChart" class="chart"></div>
            </div>
        </div>
    </div>
</template>

<script>
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

// 注册必要的组件
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

export default {
    name: 'AppDetailCard',
    props: {
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
    },
    setup(props) {
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

        // 当前值和趋势
        const currentCpuUsage = ref('0.00');
        const currentMemoryUsage = ref('0.00');
        const currentDiskRead = ref('0.00');
        const currentDiskWrite = ref('0.00');

        // 计算趋势
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
            // 初始化图表
            cpuChartInstance.value = echarts.init(cpuChart.value);
            memoryChartInstance.value = echarts.init(memoryChart.value);
            diskChartInstance.value = echarts.init(diskChart.value);

            // 设置初始空数据
            updateCharts();
        };

        const updateCharts = () => {
            // 提取时间和数据
            const times = resourceData.cpu.map(item => {
                const date = new Date(item.sample_time);
                return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
            });

            const cpuData = resourceData.cpu.map(item => item.cpu_usage);
            const memoryData = resourceData.memory.map(item => item.memory_usage_mb);
            const diskReadData = resourceData.disk.map(item => item.disk_io_read);
            const diskWriteData = resourceData.disk.map(item => item.disk_io_write);

            // 更新当前值
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

            // CPU图表配置
            const cpuOption = {
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}<br/>{a}: {c}%'
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
                        color: '#666'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ddd'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '%',
                    nameTextStyle: {
                        color: '#666'
                    },
                    axisLabel: {
                        color: '#666'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ddd'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#eee'
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
                            color: '#7B66FF'
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
                                    color: 'rgba(123, 102, 255, 0.5)'
                                }, {
                                    offset: 1,
                                    color: 'rgba(123, 102, 255, 0.1)'
                                }]
                            }
                        }
                    }
                ]
            };

            // 内存图表配置
            const memoryOption = {
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}<br/>{a}: {c} MB'
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
                        color: '#666'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ddd'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'MB',
                    nameTextStyle: {
                        color: '#666'
                    },
                    axisLabel: {
                        color: '#666'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ddd'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#eee'
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

            // 磁盘图表配置
            const diskOption = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        return params[0].axisValueLabel + '<br/>' +
                            params[0].marker + params[0].seriesName + ': ' + params[0].value + ' KB/s<br/>' +
                            params[1].marker + params[1].seriesName + ': ' + params[1].value + ' KB/s';
                    }
                },
                legend: {
                    data: ['读取', '写入'],
                    right: 10,
                    top: 0,
                    textStyle: {
                        color: '#666'
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
                        color: '#666'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ddd'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'KB/s',
                    nameTextStyle: {
                        color: '#666'
                    },
                    axisLabel: {
                        color: '#666'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ddd'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#eee'
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

            // 设置图表选项
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
                // 获取应用特定的资源监控数据
                const appResourceData = await appRMStore.appRMInfoAppId(props.appId);
                if (appResourceData && appResourceData !== 'error') {
                    // 按时间排序
                    const sortedData = Array.isArray(appResourceData)
                        ? [...appResourceData].sort((a, b) => new Date(a.sample_time) - new Date(b.sample_time))
                        : [];

                    // 最多显示最近10条数据
                    const recentData = sortedData.slice(-10);

                    resourceData.cpu = recentData;
                    resourceData.memory = recentData;
                    resourceData.disk = recentData;

                    // 更新图表
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

                // 更新特定规则
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

        // 定时刷新数据
        let refreshInterval = null;

        onMounted(() => {
            initCharts();
            fetchAppRules();
            fetchResourceData();

            // 每60秒刷新一次数据
            refreshInterval = setInterval(() => {
                fetchResourceData();
            }, 60000);

            // 监听窗口大小变化，重新调整图表大小
            window.addEventListener('resize', handleResize);
        });

        onBeforeUnmount(() => {
            // 清除定时器和事件监听
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

        const formatIconPath = (path) => {
            if (!path) return '';

            if (path.includes('ProcessIcon/')) {
                // 提取 'ProcessIcon/' 之后的部分
                const suffix = path.substring(path.indexOf('ProcessIcon/'));
                return `/api/${suffix}`;
            } else {
                // 提取文件名部分（兼容不同路径分隔符）
                const filename = path.split(/[/\\]/).pop(); // 处理 '/' 或 '\' 分隔符
                return `/api/image/ProcessIcon/${filename}`;
            }
        };

        return {
            cpuChart,
            memoryChart,
            diskChart,
            controls,
            formatTime,
            updateRule,
            refreshData,
            currentCpuUsage,
            currentMemoryUsage,
            currentDiskRead,
            currentDiskWrite,
            cpuTrend,
            memoryTrend,
            formatIconPath
        };
    }
};
</script>

<style scoped>
.app-detail-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 20px;
    margin-bottom: 20px;
}

.app-info-section {
    display: flex;
    margin-bottom: 20px;
}

.app-icon-container {
    width: 120px;
    height: 120px;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
}

.app-icon {
    max-width: 100%;
    max-height: 100%;
}

.app-info {
    flex: 1;
}

.app-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.app-title {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    margin-right: 15px;
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
    color: #666;
    margin-bottom: 10px;
}

.app-update-time {
    font-size: 14px;
    color: #999;
    display: flex;
    align-items: center;
}

.update-btn {
    margin-left: 10px;
    background-color: #f0f0f0;
    border-radius: 15px;
}

.protection-controls {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.control-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.control-label {
    width: 80px;
    font-weight: bold;
}

.control-hint {
    margin-left: 15px;
    font-size: 12px;
    color: #999;
}

.resource-charts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.chart-container {
    background-color: #fff;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
    border: 1px solid #f0f0f0;
}

.chart-container h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
    margin-bottom: 10px;
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
    color: #333;
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
    color: #00b42a;
    background-color: rgba(0, 180, 42, 0.1);
}

.trend.stable {
    color: #7b66ff;
    background-color: rgba(123, 102, 255, 0.1);
}

.chart {
    height: 200px;
    width: 100%;
}

@media (max-width: 1200px) {
    .resource-charts {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .resource-charts {
        grid-template-columns: 1fr;
    }

    .app-info-section {
        flex-direction: column;
    }

    .app-icon-container {
        margin-right: 0;
        margin-bottom: 15px;
    }
}
</style>
