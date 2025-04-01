<template>
    <div class="ai-view">
      <div class="ai-view-container">
        <!-- Header section -->
        <div class="ai-view-header">
          <div class="header-left">
            <div class="header-icon">
              <HeadSnowflake size="28" />
            </div>
            <div class="header-title">
              <h1>AI 安全助手</h1>
              <p class="header-subtitle">智能分析系统状态，提供安全建议</p>
            </div>
          </div>
          
          <div class="header-right">
            <AiModel />
          </div>
        </div>
        
        <!-- Main content area -->
        <div class="ai-view-content">
          <AiContent :is-expanded="true" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import AiContent from '@/components/AiContent.vue';
  import AiModel from '@/components/AiModel.vue';
  import { HeadSnowflake } from 'lucide-vue-next';
  </script>
  
  <style scoped>
  .ai-view {
    /* min-height: 100vh; */
    /* width: 100%; */
    background-color: rgba(30, 30, 30, 1);
    /* background-color: #1a1a1a; */
    color: #ffffff;
    display: flex;
    justify-content: center;
    padding: 20px;
    margin-top: 20px;
    margin-right: 50px;
  }
  
  .ai-view-container {
    width: 100%;
    /* max-width: 1200px; */
    height: 782px;
    display: flex;
    flex-direction: column;
    /* height: calc(100vh - 40px); */
  }
  
  .ai-view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #3a3a3a;
    margin-bottom: 20px;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .header-icon {
    color: #f6d15b;
    background-color: rgba(246, 209, 91, 0.1);
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .header-title h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #ffffff;
  }
  
  .header-subtitle {
    font-size: 14px;
    color: #a0a0a0;
    margin: 0;
  }
  
  .header-right {
    display: flex;
    align-items: center;
  }
  
  .ai-view-content {
    flex: 1;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  </style>
  
  