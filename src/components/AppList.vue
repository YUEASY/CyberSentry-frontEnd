<script setup>
import { useAppRMStore } from '@/stores/apprm';
import { useMRuleStore } from '@/stores/mrule';
import { ref, onMounted } from 'vue';
import defineIcon from '../../public/icon.png'

import CheckboxBlankBadge from 'vue-material-design-icons/CheckboxBlankBadge.vue';
import Cpu64Bit from 'vue-material-design-icons/Cpu64Bit.vue';
import Memory from 'vue-material-design-icons/Memory.vue';


// 定义一个存储当前时间的状态

onMounted(() => {
  setInterval(async () => {
    
    cpu5.value = await appRM.appRMCPUInfo()
    memo5.value = await appRM.appRMMEMORYInfo()

    }, 1000 * 6);
});

const appRM = useAppRMStore();

const cpu5 = ref([])
const memo5 = ref([])

const showPopup = ref(false)

const mrule = useMRuleStore()
const appMRule = ref({})

const closePopup = () => {
  showPopup.value = false
}

const openPopup = () => {
    showPopup.value = true
}

const postAppMRule = () => {
    mrule.modiMrule(appMRule.value)
}

const detaileData = ref({})

const selectApp = async (app_id, type) => {
    let selectedApp;
    if (type === 'cpu') {
        selectedApp = cpu5.value.find(data => data.app_id === app_id)
    } else {
        selectedApp = memo5.value.find(data => data.app_id === app_id)
    }

    if (selectedApp) {
        detaileData.value = { ...selectedApp };
    }
    const data = await mrule.mruleInfo(app_id)
    appMRule.value = { ...data }
    openPopup()
}

</script>

