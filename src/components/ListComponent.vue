<template>
    <div class="list-component">
      <a-table
        :columns="columns"
        :data="data"
        :pagination="{ pageSize: pagination }"
        :loading="loading"
        :bordered="false"
        :stripe="true"
        :scroll="{ y: height }"
        row-key="id"
        class="custom-table"
      >
        <!-- Custom cell renderers -->
        <template #operation_type="{ record }">
          <a-tag :color="getOperationTypeColor(record.operation_type)">
            {{ record.operation_type }}
          </a-tag>
        </template>
        
        <template #result_status="{ record }">
          <a-tag :color="record.result_status ? 'green' : 'red'">
            {{ record.result_status ? '成功' : '失败' }}
          </a-tag>
        </template>
        
        <!-- Empty state -->
        <template #empty>
          <div class="empty-state">
            <div class="empty-icon">
              <icon-file-search />
            </div>
            <div class="empty-text">暂无数据</div>
          </div>
        </template>
      </a-table>
    </div>
  </template>
  
  <script setup>
  import { defineProps, onMounted } from 'vue';
  import { IconFileSearch } from '@arco-design/web-vue/es/icon';
  
  const props = defineProps({
    columns: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    pagination: {
      type: Number,
      default: 10
    },
    height: {
      type: Number,
      default: 400
    },
    loading: {
      type: Boolean,
      default: false
    }
  });
  
  // Get color for operation type tag
  const getOperationTypeColor = (type) => {
    const typeMap = {
      'login': 'blue',
      'logout': 'gray',
      'edit': 'orange',
      'view': 'green',
      'delete': 'red',
      'create': 'purple'
    };
    
    return typeMap[type?.toLowerCase()] || 'default';
  };
  
  onMounted(() => {
    console.log('ListComponent mounted with data:', props.data);
  });
  </script>
  
  <style scoped>
  .list-component {
    width: 100%;
    height: 100%;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #909399;
  }
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: #e0e0e0;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 14px;
  }
  
  /* Custom table styling for dark theme */
  :deep(.custom-table) {
    background-color: #2a2a2a;
    color: #e0e0e0;
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
    background-color: #1890ff;
    color: #ffffff;
    border-color: #1890ff;
  }
  
  :deep(.arco-select-view) {
    background-color: #333333;
    border-color: #444444;
    color: #e0e0e0;
  }
  </style>
  
  