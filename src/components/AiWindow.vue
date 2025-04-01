<template>
    <!-- Floating button (when collapsed) -->
    <div 
      v-if="!showPopup" 
      class="ai-floating-button" 
      @click="togglePopup"
      :class="{ 'pulse-animation': hasNewMessages }"
    >
      <div class="button-content">
        <HeadSnowflake size="24" />
        <span class="button-text">AI 助手</span>
      </div>
    </div>
  
    <!-- AI Chat Window (when expanded) -->
    <div 
      v-if="showPopup" 
      class="ai-window"
      :class="[!isExpanded ? 'window-normal' : 'window-expanded']"
    >
      <!-- Window header -->
      <div class="window-header" :class="{ 'header-expanded': isExpanded }">
        <div class="header-left">
          <div class="header-icon">
            <HeadSnowflake size="20" />
          </div>
          <div class="header-title">AI 安全助手</div>
        </div>
        
        <div class="header-center" v-if="isExpanded">
          <AiModel />
        </div>
        
        <div class="header-actions">
          <button class="action-button" @click="expandContent" :title="isExpanded ? '收起' : '展开'">
            <Maximize2 v-if="!isExpanded" size="18" />
            <Minimize2 v-else size="18" />
          </button>
          <button class="action-button" @click="togglePopup" title="关闭">
            <X size="18" />
          </button>
        </div>
      </div>
      
      <!-- Window content -->
      <div class="window-content">
        <AiContent 
          :is-expanded="isExpanded" 
          :ai-content-class="contentClass"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { HeadSnowflake, Maximize2, Minimize2, X } from 'lucide-vue-next';
  import AiContent from './AiContent.vue';
  import AiModel from './AiModel.vue';
  import { useAiPostsStore } from '@/stores/aiPosts';
  
  const showPopup = ref(false);
  const isExpanded = ref(false);
  const hasNewMessages = ref(false);
  const aiPosts = useAiPostsStore();
  
  // Toggle expanded state
  const expandContent = () => {
    isExpanded.value = !isExpanded.value;
  };
  
  // Toggle popup visibility
  const togglePopup = () => {
    showPopup.value = !showPopup.value;
    if (!showPopup.value) {
      isExpanded.value = false;
    }
    hasNewMessages.value = false;
  };
  
  // Watch for new messages to trigger notification
  watch(() => aiPosts.posts.length, (newLength, oldLength) => {
    if (newLength > oldLength && !showPopup.value) {
      hasNewMessages.value = true;
    }
  });
  
  // Computed class for content
  const contentClass = computed(() => ({
    width: '100%',
    height: '100%',
  }));
  </script>
  
  <style scoped>
  /* Floating button */
  .ai-floating-button {
    position: fixed;
    right: 20px;
    bottom: 20px;
    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
    border: 1px solid #3a3a3a;
    border-radius: 50px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    z-index: 1000;
  }
  
  .ai-floating-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #3a3a3a, #2a2a2a);
  }
  
  .button-content {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #f6d15b;
  }
  
  .button-text {
    font-weight: 500;
    font-size: 15px;
    color: #ffffff;
  }
  
  /* Pulse animation for new messages */
  .pulse-animation {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(246, 209, 91, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(246, 209, 91, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(246, 209, 91, 0);
    }
  }
  
  /* AI Window */
  .ai-window {
    position: fixed;
    right: 20px;
    bottom: 20px;
    background-color: #1a1a1a;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    border: 1px solid #3a3a3a;
    overflow: hidden;
    z-index: 1000;
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .window-normal {
    width: 380px;
    height: 550px;
  }
  
  .window-expanded {
    width: 80vw;
    height: 882px;
    max-width: 1200px;
    max-height: 800px;
  }
  
  /* Window header */
  .window-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background-color: #2a2a2a;
    border-bottom: 1px solid #3a3a3a;
  }
  
  .header-expanded {
    padding: 20px;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .header-icon {
    color: #f6d15b;
  }
  
  .header-title {
    font-weight: 600;
    font-size: 16px;
    color: #ffffff;
  }
  
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
  
  .action-button {
    background-color: transparent;
    color: #a0a0a0;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .action-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
  
  /* Window content */
  .window-content {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  </style>
  
  