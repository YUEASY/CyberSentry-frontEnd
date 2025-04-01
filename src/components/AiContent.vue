<template>
    <div :class="['ai-content-container', props.aiContentClass]">
      <!-- Welcome header when no messages -->
      <div v-if="aiPosts.posts.length == 0" class="welcome-header" :class="[!props.isExpanded ? 'welcome-header-normal' : 'welcome-header-large']">
        <div class="welcome-title">
          <span class="cyber-text">Cyber</span>
          <span class="assistant-text">Assistant</span>
        </div>
        <div class="welcome-subtitle">智能安全助手，为您提供系统监控与安全分析</div>
      </div>
  
      <!-- Chat messages area -->
      <a-scrollbar :style="scrollbarStyle" class="messages-container">
        <div :class="[!props.isExpanded ? 'content-area' : 'content-area-large']">
          <div v-for="p in aiPosts.posts" :key="p.idx" :class="['message-container', p.sender != 'ai' ? 'message-user' : 'message-ai']">
            <div v-if="p.sender != 'ai'" class="user-bubble">
              <div class="user-message">{{ p.content }}</div>
            </div>
            <div v-else class="ai-bubble">
              <div class="ai-avatar">
                <HeadSnowflake size="20" />
              </div>
              <div class="ai-message-content">
                <div class="ai-message" v-html="p.content"></div>
              </div>
            </div>
          </div>
        </div>
      </a-scrollbar>
  
      <!-- Loading indicator -->
    <div v-if="aiApi.loading" class="loading-indicator" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="loading-text">AI正在思考中...</div>
    </div>
      <!-- Quick question buttons -->
      <div :class="['question-buttons', !props.isExpanded ? 'buttons-normal' : 'buttons-large']">
        <button 
          v-for="(question, index) in quickQuestions" 
          :key="index" 
          class="question-button"
          @click="askQuestion(question.text)"
          :disabled="aiApi.loading"
        >
          <component :is="question.icon" size="16" />
          <span>{{ question.text }}</span>
        </button>
      </div>
  
      <!-- Custom input area (hidden by default, shows when clicking "自定义问题") -->
      <!-- <div :class="['input-container', customInputVisible ? 'input-visible' : 'input-hidden', 
                   !props.isExpanded ? 'input-normal' : 'input-large']">
        <input 
          type="text" 
          placeholder="输入您的问题..." 
          v-model="aiPosts.ask" 
          :disabled="aiApi.loading"
          @keyup.enter="sendAsk"
        />
        <button class="send-button" @click="sendAsk" :disabled="aiApi.loading">
          <Send size="18" />
        </button>
        <button class="cancel-button" @click="customInputVisible = false">
          <X size="18" />
        </button>
      </div> -->
  
      <!-- Custom question button -->
      <!-- <div :class="['custom-question', !props.isExpanded ? 'custom-normal' : 'custom-large']">
        <button 
          class="custom-button"
          @click="customInputVisible = true"
          :disabled="aiApi.loading"
        >
          <MessageSquarePlus size="16" />
          <span>自定义问题</span>
        </button>
      </div> -->
    </div> 
  </template>
  
  <script setup>
  import { computed, defineProps, ref, watch } from 'vue';
  import { useAiAResStore } from '@/stores/aiAres';
  import { useUserStore } from '@/stores/user';
  import { useAiPostsStore } from '@/stores/aiPosts';
  import { HeadSnowflake, Activity, Shield, Cpu, Database, AlertTriangle } from 'lucide-vue-next';
  
  const props = defineProps({
    aiContentClass: String,
    isExpanded: Boolean
  });
  
  const aiApi = useAiAResStore();
  const user = useUserStore();
  const aiPosts = useAiPostsStore();
  const customInputVisible = ref(false);
  
  // Predefined quick questions about system status
  const quickQuestions = [
    { text: "系统负载状况如何？", icon: Activity },
    { text: "有哪些安全威胁？", icon: Shield },
    { text: "CPU使用率分析", icon: Cpu },
    { text: "内存使用情况", icon: Database },
    { text: "检测到异常行为吗？", icon: AlertTriangle }
  ];
  
  // Ask a predefined question
  const askQuestion = (question) => {
    aiPosts.ask = question;
    sendAsk();
  };
  
  // Send the current question
  const sendAsk = async () => {
    if (!aiPosts.ask.trim()) return;
    
    await aiApi.aiAnalysis({user_id: user.user_id, prompt: aiPosts.ask});
    aiPosts.ask = '';
    customInputVisible.value = false;
    scrollToBottom();
  };
  
  // Get posts from store
  aiPosts.posts = computed(() => aiApi.posts);
  
  // Compute scrollbar style based on expanded state
  const scrollbarStyle = computed(() => ({
    maxHeight: !props.isExpanded ? '280px' : '600px',
    overflowY: 'auto',
    marginLeft: !props.isExpanded ? '0px' : '50px',
    marginRight: !props.isExpanded ? '0px' : '50px'

  }));
  
  const scrollToBottom = () => {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  };
  
  watch(() => aiPosts.posts.length, () => {
    scrollToBottom();
  });
  </script>
  
  <style scoped>
  .ai-content-container {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  /* Welcome header styles */
  .welcome-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  .welcome-header-normal {
    margin-top: 40px;
    margin-bottom: 20px;
  }
  
  .welcome-header-large {
    margin-top: 100px;
    margin-bottom: 40px;
  }
  
  .welcome-title {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .cyber-text {
    background: linear-gradient(90deg, #f6d15b, #e67e22);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  
  .assistant-text {
    color: #ffffff;
  }
  
  .welcome-subtitle {
    font-size: 16px;
    color: #a0a0a0;
    max-width: 300px;
  }
  
  /* Messages container */
  .messages-container {
    width: 100%;
    flex: 1;
    margin-bottom: 20px;
    height: 500px;
  }
  
  .content-area {
    padding: 20px;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .content-area-large {
    padding: 20px;
    width: 884px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }
  
  /* Message bubbles */
  .message-container {
    display: flex;
    margin-bottom: 20px;
    width: 100%;
  }
  
  .message-user {
    justify-content: flex-end;
  }
  
  .message-ai {
    justify-content: flex-start;
  }
  
  .user-bubble {
    max-width: 80%;
  }
  
  .user-message {
    background: linear-gradient(135deg, #e67e22, #f6d15b);
    color: #000;
    padding: 12px 16px;
    border-radius: 18px 18px 0 18px;
    font-size: 15px;
    line-height: 1.4;
    box-shadow: 0 2px 10px rgba(246, 209, 91, 0.2);
  }
  
  .ai-bubble {
    display: flex;
    max-width: 80%;
    gap: 10px;
  }
  
  .ai-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f6d15b;
    flex-shrink: 0;
  }
  
  .ai-message-content {
    flex: 1;
  }
  
  .ai-message {
    background-color: #2a2a2a;
    color: #ffffff;
    padding: 12px 16px;
    border-radius: 18px 18px 18px 0;
    font-size: 15px;
    line-height: 1.4;
  }
  
  /* Loading indicator */
  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
    color: #a0a0a0;
  }
  
  .typing-indicator {
    display: flex;
    align-items: center;
  }
  
  .typing-indicator span {
    height: 8px;
    width: 8px;
    background-color: #f6d15b;
    border-radius: 50%;
    display: inline-block;
    margin: 0 2px;
    opacity: 0.4;
    animation: typing 1.4s infinite ease-in-out;
  }
  
  .typing-indicator span:nth-child(1) {
    animation-delay: 0s;
  }
  
  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typing {
    0% { transform: translateY(0); opacity: 0.4; }
    50% { transform: translateY(-5px); opacity: 1; }
    100% { transform: translateY(0); opacity: 0.4; }
  }
  
  .loading-text {
    font-size: 14px;
  }
  
  /* Question buttons */
  .question-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin-top: auto;
    margin-bottom: 15px;
    padding-top: 10px;
  }
  
  .buttons-normal {
    width: 90%;
  }
  
  .buttons-large {
    width: 70%;
  }
  
  .question-button {
    background-color: #2a2a2a;
    color: #ffffff;
    border: none;
    border-radius: 20px;
    padding: 10px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .question-button:hover {
    background-color: #3a3a3a;
    transform: translateY(-2px);
  }
  
  .question-button:active {
    transform: translateY(0);
  }
  
  .question-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Custom input */
  .input-container {
    position: relative;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    margin-bottom: 15px;
  }
  
  .input-normal {
    width: 90%;
  }
  
  .input-large {
    width: 70%;
  }
  
  .input-visible {
    opacity: 1;
    transform: translateY(0);
    max-height: 50px;
  }
  
  .input-hidden {
    opacity: 0;
    transform: translateY(20px);
    max-height: 0;
    margin: 0;
    pointer-events: none;
  }
  
  input {
    width: 100%;
    padding: 12px 80px 12px 16px;
    font-size: 15px;
    color: #ffffff;
    border: 1px solid #3a3a3a;
    border-radius: 24px;
    outline: none;
    background-color: #2a2a2a;
  }
  
  input:focus {
    border-color: #f6d15b;
    box-shadow: 0 0 0 2px rgba(246, 209, 91, 0.2);
  }
  
  .send-button {
    position: absolute;
    right: 44px;
    background-color: transparent;
    color: #f6d15b;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .send-button:hover {
    color: #e67e22;
    background-color: rgba(246, 209, 91, 0.1);
  }
  
  .cancel-button {
    position: absolute;
    right: 8px;
    background-color: transparent;
    color: #a0a0a0;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .cancel-button:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  /* Custom question button */
  .custom-question {
    margin-bottom: 20px;
  }
  
  .custom-normal {
    width: 90%;
  }
  
  .custom-large {
    width: 70%;
  }
  
  .custom-button {
    width: 100%;
    background-color: transparent;
    color: #a0a0a0;
    border: 1px dashed #3a3a3a;
    border-radius: 20px;
    padding: 10px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .custom-button:hover {
    color: #ffffff;
    border-color: #f6d15b;
  }
  
  .custom-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  </style>
  
  