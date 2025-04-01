<template>
    <div class="ai-analysis-view">
      <!-- Main content container with flexbox layout -->
      <div class="ai-analysis-container">
        <!-- Left side: AI Score Chart -->
        <div class="ai-score-section">
          <div class="ai-score-card" style="height: 520px;">
            <div class="ai-score-header">
              <h2>AI评分</h2>
            </div>
            
            <div class="ai-score-content">
              <!-- AI Score Chart -->
              <div class="score-chart-container">
                <div ref="scoreChartRef" class="score-chart"></div>
                <div v-if="loading" class="chart-loading">
                  <div class="loading-spinner"></div>
                  <div>加载中...</div>
                </div>
              </div>
              
              <!-- Score Summary -->
              <div class="score-summary">
                <div class="summary-item">
                  <div class="summary-label">平均分</div>
                  <div class="summary-value">{{ averageScore }}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">最高分</div>
                  <div class="summary-value">{{ maxScore }}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">分析次数</div>
                  <div class="summary-value">{{ analysisCount }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- AI Analysis Stats -->
          <div class="ai-stats-card" style="margin-top: 5px;">
            <h3>分析统计</h3>
            <div class="ai-stats-grid">
              <div class="ai-stat-item">
                <div class="ai-stat-value">{{ analysisCount }}</div>
                <div class="ai-stat-label">总分析次数</div>
              </div>
              <div class="ai-stat-item">
                <div class="ai-stat-value">100%</div>
                <div class="ai-stat-label">成功率</div>
              </div>
              <div class="ai-stat-item">
                <div class="ai-stat-value">1.2s</div>
                <div class="ai-stat-label">平均响应时间</div>
              </div>
              <div class="ai-stat-item">
                <div class="ai-stat-value">0</div>
                <div class="ai-stat-label">威胁检测数</div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Right side: AI Analysis Records -->
        <div class="ai-records-section">
          <div class="ai-records-header">
            <h2>AI分析记录</h2>
            <div class="ai-records-actions">
              <a-select v-model="filterStatus" placeholder="筛选状态" style="width: 120px">
                <a-option value="">全部</a-option>
                <a-option value="success">成功</a-option>
                <a-option value="failed">失败</a-option>
              </a-select>
              <a-button type="outline" @click="refreshRecords">
                <template #icon><RefreshCw size="14" /></template>
                刷新
              </a-button>
            </div>
          </div>
          
          <div class="ai-records-content">
            <a-table 
              :columns="columns" 
              :data="filteredRecords" 
              :pagination="{ pageSize: 7 }"
              :loading="loading"
              :bordered="false"
              :stripe="true"
              row-key="id"
              class="custom-table"
              @row-click="handleRowClick"
            >
              <!-- Custom cell renderers -->
              <template #id="{ record }" >
                <span class="record-id">{{ record.id }}</span>
              </template>
                            
              <template #analysis_type="{ record }">
                <div class="analysis-type">
                  <span class="type-badge" :class="getAnalysisTypeClass(record.analysis_type)">
                    {{ record.analysis_type }}
                  </span>
                </div>
              </template>
    
              <template #created_at="{ record }">
                <div class="time-display">
                  {{ record.created_at }}
                </div>
              </template>
              
              <template #score="{ record }">
                <div class="score-display">
                  <div class="score-value">{{ record.score }}</div>
                  <div class="score-bar-container">
                    <div 
                      class="score-bar" 
                      :style="{ 
                        width: `${Math.min(record.score, 100)}%`,
                        backgroundColor: getScoreColor(record.score)
                      }"
                    ></div>
                  </div>
                </div>
              </template>
              
              <!-- Empty state -->
              <template #empty>
                <div class="empty-state">
                  <div class="empty-icon">
                    <HeadSnowflake size="48" />
                  </div>
                  <div class="empty-text">暂无分析记录</div>
                </div>
              </template>
            </a-table>
          </div>
        </div>
      </div>
      
      <!-- Analysis Detail Modal -->
      <a-modal
        v-model:visible="detailModalVisible"
        :title="`分析详情 #${selectedRecord?.id || ''}`"
        :footer="false"
        :mask-closable="true"
        class="detail-modal"
      >
        <div v-if="selectedRecord" class="analysis-detail">
          <div class="detail-item">
            <div class="detail-label">分析类型</div>
            <div class="detail-value">
              <span class="type-badge" :class="getAnalysisTypeClass(selectedRecord.analysis_type)">
                {{ selectedRecord.analysis_type }}
              </span>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">用户ID</div>
            <div class="detail-value">{{ selectedRecord.user_id }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">分析结果</div>
            <div class="ai-message-content">
                <a-scrollbar :style="scrollbarStyle" class="messages-container">
                    <div class="ai-message" v-html="selectedRecord.result"></div>
                </a-scrollbar>  
              </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">分析时间</div>
            <div class="detail-value">{{ selectedRecord.created_at }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">分数</div>
            <div class="detail-value score-detail">
              <span class="score-number" :style="{ color: getScoreColor(selectedRecord.score) }">
                {{ selectedRecord.score }}
              </span>
              <div class="score-bar-container detail-bar">
                <div 
                  class="score-bar" 
                  :style="{ 
                    width: `${Math.min(selectedRecord.score, 100)}%`,
                    backgroundColor: getScoreColor(selectedRecord.score)
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </a-modal>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { useAiAResStore } from '@/stores/aiAres';
  import { useUserStore } from '@/stores/user';
  import { RefreshCw, HeadSnowflake } from 'lucide-vue-next';
  import * as echarts from 'echarts/core';
  import { BarChart } from 'echarts/charts';
  import { 
    TitleComponent, 
    TooltipComponent, 
    GridComponent, 
    LegendComponent 
  } from 'echarts/components';
  import { CanvasRenderer } from 'echarts/renderers';
  import { nextTick } from 'vue';
  import { onUnmounted } from 'vue';
  
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    BarChart,
    CanvasRenderer
  ]);
  
  const aiStore = useAiAResStore();
  const userStore = useUserStore();
  
  // State
  const loading = ref(false);
  const filterStatus = ref('');
  const analysisRecords = ref([]);
  const scoreChartRef = ref(null);
  const scoreChartInstance = ref(null);
  const detailModalVisible = ref(false);
  const selectedRecord = ref(null);
  
  // Computed values
  const filteredRecords = computed(() => {
    if (!filterStatus.value) return analysisRecords.value;
    return analysisRecords.value.filter(record => record.status === filterStatus.value);
  });
  
  const averageScore = computed(() => {
    if (analysisRecords.value.length === 0) return '0';
    const total = analysisRecords.value.reduce((sum, record) => sum + (record.score || 0), 0);
    return (total / analysisRecords.value.length).toFixed(1);
  });
  
  const maxScore = computed(() => {
    if (analysisRecords.value.length === 0) return '0';
    return Math.max(...analysisRecords.value.map(record => record.score || 0)).toFixed(1);
  });
  
  const analysisCount = computed(() => {
    return analysisRecords.value.length;
  });
  
  // Table columns
  const columns = [
    { title: 'ID', dataIndex: 'id', width: 200,  },
    { title: '分析类型', dataIndex: 'analysis_type', width: 50, },
    { title: '分析结果', dataIndex: 'str', width: 50, },
    { title: '分析时间', dataIndex: 'created_at', width: 250,  },
    { title: '分数', dataIndex: 'score', width: 60,  },
  ];
  
  
  // Get color based on score
  const getScoreColor = (score) => {
    if (!score) return '#a0a0a0';
    if (score < 60) return '#ff4d4f';
    if (score < 80) return '#faad14';
    return '#52c41a';
  };
  
  // Get class for analysis type badge
  const getAnalysisTypeClass = (type) => {
    if (!type) return 'type-default';
    
    const typeMap = {
      '系统': 'type-system',
      '安全': 'type-security',
      '性能': 'type-performance',
      '网络': 'type-network',
      '应用': 'type-app'
    };
    
    return typeMap[type] || 'type-default';
  };
  
  // Handle row click to show details
  const handleRowClick = (record) => {
    selectedRecord.value = record;
    detailModalVisible.value = true;
  };
  
  // Chart initialization
  const initScoreChart = () => {
    if (scoreChartInstance.value) {
      scoreChartInstance.value.dispose();
    }
    
    scoreChartInstance.value = echarts.init(scoreChartRef.value);
    updateScoreChart(analysisRecords.value);
  };
  
  const updateScoreChart = (records) => {
    // Generate mock data based on time range
    
    let categories = [];
    let data = [];
    if (Array.isArray(records)) {

        records.forEach(record => {
            categories.push(record.created_at)
            data.push(record.score)
        })
    }

    const option = {
    tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        },
        formatter: function (params) {
            if (params && params.length > 0) {
            return `${params[0].name}: ${params[0].value}分`;
            }
            return '';
        }
    },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        axisLabel: {
          color: '#a0a0a0'
        }
      },
      yAxis: {
        type: 'value',
        name: '分数',
        nameTextStyle: {
          color: '#a0a0a0'
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        axisLabel: {
          color: '#a0a0a0'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      series: [
        {
          name: 'AI评分',
          type: 'bar',
          data: data,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#7B66FF' },
              { offset: 1, color: '#5B46DF' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#937BFF' },
                { offset: 1, color: '#6B56EF' }
              ])
            }
          }
        }
      ]
    };
    
    if (scoreChartInstance.value) {
      scoreChartInstance.value.setOption(option);
    } else {
      console.warn('scoreChartInstance is not initialized.');
    }
  };  
  
  const fetchAnalysisRecords = async () => {
    loading.value = true;
    try {
      const userId = userStore.user_id;
      const results = await aiStore.aiAnalysisResUserId(userId);
      
      if (Array.isArray(results)) {
        analysisRecords.value = results.map((record, index) => ({
          id: record.id || index + 1,
          user_id: record.user_id || userId,
          analysis_type: record.analysis_type || '系统',
          result: record.result || '无结果',
          str: '点击查看',
          score: record.score || Math.floor(Math.random() * 40) + 60, // Fallback random score
          created_at: record.analysis_time || new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        }));
      } else {
        // If no records or error, set empty array
        analysisRecords.value = [];
        console.warn('No analysis records found or error occurred');
      }
    } catch (error) {
      console.error('Error fetching analysis records:', error);
      analysisRecords.value = [];
    } finally {
      loading.value = false;
    }
  };
  
  // Refresh records
  const refreshRecords = () => {
    fetchAnalysisRecords();
  };
  
  watch(analysisRecords, () => {
    updateScoreChart(analysisRecords.value);
  });
  
  // Initialize component
  onMounted(() => {
    // Initialize chart
    nextTick(() => {
      initScoreChart();
      
      // Handle window resize
      window.addEventListener('resize', () => {
        scoreChartInstance.value?.resize();
      });
    });
    
    // Fetch analysis records
    fetchAnalysisRecords();
  });
  
  // Clean up on unmount
  onUnmounted(() => {
    window.removeEventListener('resize', () => {
      scoreChartInstance.value?.resize();
    });
    
    if (scoreChartInstance.value) {
      scoreChartInstance.value.dispose();
    }
  });
  </script>
  
  <style scoped>