<template>
    <div style="margin-top: 40px;">
        <ul>
            <li class="head">
                <CheckboxBlankBadge class="head-icon" :size="30"/>
                <div class="head-name">
                    应用
                    <div class="head-lineup"></div>
                </div>
            </li>
            <div class="flex-div">
                <li class="app-li-icon ">
                    <div>
                        <Cpu64Bit :size="40" class="icon-sort" />
                    </div>
                    <div class="icon-name">cpu↓</div>
                </li>
                <li class="app-li-icon">
                    <div>

                        <Memory :size="40" class="icon-sort"/>
                    </div>
                    <div class="icon-name">memory↓</div>
                </li>
            </div>
            <div class="flex-div">
                <div>
                    <li v-for="a in cpu5" :key="a.app_id" class="app-li" @click="() => selectApp(a.app_id, 'cpu')">
                        <img 
                            :width="30"
                            :src="a.icon_path === '' ? defineIcon :`/api/image/${a.icon_path}`"
                            :alt="a.app_name"
                            class="app-icon"
                        />
                        <div class="app-name">{{ a.app_name }}</div>
                        <div class="stat-container">
                            <a-statistic 
                                :value="a.cpu_usage" 
                                :precision="2" 
                                :value-style="{
                                    color: 'rgba(246, 209, 91, 1.00)',
                                    fontSize: '16px'
                                }"
                            >
                                <template #suffix>%</template>
                            </a-statistic>
                        </div>
                    </li>
                </div>
                <div>
                    <li v-for="a in memo5" :key="a.app_id" class="app-li" @click="() => selectApp(a.app_id, 'memo')">
                        <img 
                            :width="30"
                            :src="a.icon_path === '' ? defineIcon :`/api/image/${a.icon_path}`"
                            :alt="a.app_name"
                            class="app-icon"
                        />
                        <div 
                            class="app-name" 
                            :title="a.app_name" 
                            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                        >
                            {{ a.app_name }}
                        </div>
                        <div class="stat-container">
                            <a-statistic 
                                :value="(a.memory_usage_mb / 1024 / 16)" 
                                :precision="2" 
                                :value-style="{
                                    color: 'rgba(246, 209, 91, 1.00)',
                                    fontSize: '16px'
                                }"
                            >
                                <template #suffix>%</template>
                            </a-statistic>
                        </div>
                    </li>
                </div>
            </div>            
        </ul>
    </div>
    <div v-if="showPopup" class="overlay" @click="closePopup"></div>
    <div v-if="showPopup" class="popup">
        <div class="app-detailed-wrapper">
                <div class="app-detailed-head">
                    <img 
                        :width="80"
                        class="app-detailed-img" 
                        :src="detaileData.icon_path === '' ? defineIcon :`/api/image/${detaileData.icon_path}`"
                        :alt="detaileData.app_name"
                    />
                    <div class="app-detailed-name">
                        {{ detaileData.app_name }}
                        <div class="app-detailed-power">电源消耗评级: {{ detaileData.power_use_level }}</div>
                    </div>
                </div>
                <div class="app-detailed-body">
                    <div class="detail-item">   
                        CPU
                        <div class="detail-item-data">{{ detaileData.cpu_usage?.toFixed(2) }}% </div>
                    </div>
                    <div class="detail-item">
                        内存
                        <div class="detail-item-data">{{ detaileData.memory_usage_mb?.toFixed(2) }}%</div>
                    </div>
                    <div class="detail-item">
                        磁盘写入
                        <div class="detail-item-data">{{ detaileData.disk_io_write?.toFixed(2) }}</div>
                    </div>
                    <div class="detail-item">
                        磁盘读取
                        <div class="detail-item-data">{{ detaileData.disk_io_read?.toFixed(2) }}</div>
                    </div>
                </div>
                <div class="app-detailed-button-body">
                    <div class="button-wrapper">
                        <span class="button-head">进程伪装</span>
                        <a-switch type="round" checked-color="#14C9C9" unchecked-color="#F53F3F" v-model="appMRule.is_camouflaged" >
                            <template #checked >
                                ON
                            </template>
                            <template #unchecked>
                                OFF
                            </template>
                        </a-switch>
                        <a-input-search v-if="appMRule.is_camouflaged" :style="{width:'220px', 'margin-left': '10px'}" v-model="appMRule.camouflage_pid" allow-clear search-button>
                            <template #prefix>
                                进程ID
                            </template>
                            <template #button-default>
                                <div @click="postAppMRule">send</div>
                            </template>
                        </a-input-search>
                    </div>
                    <div class="button-wrapper">
                        <span class="button-head">反录屏</span>
                        <a-switch @click="postAppMRule" type="round" checked-color="#14C9C9" unchecked-color="#F53F3F" v-model="appMRule.is_recording_prevention_enabled" >
                            <template #checked>
                                ON
                            </template>
                            <template #unchecked>
                                OFF
                            </template>
                        </a-switch>

                    </div>
                    <div class="button-wrapper">
                       <span class="button-head">保护应用</span>
                       <a-switch @click="postAppMRule" type="round" checked-color="#14C9C9" unchecked-color="#F53F3F" v-model="appMRule.is_protected" >
                            <template #checked>
                                ON
                            </template>
                            <template #unchecked>
                                OFF
                            </template>
                        </a-switch>
                    </div>
                </div>
            </div>
    </div>

</template>

<style scoped>

.button-wrapper {
    display: flex;
    align-items: center;
    margin: 20px;
    margin-left: 0px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
  z-index: 999; /* 确保覆盖内容 */
}


.button-head {
    padding-right: 10px;
    color: grey;
    font-size: 20px;
    font-weight: 300;
}

.app-detailed-button-body {
    color: azure;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    margin-left: 100px;
}

.app-detailed-power {
    
    font-size: 18px;
    color: azure;
    display: flex;
    justify-content: right;
    margin-right: 40px;
}
.app-detailed-body {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: space-between; /* 让元素均匀分布 */
  gap: 10px; /* 控制元素之间的间距 */
  width: 100%; /* 让容器撑满 */
  margin-top: 20px;
}

