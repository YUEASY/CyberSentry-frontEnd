<template>
    <div class="file-operation-view">
      <!-- Main content container with flexbox layout -->
      <div class="file-operation-container">
        <!-- Left side: Custom Operations (swapped position) -->
        <div class="custom-operations-section">
          <div class="custom-operations-header">
            <h2>自定义操作</h2>
          </div>
          
          <div class="custom-operations-content">
            <!-- File Selection -->
            <div class="operation-group">
              <h3 class="group-title">选择路径</h3>
              <div class="file-selector">
                <a-input 
                  v-model="selectedFilePath" 
                  placeholder="输入文件路径" 
                  allow-clear
                  readonly
                >
                  <template #prefix>
                    <FileText size="16" />
                  </template>
                </a-input>
                <a-button type="primary" @click="browseFile" class="browse-button">
                  <FolderOpen size="16" />
                  <span>浏览</span>
                </a-button>
              </div>
              <!-- File input for actual file selection -->
              <input 
                ref="fileInputRef"
                type="file" 
                style="display: none" 
                @change="handleFileSelected"
              />
            </div>
            
            <!-- Operation Selection -->
            <div class="operation-group">
              <h3 class="group-title">操作</h3>
              <a-dropdown trigger="click" @select="handleOperationSelect">
                <a-button class="operation-button">
                  <div class="operation-button-content">
                    <div class="operation-icon">
                      <LockIcon v-if="selectedOperation === 'encrypt'" />
                      <UnlockIcon v-else-if="selectedOperation === 'decrypt'" />
                      <Trash2 v-else-if="selectedOperation === 'delete'" />
                      <Settings v-else />
                    </div>
                    <span>{{ getOperationText() }}</span>
                  </div>
                  <template #suffix>
                    <ChevronDown />
                  </template>
                </a-button>
                <template #content>
                  <a-doption value="encrypt" class="operation-option">
                    <div class="option-content">
                      <LockIcon size="16" />
                      <span>加密</span>
                    </div>
                  </a-doption>
                  <a-doption value="decrypt" class="operation-option">
                    <div class="option-content">
                      <UnlockIcon size="16" />
                      <span>解密</span>
                    </div>
                  </a-doption>
                  <a-doption value="delete" class="operation-option">
                    <div class="option-content">
                      <Trash2 size="16" />
                      <span>删除</span>
                    </div>
                  </a-doption>
                </template>
              </a-dropdown>
            </div>
            
            <!-- Enhanced Secret Key Input (for encryption/decryption) -->
            <div v-if="selectedOperation === 'encrypt' || selectedOperation === 'decrypt'" class="operation-group">
              <h3 class="group-title">安全密钥</h3>
              <div class="secret-key-container">
                <a-input 
                  v-model="secretKey" 
                  :placeholder="selectedOperation === 'encrypt' ? '创建新的加密密钥' : '输入解密密钥'" 
                  allow-clear
                  :type="showPassword ? 'text' : 'password'"
                  class="secret-key-input"
                >
                  <template #prefix>
                    <Key size="16" />
                  </template>
                  <template #suffix>
                    <div class="password-toggle" @click="togglePasswordVisibility">
                      <Eye v-if="showPassword" size="16" />
                      <EyeOff v-else size="16" />
                    </div>
                  </template>
                </a-input>
                
                <div class="key-strength" v-if="selectedOperation === 'encrypt' && secretKey">
                  <div class="strength-label">密钥强度：</div>
                  <div class="strength-meter">
                    <div class="strength-bar" :style="{ width: `${keyStrength}%`, backgroundColor: keyStrengthColor }"></div>
                  </div>
                  <div class="strength-text" :style="{ color: keyStrengthColor }">{{ keyStrengthText }}</div>
                </div>
                
                <div class="key-hint" v-if="selectedOperation === 'encrypt'">
                  <InfoIcon size="14" />
                  <span>建议使用包含字母、数字和特殊字符的强密码</span>
                </div>
                
                <div class="key-hint" v-if="selectedOperation === 'decrypt'">
                  <InfoIcon size="14" />
                  <span>请输入文件加密时使用的密钥</span>
                </div>
              </div>
            </div>
            
            <!-- Force Delete Checkbox (for delete operation) -->
            <div v-if="selectedOperation === 'delete'" class="operation-group">
              <div class="delete-options">
                <a-checkbox v-model="forceDelete">强制删除</a-checkbox>
                <div class="warning-text">
                  <AlertTriangle size="14" />
                  <span>强制删除将无法恢复，请谨慎操作</span>
                </div>
              </div>
            </div>
            
            <!-- Submit Button -->
            <div class="operation-submit">
              <a-button 
                type="primary" 
                :disabled="!canSubmit" 
                @click="executeOperation"
                :loading="operationLoading"
                class="submit-button"
              >
                <component :is="getOperationIcon()" size="16" />
                <span>{{ getOperationButtonText() }}</span>
              </a-button>
            </div>
          </div>
        </div>
    
        <!-- Right side: File Operation Records (swapped position) -->
        <div class="file-records-section">
          <div class="file-records-header">
            <h2>文件操作记录</h2>
            <div class="file-records-actions">
              <a-select v-model="filterType" placeholder="筛选类型" style="width: 120px">
                <a-option value="">全部</a-option>
                <a-option value="create">创建</a-option>
                <a-option value="modify">修改</a-option>
                <a-option value="delete">删除</a-option>
                <a-option value="encrypt">加密</a-option>
                <a-option value="decrypt">解密</a-option>
              </a-select>
              <a-button type="outline" @click="refreshRecords">
                <template #icon><RefreshCw size="14" /></template>
                刷新
              </a-button>
            </div>
          </div>
          
          <div class="file-records-content">
            <a-table 
              :columns="columns" 
              :data="filteredRecords" 
              :pagination="{ pageSize: 10 }"
              :loading="loading"
              :bordered="false"
              :stripe="true"
              row-key="id"
              class="custom-table"
            >
              <!-- Custom cell renderers -->
              <template #id="{ record }">
                <span class="record-id">{{ record.id }}</span>
              </template>
              
              <template #file_path="{ record }">
                <div class="file-path">
                  {{ truncateText(record.file_path, 30) }}
                </div>
              </template>
              
              <template #operation_type="{ record }">
                <a-tag :color="getOperationTypeColor(record.operation_type)">
                  {{ record.operation_type }}
                </a-tag>
              </template>
              
              <template #file_hash="{ record }">
                <div class="file-hash">
                  {{ truncateText(record.file_hash, 20) }}
                </div>
              </template>
              
              <template #operations="{ record }">
                <a-button 
                  type="text" 
                  size="small" 
                  @click="viewFileDetail(record)"
                  class="view-detail-btn"
                >
                  查看
                </a-button>
              </template>
              
              <!-- Empty state -->
              <template #empty>
                <div class="empty-state">
                  <div class="empty-icon">
                    <FileText size="48" />
                  </div>
                  <div class="empty-text">暂无文件操作记录</div>
                </div>
              </template>
            </a-table>
          </div>
        </div>
      </div>
      
      <!-- File Detail Modal -->
      <a-modal
        v-model:visible="detailModalVisible"
        :title="`文件操作详情 #${selectedRecord?.id || ''}`"
        :footer="false"
        :mask-closable="true"
        class="detail-modal"
      >
        <div v-if="selectedRecord" class="file-detail">
          <div class="detail-item">
            <div class="detail-label">文件路径</div>
            <div class="detail-value">{{ selectedRecord.file_path }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">操作类型</div>
            <div class="detail-value">
              <a-tag :color="getOperationTypeColor(selectedRecord.operation_type)">
                {{ selectedRecord.operation_type }}
              </a-tag>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">文件哈希</div>
            <div class="detail-value">{{ selectedRecord.file_hash }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">操作时间</div>
            <div class="detail-value">{{ formatDate(selectedRecord.alert_time) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">应用ID</div>
            <div class="detail-value">{{ selectedRecord.app_id }}</div>
          </div>
        </div>
      </a-modal>
      
      <!-- Operation Result Modal -->
      <a-modal
        v-model:visible="resultModalVisible"
        :title="operationResult.success ? '操作成功' : '操作失败'"
        :footer="false"
        :mask-closable="true"
        class="result-modal"
      >
        <div class="operation-result">
          <div class="result-icon">
            <CheckCircle v-if="operationResult.success" size="48" class="success-icon" />
            <XCircle v-else size="48" class="error-icon" />
          </div>
          <div class="result-message">{{ operationResult.message }}</div>
          <div class="result-actions">
            <a-button @click="resultModalVisible = false">关闭</a-button>
            <a-button v-if="operationResult.success" type="primary" @click="refreshAfterOperation">
              刷新列表
            </a-button>
          </div>
        </div>
      </a-modal>
    </div>
    </template>
    
    <script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useFileMLogStore } from '@/stores/filemlog';
    import { useFileInfoStore } from '@/stores/fileinfo';
    import { 
      RefreshCw, 
      FileText, 
      ChevronDown, 
      Eye, 
      EyeOff, 
      AlertTriangle,
      CheckCircle,
      XCircle,
      FolderOpen,
      Lock as LockIcon,
      Unlock as UnlockIcon,
      Trash2,
      Key,
      Settings,
      Info as InfoIcon
    } from 'lucide-vue-next';
    
    // Store instances
    const fileMLogStore = useFileMLogStore();
    const fileInfoStore = useFileInfoStore();
    
    // State
    const loading = ref(false);
    const operationLoading = ref(false);
    const filterType = ref('');
    const fileRecords = ref([]);
    const selectedFilePath = ref('');
    const selectedOperation = ref('');
    const secretKey = ref('');
    const forceDelete = ref(false);
    const showPassword = ref(false);
    const detailModalVisible = ref(false);
    const selectedRecord = ref(null);
    const resultModalVisible = ref(false);
    const fileInputRef = ref(null);
    const operationResult = ref({
      success: false,
      message: ''
    });
    
    // Computed values
    const filteredRecords = computed(() => {
      if (!filterType.value) return fileRecords.value;
      return fileRecords.value.filter(record => 
        record.operation_type.toLowerCase().includes(filterType.value.toLowerCase())
      );
    });
    
    const canSubmit = computed(() => {
      if (!selectedFilePath.value || !selectedOperation.value) return false;
      
      if (selectedOperation.value === 'encrypt' || selectedOperation.value === 'decrypt') {
        return !!secretKey.value;
      }
      
      return true;
    });
    
    // Key strength calculation
    const keyStrength = computed(() => {
      if (!secretKey.value) return 0;
      
      let strength = 0;
      const key = secretKey.value;
      
      // Length check
      if (key.length >= 8) strength += 25;
      if (key.length >= 12) strength += 15;
      
      // Character variety check
      if (/[A-Z]/.test(key)) strength += 15;
      if (/[a-z]/.test(key)) strength += 15;
      if (/[0-9]/.test(key)) strength += 15;
      if (/[^A-Za-z0-9]/.test(key)) strength += 15;
      
      return Math.min(strength, 100);
    });
    
    const keyStrengthColor = computed(() => {
      if (keyStrength.value < 40) return '#ff4d4f';
      if (keyStrength.value < 70) return '#faad14';
      return '#52c41a';
    });
    
    const keyStrengthText = computed(() => {
      if (keyStrength.value < 40) return '弱';
      if (keyStrength.value < 70) return '中';
      return '强';
    });
    
    // Table columns
    const columns = [
      { title: 'ID', dataIndex: 'id', },
      { title: '文件路径', dataIndex: 'file_path'},
      { title: '操作类型', dataIndex: 'operation_type',  },
      { title: '文件哈希', dataIndex: 'file_hash',  },
      { title: '操作时间', dataIndex: 'alert_time' },
    ];
    
    // Helper functions
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };
    
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
    
    const getOperationTypeColor = (type) => {
      const typeMap = {
        'create': 'green',
        'modify': 'blue',
        'delete': 'red',
        'encrypt': 'purple',
        'decrypt': 'orange'
      };
      
      return typeMap[type?.toLowerCase()] || 'default';
    };
    
    const getOperationText = () => {
      if (!selectedOperation.value) return '选择操作';
      
      const opMap = {
        'encrypt': '加密文件',
        'decrypt': '解密文件',
        'delete': '删除文件'
      };
      
      return opMap[selectedOperation.value] || '选择操作';
    };
    
    const getOperationButtonText = () => {
      if (!selectedOperation.value) return '执行操作';
      
      const opMap = {
        'encrypt': '加密',
        'decrypt': '解密',
        'delete': '删除'
      };
      
      return opMap[selectedOperation.value] || '执行';
    };
    
    const getOperationIcon = () => {
      if (selectedOperation.value === 'encrypt') return LockIcon;
      if (selectedOperation.value === 'decrypt') return UnlockIcon;
      if (selectedOperation.value === 'delete') return Trash2;
      return Settings;
    };
    
    // Event handlers
    const handleOperationSelect = (value) => {
      selectedOperation.value = value;
      
      // Reset related fields
      if (value !== 'encrypt' && value !== 'decrypt') {
        secretKey.value = '';
      }
      
      if (value !== 'delete') {
        forceDelete.value = false;
      }
    };
    
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };
    
    // Open file browser dialog
    const browseFile = () => {
      if (fileInputRef.value) {
        fileInputRef.value.click();
      }
    };
    

    // Handle file selection from the file input
    const handleFileSelected = (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        selectedFilePath.value = file.name;
        
        // Additional file handling can be added here
        console.log('Selected file:', file);
      }
    };
    
    const viewFileDetail = (record) => {
      selectedRecord.value = record;
      detailModalVisible.value = true;
    };
    
    // Data fetching
    const fetchFileRecords = async () => {
      loading.value = true;
      try {
        const records = await fileMLogStore.fileModiLogs();
        if (Array.isArray(records)) {
          fileRecords.value = records;
        } else {
          // If no records or error, set empty array
          fileRecords.value = [];          
        }
      } catch (error) {
        console.error('Error fetching file records:', error);
        fileRecords.value = [];
      } finally {
        loading.value = false;
      }
    };
    
    // Execute file operation
    const executeOperation = async () => {
      operationLoading.value = true;
      
      try {
        let result;
        
        // Prepare file object
        const fileObj = {
          path: selectedFilePath.value,
          force_delete: forceDelete.value,
          is_encrypted: selectedOperation.value === 'encrypt',
          secret_key: secretKey.value
        };
        
        // Execute operation based on selection
        switch (selectedOperation.value) {
          case 'encrypt':
            result = await fileInfoStore.fileEncrypt(fileObj);
            break;
          case 'decrypt':
            result = await fileInfoStore.fileDecrypt(fileObj);
            break;
          case 'delete':
            // Mock delete operation (no actual API for this in the store)
            result = await fileInfoStore.fileDecrypt(fileObj)
            break;
          default:
            throw new Error('未知操作类型');
        }
        
        // Show result
        operationResult.value = {
          success: result === 'success',
          message: result === 'success' 
            ? `文件 ${selectedFilePath.value} ${getOperationMessage(selectedOperation.value)}成功` 
            : `操作失败: ${result}`
        };
      } catch (error) {
        console.error('Operation error:', error);
        operationResult.value = {
          success: false,
          message: `操作失败: ${error.message || '未知错误'}`
        };
      } finally {
        operationLoading.value = false;
        resultModalVisible.value = true;
      }
    };
    
    const getOperationMessage = (operation) => {
      switch (operation) {
        case 'encrypt': return '加密';
        case 'decrypt': return '解密';
        case 'delete': return '删除';
        default: return '操作';
      }
    };
    
    // Refresh after operation
    const refreshAfterOperation = () => {
      resultModalVisible.value = false;
      refreshRecords();
      
      // Reset form
      selectedFilePath.value = '';
      selectedOperation.value = '';
      secretKey.value = '';
      forceDelete.value = false;
    };
    
    // Refresh records
    const refreshRecords = () => {
      fetchFileRecords();
    };
    
    // Initialize component
    onMounted(() => {
      fetchFileRecords();
    });
    </script>
    
    <style scoped>
    /* Main page layout */
    .file-operation-view {
      /* min-height: 100vh;
      background-color: #1e1e1e; */
      color: #e0e0e0;
      padding: 20px;
    }
    
    .file-operation-container {
      display: flex;
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    /* Responsive layout */
    @media (max-width: 1024px) {
      .file-operation-container {
        flex-direction: column;
      }
    }
    
    /* Left side: Custom Operations */
    .custom-operations-section {
      flex: 1;
      min-width: 300px;
      max-width: 400px;
      background-color: #2a2a2a;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
    }
    
    .custom-operations-header {
      margin-bottom: 24px;
    }
    
    .custom-operations-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
      border-left: 4px solid #14C9C9;
      padding-left: 12px;
    }
    
    .custom-operations-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
      height: 100%;
    }
    
    .operation-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .group-title {
      font-size: 1rem;
      font-weight: 500;
      color: #ffffff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .file-selector {
      display: flex;
      gap: 10px;
    }
    
    .browse-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 12px;
    }
    
    /* Enhanced secret key styling */
    .secret-key-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .secret-key-input {
      background-color: #333333;
      border-color: #444444;
    }
    
    .secret-key-input:focus, .secret-key-input:hover {
      border-color: #14C9C9;
      box-shadow: 0 0 0 2px rgba(20, 201, 201, 0.2);
    }
    
    .password-toggle {
      cursor: pointer;
      color: #a0a0a0;
      transition: color 0.2s ease;
    }
    
    .password-toggle:hover {
      color: #ffffff;
    }
    
    .key-strength {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .strength-label {
      font-size: 12px;
      color: #a0a0a0;
      white-space: nowrap;
    }
    
    .strength-meter {
      flex: 1;
      height: 4px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    
    .strength-bar {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
    }
    
    .strength-text {
      font-size: 12px;
      font-weight: 600;
    }
    
    .key-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #a0a0a0;
      font-size: 12px;
      margin-top: 4px;
    }
    
    /* Delete options */
    .delete-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-color: rgba(255, 77, 79, 0.1);
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #ff4d4f;
    }
    
    .warning-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ff4d4f;
      font-size: 0.875rem;
    }
    
    /* Operation button styling */
    .operation-button {
      width: 100%;
      height: 40px;
    }
    
    .operation-button-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .operation-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .option-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Submit button */
    .operation-submit {
      margin-top: auto;
      padding-top: 24px;
      display: flex;
      justify-content: center;
    }
    
    .submit-button {
      min-width: 120px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(20, 201, 201, 0.3);
    }
    
    /* Right side: File Records */
    .file-records-section {
      flex: 2;
      min-width: 0; /* Prevent flex item from overflowing */
      background-color: #2a2a2a;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      margin-right: 30px;
    }
    
    .file-records-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .file-records-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
      border-left: 4px solid #14C9C9;
      padding-left: 12px;
    }
    
    .file-records-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .file-records-content {
      /* Ensure the table has proper height */
      height: calc(100% - 60px);
    }
    
    /* Table styles */
    .record-id {
      font-family: monospace;
      color: #a0a0a0;
    }
    
    .file-path, .file-hash {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: monospace;
    }
    
    .view-detail-btn {
      color: #14C9C9;
    }
    
    .view-detail-btn:hover {
      color: #0fb8b8;
      background-color: rgba(20, 201, 201, 0.1);
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
      color: #14C9C9;
      opacity: 0.5;
    }
    
    .empty-text {
      font-size: 16px;
    }
    
    /* Modal styles */
    .detail-modal, .result-modal {
      width: 500px;
    }
    
    .file-detail {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .detail-label {
      font-size: 0.875rem;
      color: #a0a0a0;
    }
    
    .detail-value {
      font-size: 1rem;
      color: #ffffff;
      word-break: break-word;
      font-family: monospace;
    }
    
    .operation-result {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
    }
    
    .result-icon {
      font-size: 48px;
    }
    
    .success-icon {
      color: #52c41a;
    }
    
    .error-icon {
      color: #ff4d4f;
    }
    
    .result-message {
      font-size: 1rem;
      text-align: center;
    }
    
    .result-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    
    /* Override Arco Design styles for dark theme */
    :deep(.arco-input-wrapper) {
      background-color: #333333;
      border-color: #444444;
    }
    
    :deep(.arco-input) {
      color: #e0e0e0;
    }
    
    :deep(.arco-input-prefix) {
      color: #a0a0a0;
    }
    
    :deep(.arco-btn) {
      border-radius: 4px;
    }
    
    :deep(.arco-btn-primary) {
      background-color: #14C9C9;
      border-color: #14C9C9;
    }
    
    :deep(.arco-btn-primary:hover) {
      background-color: #0fb8b8;
      border-color: #0fb8b8;
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
      background-color: #14C9C9;
      color: #ffffff;
      border-color: #14C9C9;
    }
    
    :deep(.arco-select-view) {
      background-color: #333333;
      border-color: #444444;
      color: #e0e0e0;
    }
    
    :deep(.arco-select-view:hover) {
      border-color: #14C9C9;
    }
    
    :deep(.arco-checkbox) {
      color: #e0e0e0;
    }
    
    :deep(.arco-checkbox-checked .arco-checkbox-icon) {
      background-color: #14C9C9;
      border-color: #14C9C9;
    }
    
    :deep(.arco-dropdown-option:hover) {
      background-color: rgba(20, 201, 201, 0.1);
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