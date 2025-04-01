<template>
    <div class="model-selector">
      <div class="model-label">AI 模型</div>
      <div class="model-dropdown">
        <a-select 
          default-value="deepseek" 
          :style="selectStyle"
          size="large"
          placeholder="选择AI模型"
        >
          <template #prefix>
            <div class="model-icon">
              <Brain size="16" />
            </div>
          </template>
          <a-option value="deepseek">
            <div class="option-content">
              <div class="option-text">DeepSeek</div>
            </div>
          </a-option>
          <a-option value="sparkdesk">
            <div class="option-content">
              <div class="option-text">星火大模型</div>
            </div>
          </a-option>
        </a-select>
      </div>
    </div>
  </template>
  
  <script setup>
  import {  computed } from 'vue';
  import { Brain } from 'lucide-vue-next';
  
  const selectStyle = computed(() => ({
    width: '180px',
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #3a3a3a'
  }));
  </script>
  
  <style scoped>
  .model-selector {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .model-label {
    font-size: 14px;
    font-weight: 500;
    color: #a0a0a0;
  }
  
  .model-dropdown {
    position: relative;
  }
  
  .model-icon {
    display: flex;
    align-items: center;
    color: #f6d15b;
    margin-right: 4px;
  }
  
  /* Custom styling for the dropdown options */
  :deep(.option-content) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  :deep(.option-icon) {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
  }
  
  :deep(.deepseek-icon) {
    background-color: #0066ff;
    color: white;
  }
  
  :deep(.sparkdesk-icon) {
    background-color: #ff3300;
    color: white;
  }
  
  :deep(.option-text) {
    font-size: 14px;
  }
  
  /* Override Arco Design styles for dark theme */
  :deep(.arco-select) {
    background-color: #2a2a2a;
  }
  
  :deep(.arco-select-view) {
    background-color: #2a2a2a;
    border-color: #3a3a3a;
  }
  
  :deep(.arco-select-view:hover) {
    border-color: #f6d15b;
  }
  
  :deep(.arco-select-view-value) {
    color: #ffffff;
  }
  
  :deep(.arco-select-popup) {
    background-color: #2a2a2a;
    border: 1px solid #3a3a3a;
  }
  
  :deep(.arco-select-option) {
    color: #e0e0e0;
  }
  
  :deep(.arco-select-option:hover) {
    background-color: #3a3a3a;
  }
  
  :deep(.arco-select-option-selected) {
    color: #f6d15b;
    font-weight: 500;
    background-color: rgba(246, 209, 91, 0.1);
  }
  </style>
  
  