/* 每个数据项 */
.detail-item {
  flex: 0 0 calc(50% - 10px); /* 每个元素占 50% 宽度，并减去间距 */
  box-sizing: border-box; /* 确保 padding 不影响宽度 */
  padding: 10px;
  /* border: 1px solid rgba(255, 255, 255, 0.3); */
  color: azure;
  border-radius: 5px;
  text-align: center;
  /* background: rgba(255, 255, 255, 0.1); */
  font-size: 20px;
}

.detail-item-data {
    color: azure;
    font-weight: 300;
}


.app-detailed-name {
    font-size: 20px;
    color: azure;
    margin-top: 15px;
    text-align: center;
    width: 100%;
}

.app-detailed-head {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.app-detailed-img {
    box-shadow: 0 0 8px rgb(95, 74, 5);
    border-radius: 10px;
    display: block;
    margin: 0;
    padding-left: 0px;

}

.app-detailed-wrapper {
    height: 100%;
    width: 100%;
    margin-top: 20px;
}

/* 弹出框 */
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 居中 */
  background: rgb(0, 0, 0);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(232, 232, 232, 0.2);
  text-align: center;
  z-index: 1000; /* 确保在遮罩层上方 */
  width: 500px;
  height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.icon-name {
    margin-left: 20px;
    color: rgb(255, 255, 255);
    font-size: 16px;
    font-weight: 500px;
}


.icon-sort {
    color: rgb(152, 152, 152);
    z-index: 0;
    position: relative 
}

.flex-div {
    display: flex;
    width: auto;
    position: relative;
}

.app-li-icon {
    margin-top: 10px;
    width: 200px;
    margin-right: 15px;
    display: flex;
    position: relative;
    display: flex;
    align-items: center;
}

.stat-container {
    position: absolute;
    bottom: 9px; /* 距离底部 3px */
    right: 15px; /* 距离右侧 5px */
}


.app-li {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    margin-top: 10px;
    cursor: pointer;
    padding: 7px;
    border-radius: 10px;
    height: 6vh;
    width: 200px;
    margin-right: 10px;
    position: relative;
    box-shadow: 0 0 1px rgba(255, 255, 255, 0.3);

}

.app-li:hover {
    background-color: #81818150;
}

.app-li:active {
    background-color: #81818195;
}


.app-icon {
    box-shadow: 0 0 8px rgb(95, 74, 5);
    border-radius: 10px;
    margin-right: 15px;
}

.app-name {
    font-size: 16px;
    color: rgb(178, 178, 178);
    font-weight: 300;
    width: 50%;
}

.time-container {
    display: flex;
    /* justify-content: center; */
    align-items: center;

}
ul {
  list-style: none;
  padding: 0;
}

.head-lineup {
    height: 3px;
    width: 400px;
    margin-top: 2px;
    background-color: rgb(246, 220, 91);
}

.head {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

.head-icon {
    color: rgba(246, 209, 91, 1.00);
    margin-right: 10px;
}

.head-name {
    color: rgb(255, 255, 255);
    width: auto;
    font-weight: bold;
    font-size: 20px;
}

p {
    font-size: 20px;
    color: rgb(87, 141, 203);
    font-family: 'Arial', sans-serif;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(72, 71, 71, 0.393);
}

.time-text {
    margin-right: 10px; /* 添加右边距 */
    font-size: 24px;
}

.progress-bar-container {
    width: 220px;
    height: 15px;
    background-color: #9b9b9b;
    border-radius: 5px 10px 5px 10px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(142, 127, 90, 0.393); /* 添加阴影 */
    margin-left: 10px;
}

.progress-bar {
    height: 100%;
    transition: width 0.5s ease;
    box-shadow: 0 2px 4px rgba(72, 71, 71, 0.393); /* 为进度条添加阴影 */

}
</style>