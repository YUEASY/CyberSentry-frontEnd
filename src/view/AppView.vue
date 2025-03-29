<template>
    <a-row style="height: 100%;">
        <a-col :flex="6" style="display: flex; flex-direction: column; align-items: center; height: 100%;">
            <!-- 表头 -->
            <div class="list-item">
                <div class="header-item icon-column">图标</div>
                <div class="header-item name-column">应用名称</div>
                <div class="header-item">CPU</div>
                <div class="header-item">磁盘读取</div>
                <div class="header-item">磁盘写入</div>
                <div class="header-item">内存</div>
                <div class="header-item">功耗等级</div>
            </div>

            <a-list :scrollbar="true" :bordered="false" style="flex: 1; width: 100%;">
            <a-list-item v-for="d in paginatedDatas"
                :key="d.app_id" 
                :bordered="false" 
                :style="{'border': 'none', 'padding': '0px', innerHeight: '100%'}"
            >
            <div class="list-item" @click="() => selectApp(d.app_id)">
                <div class="icon-column">
                <img :width="50" 
                :src="d.icon_path === '' ? defineIcon :`/api/image/${d.icon_path}`"
                class="app-icon" />
                </div>
                <div class="name-column app-name">{{ d.app_name }}</div>
                <div class="app-element">{{ d.cpu_usage?.toFixed(2) }}%</div>
                <div class="app-element">{{ (d.memory_usage_mb / 1024 / 16)?.toFixed(2) }}%</div>
                <div class="app-element">{{ d.disk_io_read?.toFixed(2)  }}</div>
                <div class="app-element">{{ d.disk_io_write?.toFixed(2)  }}</div>
                <div class="app-element">{{ d.power_use_level }}</div>
            </div>
            </a-list-item>
            </a-list>
            <a-pagination
                class="position"
                :total="datas.length" 
                :current="currentPage" 
                @change="(page) => currentPage = page" 
            />
        </a-col>
        <a-col :flex="4" >
            <div v-if="Object.keys(detaileData).length > 0" class="app-detailed-wrapper">
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
                        <div class="detail-item-data">{{ detaileData.cpu_usage?.toFixed(2) }}%</div>
                    </div>
                    <div class="detail-item">
                        内存
                        <div class="detail-item-data">{{ (detaileData.memory_usage_mb / 1024 / 16)?.toFixed(2) }}%</div>
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
                        <a-switch type="round" checked-color="#14C9C9" unchecked-color="#F53F3F"  v-model="appMRule.is_camouflaged" >
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
                        <a-switch @click="postAppMRule" type="round" checked-color="#14C9C9" unchecked-color="#F53F3F" v-model="appMRule.is_recording_prevention_enabled">
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
            <div v-else></div>
        </a-col>
    </a-row>
</template>

<style scoped>

.position {
    position: relative;
    bottom: 90%;
    left: 30%;
}

.button-wrapper {
    display: flex;
    align-items: center;
    margin: 20px;
    margin-left: 0px;
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

/* 让 `.app-detailed-body` 内部元素横向排列，并每行 2 个 */
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


.app-detailed-power {
    
    font-size: 18px;
    color: azure;
    display: flex;
    justify-content: right;
    margin-right: 40px;
}

.app-detailed-img {
    box-shadow: 0 0 8px rgb(95, 74, 5);
    border-radius: 10px;
    display: block;
    margin: 0;
    padding-left: 0px;

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

.app-detailed-wrapper {
    height: 100%;
    width: 100%;
    margin-top: 20px;
}

.arco-list-item {
    padding: none !important;
}

/* 让列表头部与内容对齐 */
.list-header {
  display: flex;
  align-items: center;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.1);
  
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);

}

/* 让表头的每列宽度和内容一致 */
.header-item {
    flex: 1;
    text-align: center;
    color: grey;
}


.div-header {
    border-bottom: 1px solid rgba(159, 159, 159, 0.935); /* 变淡的下划线 */
    width: 100%;
}

/* 列表项：使用 flexbox 保持对齐 */
.list-item {
    width: 100%;
  display: flex;
  align-items: center;
  padding-top: 10px;
  padding-left: 0px;
  padding-right: 0px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 应用图标和名称的特殊样式 */
.icon-column {
  flex: 0 0 60px; /* 固定宽度 */
  display: flex;
  justify-content: center;
  padding-left: 0px;
}

.app-icon {
    box-shadow: 0 0 8px rgb(95, 74, 5);
    border-radius: 10px;
    display: block;
    margin: 0;
    padding-left: 0px;
}

.name-column {
    flex: 2;
    text-align: left;
    padding-left: 10px;
}

.app-name {
    width: min-content;
    font-size: 14px;
    color: rgb(178, 178, 178);
    font-weight: 300;
}

.app-element {
    width: min-content;
    font-size: 20px;
    color: rgb(178, 178, 178);
    font-weight: 300;
    /* margin-left: 15px; */
    flex: 1;
    text-align: center;

}


</style>


<script setup>
import { useAppRMStore } from '@/stores/apprm';
import { useMRuleStore } from '@/stores/mrule';
import { computed, onMounted, ref } from 'vue';
import defineIcon from '../../public/icon.png';

const mrule = useMRuleStore()
const appMRule = ref({})
const appRM = useAppRMStore() 
const datas = ref([]); // Ensure datas is initialized as an array
const currentPage = ref(1);
const pageSize = 10;
const detaileData = ref({})

const paginatedDatas = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    if (datas.value.length > 0) {
        return datas.value.slice(start, end);
    }
    return []; 
});

const postAppMRule = () => {
    mrule.modiMrule(appMRule.value)
}


const selectApp = (app_id) => {
    const selectedApp = paginatedDatas.value.find(data => data.app_id === app_id);
    if (selectedApp) {
        detaileData.value = { ...selectedApp };
    }
    appMRule.value = { ...mrule.mruleInfo(app_id)}

}

const init = async () => {
    datas.value = await appRM.appRMInfos()
}

onMounted(() => {
    init()

    setInterval(async () => {
        datas.value = await appRM.appRMInfos()
    }, 1000 * 60 * 3);
})

</script>
