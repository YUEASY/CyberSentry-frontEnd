<template>
  <div class="app-detail-view">
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item>首页</a-breadcrumb-item>
      <a-breadcrumb-item>应用</a-breadcrumb-item>
      <a-breadcrumb-item>{{ appInfo.app_name || '应用详情' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="loading-container" v-if="loading">
      <a-spin tip="加载中..."></a-spin>
    </div>

    <div v-else>
      <AppDetailCard :appId="appId" :appName="appInfo.app_name" :executablePath="appInfo.executable_path"
        :appIconPath="appInfo.icon_path" :updateTime="appInfo.update_time" :isHighRisk="appInfo.risk_level > 3" />

      <div class="detail-sections">
        <a-card title="应用线程" class="detail-card">
          <template #extra>
            <a-button type="text">查看全部</a-button>
          </template>
          <a-table :columns="threadColumns" :data="threadData" :pagination="false">
            <template #risk_level_tag="{ record }">
              <a-tag :color="getRiskLevelColor(record.risk_level)">{{ record.risk_level }}</a-tag>
            </template>
          </a-table>
        </a-card>

        <a-card title="文件修改记录" class="detail-card">
          <template #extra>
            <a-button type="text">查看全部</a-button>
          </template>
          <a-table :columns="fileColumns" :data="fileData" :pagination="false" />
        </a-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import AppDetailCard from '@/components/AppDetailCard.vue';
import { useAppInfoStore } from '@/stores/app';
import { useMTLogStore } from '@/stores/mtlog';
import { useFileMLogStore } from '@/stores/filemlog';

export default {
  name: 'AppDetailView',
  components: {
    AppDetailCard
  },
  setup() {
    const route = useRoute();
    const appId = ref(parseInt(route.params.id) || -1);
    const loading = ref(true);

    const appInfoStore = useAppInfoStore();
    const mtLogStore = useMTLogStore();
    const fileMLogStore = useFileMLogStore();

    const appInfo = reactive({
      app_name: '',
      executable_path: '',
      icon_path: '',
      update_time: '',
      risk_level: 0
    });

    const threadColumns = [
      {
        title: '线程名称',
        dataIndex: 'thread_name',
      },
      {
        title: '线程哈希',
        dataIndex: 'thread_hash',
      },
      {
        title: '风险等级',
        dataIndex: 'risk_level',
        slots: {
          cell: 'risk_level_tag'
        }
      },
      {
        title: '检测时间',
        dataIndex: 'detection_time',
      }
    ];

    const fileColumns = [
      {
        title: '文件路径',
        dataIndex: 'file_path',
      },
      {
        title: '操作类型',
        dataIndex: 'operation_type',
      },
      {
        title: '文件哈希',
        dataIndex: 'file_hash',
      },
      {
        title: '告警时间',
        dataIndex: 'alert_time',
      }
    ];

    const threadData = ref([]);
    const fileData = ref([]);

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

    const getRiskLevelColor = (level) => {
      if (level > 3) return 'red';
      if (level > 1) return 'orange';
      return 'green';
    };

    onMounted(async () => {
      loading.value = true;
      try {
        await Promise.all([
          fetchAppInfo(),
          fetchThreadData(),
          fetchFileData()
        ]);
      } finally {
        loading.value = false;
      }
    });

    return {
      appId,
      appInfo,
      loading,
      threadColumns,
      fileColumns,
      threadData,
      fileData,
      getRiskLevelColor
    };
  }
}
</script>

<style scoped>
.app-detail-view {
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.detail-sections {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.detail-card {
  width: 100%;
}

@media (max-width: 992px) {
  .detail-sections {
    grid-template-columns: 1fr;
  }
}
</style>
