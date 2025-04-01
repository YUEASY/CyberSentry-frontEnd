<template>
    <div >
      <!-- Main content container with flexbox layout -->
      <div class="usr-content-container">
        <!-- Left side: User profile -->
        <div class="usr-profile-section">
          <div class="usr-profile-card">
            <div class="usr-profile-header">
              <h2>个人资料</h2>
              <div class="usr-avatar-container">
                <a-avatar :size="64" shape="square" class="usr-avatar">
                  {{ user.username ? user.username.charAt(0).toUpperCase() : 'U' }}
                </a-avatar>
                <div class="usr-role-badge">{{ user.role || '用户' }}</div>
              </div>
            </div>
  
            <!-- Profile information display mode -->
            <div v-if="!modiShow" class="usr-profile-info">
              <div class="usr-info-item">
                <div class="usr-info-label">用户名</div>
                <div class="usr-info-value">{{ user.username }}</div>
              </div>
              <div class="usr-info-item">
                <div class="usr-info-label">邮箱</div>
                <div class="usr-info-value">{{ user.email }}</div>
              </div>
              <div class="usr-info-item">
                <div class="usr-info-label">手机号</div>
                <div class="usr-info-value">{{ user.phone || '未设置' }}</div>
              </div>
              <div class="usr-info-item">
                <div class="usr-info-label">上次登录</div>
                <div class="usr-info-value">{{ formatDate(user.last_login_time) }}</div>
              </div>
              <div class="usr-info-item">
                <div class="usr-info-label">登录IP</div>
                <div class="usr-info-value">{{ user.last_login_ip || '未知' }}</div>
              </div>
  
              <a-button type="primary" class="edit-button" @click="ModiShow">
                <template #icon><EditOutlined /></template>
                编辑资料
              </a-button>
            </div>
  
            <!-- Profile edit mode -->
            <div v-else class="usr-profile-edit">
              <div class="usr-edit-item">
                <div class="usr-edit-label">用户名</div>
                <a-input v-model="username" placeholder="用户名" disabled/>
              </div>
              <div class="usr-edit-item">
                <div class="usr-edit-label">邮箱</div>
                <a-input v-model="email" placeholder="邮箱" disabled />
              </div>
              <div class="usr-edit-item">
                <div class="usr-edit-label">手机号</div>
                <a-input v-model="phone" placeholder="手机号" />
              </div>
  
              <div class="usr-edit-actions">
                <a-button @click="ModiShow" class="cancel-button">取消</a-button>
                <a-button type="primary" @click="saveProfile" class="save-button">保存</a-button>
              </div>
            </div>
          </div>
  
          <!-- Additional user stats card -->
          <div class="usr-stats-card">
            <h3>账户统计</h3>
            <div class="usr-stats-grid">
              <div class="usr-stat-item">
                <div class="usr-stat-value">305</div>
                <div class="usr-stat-label">应用数量</div>
              </div>
              <div class="usr-stat-item">
                <div class="usr-stat-value">{{ operationCount }}</div>
                <div class="usr-stat-label">操作次数</div>
              </div>
              <div class="usr-stat-item">
                <div class="usr-stat-value">1</div>
                <div class="usr-stat-label">登录天数</div>
              </div>
              <div class="usr-stat-item">
                <div class="usr-stat-value">0</div>
                <div class="usr-stat-label">警报数量</div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Right side: Operation records -->
        <div class="usr-records-section">
          <div class="usr-records-header">
            <h2>操作记录</h2>
            <div class="usr-records-actions">
              <a-select v-model="filterType" placeholder="筛选类型" style="width: 120px">
                <a-option value="">全部</a-option>
                <a-option value="encrypt">加密</a-option>
                <a-option value="decrypt">解密</a-option>
                <a-option value="delete">删除</a-option>
              </a-select>
              <a-button type="outline" @click="refreshRecords">
                <template #icon><ReloadOutlined /></template>
                刷新
              </a-button>
            </div>
          </div>
          
          <div class="usr-records-content">
            <ListComponent 
              :columns="columns" 
              :data="filteredData" 
              :pagination="10" 
              :height="700"
            />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useUserStore } from '@/stores/user';
  import { useUserLogStore } from '@/stores/userlog';
  import ListComponent from '@/components/ListComponent.vue';
  import { EditOutlined, ReloadOutlined } from '@ant-design/icons-vue';
  import { Message } from '@arco-design/web-vue';
  
  // User profile state
  const user = useUserStore();
  const userLogStore = useUserLogStore();
  const modiShow = ref(false);
  const username = ref(user.username);
  const email = ref(user.email);
  const phone = ref(user.phone);
  
  // User operation records state
  const operationRecords = ref([]);
  const filterType = ref('');
  const loading = ref(false);
  
  const operationCount = computed(() => {
    if (!filterType.value) return 0;
    return operationRecords.value.length
  })

  // Table columns configuration
  const columns = [
    { title: '操作时间', dataIndex: 'operation_time' },
    { title: '操作类型', dataIndex: 'operation_type' },
    { title: '操作详情', dataIndex: 'operation_detail' },
    { title: '客户端信息', dataIndex: 'client_info' },
    { title: '状态', dataIndex: 'result_status', 
      render: ({ record }) => (
        record.result_status ? 
          '<span style="color: #52c41a;">成功</span>' : 
          '<span style="color: #f5222d;">失败</span>'
      )
    }
  ];
  
  // Filtered data based on selected filter
  const filteredData = computed(() => {
    if (!filterType.value) return operationRecords.value;
    return operationRecords.value.filter(record => 
      record.operation_type.toLowerCase().includes(filterType.value.toLowerCase())
    );
  });
  
  // Toggle edit mode
  const ModiShow = () => {
    if (modiShow.value) {
      // Reset form values when canceling edit
      username.value = user.username;
      email.value = user.email;
      phone.value = user.phone;
    }
    modiShow.value = !modiShow.value;
  };
  
  // Save profile changes
  const saveProfile = async () => {
    try {
      const success = await user.update({
        user_id: user.user_id,
        email: user.email,
        phone: phone.value,
        role: user.role,
        username: user.username
      });
      
      if (success) {
        Message.success('个人资料更新成功');
        ModiShow();
        // Update local user data
        user.phone = phone.value;
        user.username = username.value;
      } else {
        Message.error('更新失败，请稍后重试');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Message.error('更新失败: ' + (error.message || '未知错误'));
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Fetch user operation records
  const fetchUserRecords = async () => {
    loading.value = true;
    try {
      // Assuming the API returns records for the current user
      const records = await userLogStore.showUserInfos();
      if (Array.isArray(records)) {
        operationRecords.value = records.map(record => ({
          ...record,
          operation_time: formatDate(record.operation_time)
        }));
      } else {
        // If no records or error, set empty array
        operationRecords.value = [];
        console.warn('No operation records found or error occurred');
      }
    } catch (error) {
      console.error('Error fetching user records:', error);
      Message.error('获取操作记录失败');
      operationRecords.value = [];
    } finally {
      loading.value = false;
    }
  };
  
  // Refresh records
  const refreshRecords = () => {
    fetchUserRecords();
  };
  
  // Initialize component
  onMounted(() => {
    // Load user info if not already loaded
    if (user.id === -1) {
      user.userinfo();
    }
    
    // Fetch user operation records
    fetchUserRecords();
  });
  </script>
  
  <style scoped>
  /* Main page layout */
  .usr-page-wrapper {
    /* padding: 20px; */
    min-height: 100vh;
    background-color: #1e1e1e;
    color: #e0e0e0;
  }
  
  .usr-content-container {
    display: flex;
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  /* Responsive layout */
  @media (max-width: 1024px) {
    .usr-content-container {
      flex-direction: column;
    }
  }
  
  /* Left side: User profile */
  .usr-profile-section {
    flex: 1;
    min-width: 300px;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .usr-profile-card, .usr-stats-card {
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .usr-profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
    text-align: center;
  }
  
  .usr-profile-header h2 {
    margin-bottom: 16px;
    font-size: 1.5rem;
    font-weight: 600;
    color: #ffffff;
  }
  
  .usr-avatar-container {
    position: relative;
    margin-bottom: 8px;
  }
  
  .usr-avatar {
    background-color: #1890ff;
    font-weight: bold;
    font-size: 1.5rem;
  }
  
  .usr-role-badge {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background-color: #722ed1;
    color: white;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 10px;
  }
  
  /* Profile information display */
  .usr-profile-info, .usr-profile-edit {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .usr-info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .usr-info-label {
    font-size: 0.875rem;
    color: #a0a0a0;
  }
  
  .usr-info-value {
    font-size: 1rem;
    color: #ffffff;
    word-break: break-word;
  }
  
  /* Profile edit mode */
  .usr-edit-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .usr-edit-label {
    font-size: 0.875rem;
    color: #a0a0a0;
  }
  
  .usr-edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
  }
  
  .edit-button {
    margin-top: 16px;
    align-self: flex-start;
  }
  
  /* User stats card */
  .usr-stats-card h3 {
    margin-bottom: 16px;
    font-size: 1.25rem;
    font-weight: 500;
    color: #ffffff;
  }
  
  .usr-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .usr-stat-item {
    background-color: #333333;
    border-radius: 6px;
    padding: 16px;
    text-align: center;
  }
  
  .usr-stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1890ff;
    margin-bottom: 4px;
  }
  
  .usr-stat-label {
    font-size: 0.875rem;
    color: #a0a0a0;
  }
  
  /* Right side: Operation records */
  .usr-records-section {
    flex: 2;
    min-width: 0; /* Prevent flex item from overflowing */
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .usr-records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .usr-records-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }
  
  .usr-records-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .usr-records-content {
    /* Ensure the list component has proper height */
    height: calc(100% - 60px);
  }
  
  /* Override Arco Design styles for dark theme */
  :deep(.arco-input) {
    background-color: #333333;
    border-color: #444444;
    color: #e0e0e0;
  }
  
  :deep(.arco-input:hover),
  :deep(.arco-input:focus) {
    border-color: #1890ff;
  }
  
  :deep(.arco-btn) {
    border-radius: 4px;
  }
  
  :deep(.arco-select-view) {
    background-color: #333333;
    border-color: #444444;
    color: #e0e0e0;
  }
  
  :deep(.arco-select-view:hover) {
    border-color: #1890ff;
  }
  </style>
  
  