.messages-container {
    width: 100%;
    flex: 1;
    margin-bottom: 20px;
    height: 400px;
  }


  /* Main page layout */
  .ai-analysis-view {
    color: #e0e0e0;
    padding: 20px;
    margin-right: 30px;
  }
  
  .ai-analysis-container {
    display: flex;
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  /* Responsive layout */
  @media (max-width: 1024px) {
    .ai-analysis-container {
      flex-direction: column;
    }
  }
  
  /* Left side: AI Score */
  .ai-score-section {
    flex: 1;
    min-width: 300px;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .ai-score-card, .ai-stats-card {
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .ai-score-header {
    margin-bottom: 20px;
  }
  
  .ai-score-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }
  
  .score-chart-container {
    position: relative;
    height: 300px;
    margin-bottom: 20px;
  }
  
  .score-chart {
    width: 100%;
    height: 100%;
  }
  
  .chart-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(42, 42, 42, 0.7);
    color: #a0a0a0;
    gap: 10px;
  }
  
  .loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: #7B66FF;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .score-summary {
    display: flex;
    justify-content: space-between;
  }
  
  .summary-item {
    text-align: center;
    flex: 1;
  }
  
  .summary-label {
    font-size: 0.875rem;
    color: #a0a0a0;
    margin-bottom: 4px;
  }
  
  .summary-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #7B66FF;
  }
  
  /* AI Stats card */
  .ai-stats-card h3 {
    margin-bottom: 16px;
    font-size: 1.25rem;
    font-weight: 500;
    color: #ffffff;
  }
  
  .ai-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .ai-stat-item {
    background-color: #333333;
    border-radius: 6px;
    padding: 16px;
    text-align: center;
  }
  
  .ai-stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #7B66FF;
    margin-bottom: 4px;
  }
  
  .ai-stat-label {
    font-size: 0.875rem;
    color: #a0a0a0;
  }
  
  /* Right side: AI Records */
  .ai-records-section {
    flex: 2;
    min-width: 0; /* Prevent flex item from overflowing */
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .ai-records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .ai-records-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }
  
  .ai-records-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .ai-records-content {
    /* Ensure the table has proper height */
    height: calc(100% - 60px);
  }
  
  /* Table styles */
  .record-id {
    font-family: monospace;
    color: #a0a0a0;
    width: 200px;
  }
  
  /* Analysis type styling */
  .analysis-type {
    display: flex;
    align-items: center;
  }
  
  .type-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .type-system {
    background-color: rgba(123, 102, 255, 0.2);
    color: #7B66FF;
  }
  
  .type-security {
    background-color: rgba(82, 196, 26, 0.2);
    color: #52c41a;
  }
  
  .type-performance {
    background-color: rgba(250, 173, 20, 0.2);
    color: #faad14;
  }
  
  .type-network {
    background-color: rgba(24, 144, 255, 0.2);
    color: #1890ff;
  }
  
  .type-app {
    background-color: rgba(245, 63, 63, 0.2);
    color: #ff4d4f;
  }
  
  .type-default {
    background-color: rgba(160, 160, 160, 0.2);
    color: #a0a0a0;
  }
  
  /* Result styling */
  .result-container {
    padding: 8px;
    background-color: rgba(40, 40, 40, 0.6);
    border-radius: 6px;
    max-height: 100px;
    overflow-y: auto;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .result-container:hover {
    background-color: rgba(50, 50, 50, 0.6);
  }
  
  .result-content {
    color: #e0e0e0;
    font-size: 14px;
    line-height: 1.5;
    white-space: normal;
    word-break: break-word;
  }
  
  .no-result {
    color: #a0a0a0;
    font-style: italic;
  }
  
  /* Time display */
  .time-display {
    font-size: 13px;
    color: #a0a0a0;
  }
  
  /* Score display */
  .score-display {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .score-value {
    font-weight: 600;
    text-align: center;
  }
  
  .score-bar-container {
    height: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }
  
  .score-bar {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
  }
  
  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #a0a0a0;
  }
  
  .empty-icon {
    margin-bottom: 16px;
    color: #7B66FF;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 16px;
  }
  
  /* Modal styles */
  .detail-modal {
    width: 700px;
  }
  
  .analysis-detail {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .detail-label {
    font-size: 0.875rem;
    color: #a0a0a0;
    font-weight: 500;
  }
  
  .detail-value {
    font-size: 1rem;
    color: #ffffff;
    word-break: break-word;
  }
  
  .result-full {
    background-color: #333333;
    border-radius: 6px;
    padding: 16px;
    max-height: 300px;
    overflow-y: auto;
    line-height: 1.6;
  }
  
  .score-detail {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .score-number {
    font-size: 24px;
    font-weight: 600;
  }
  
  .detail-bar {
    flex: 1;
    height: 8px;
  }
  
  /* Override Arco Design styles for dark theme */
  :deep(.arco-table) {
    color: #e0e0e0;
  }
  
  :deep(.arco-table-tr) {
    cursor: pointer;
  }
  
  :deep(.arco-table-th) {
    background-color: #333333 !important;
    color: #ffffff !important;
    border-color: #444444 !important;
  }
  
  :deep(.arco-table-td) {
    background-color: #2a2a2a !important;
    color: #e0e0e0 !important;
    border-color: #444444 !important;
    padding: 12px 16px !important;
  }
  
  :deep(.arco-table-tr:hover .arco-table-td) {
    background-color: #383838 !important;
  }
  
  :deep(.arco-pagination-item) {
    background-color: #333333;
    color: #e0e0e0;
    border-color: #444444;
  }
  
  :deep(.arco-pagination-item.arco-pagination-item-active) {
    background-color: #7B66FF;
    color: #ffffff;
    border-color: #7B66FF;
  }
  
  :deep(.arco-select-view) {
    background-color: #333333;
    border-color: #444444;
    color: #e0e0e0;
  }
  
  :deep(.arco-select-view:hover) {
    border-color: #7B66FF;
  }
  
  :deep(.arco-modal) {
    background-color: #2a2a2a;
    border-radius: 8px;
  }
  
  :deep(.arco-modal-header) {
    border-bottom-color: #444444;
  }
  
  :deep(.arco-modal-title) {
    color: #ffffff;
  }
  
  :deep(.arco-modal-close-btn) {
    color: #a0a0a0;
  }
  
  :deep(.arco-modal-close-btn:hover) {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.1);
  }
  </style>