<template>
    <!-- 小按钮（默认显示） -->
    <div 
        v-if="!showPopup" 
        class="fixed-bottom-right small-btn" 
        @click="togglePopup"
    >
        <HeadSnowflakeOutline :size="36" />
    </div>

    <!-- 展开后的大弹窗 -->
    <div 
        v-if="showPopup" 
        class="fixed-bottom-right"
        :class="[!isExpanded ? 'expanded-popup' : 'expanded-popup-large']"
    >
        <div v-if="!isExpanded" class="popup-content">
            <div class="popup-head">
                <AiModel />
                <div>
                    <UnfoldMoreVertical :size="32" class="head-icon" @click="expandContent"/>
                    <ChevronDown :size="32" class="head-icon" @click="togglePopup"/>
                </div>
            </div>
            <AiContent 
                :is-expanded="isExpanded" 
                :ai-content-class="{
                    width: '100%',
                    height: '100%',}"/>
        </div>
        <div v-else class="popup-content">
            <div class="popup-head-large">
                <UnfoldMoreVertical :size="32" class="head-icon" @click="expandContent"/>
                <AiModel />
                <ChevronDown :size="32" class="head-icon" @click="togglePopup"/>
            </div>
            <AiContent :is-expanded="isExpanded" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue';
import UnfoldMoreVertical from 'vue-material-design-icons/UnfoldMoreVertical.vue';
import AiContent from './AiContent.vue';
import AiModel from './AiModel.vue';
import HeadSnowflakeOutline from 'vue-material-design-icons/HeadSnowflakeOutline.vue';


const showPopup = ref(false);
const isExpanded = ref(false);

const expandContent = () => {
    isExpanded.value = !isExpanded.value;
}

// 切换展开状态
const togglePopup = () => {
    showPopup.value = !showPopup.value;
    isExpanded.value = false;
};
</script>

<style scoped>
.head-icon {
    color: rgba(246, 209, 91, 1.00);
    cursor: pointer;
}

.popup-head-large {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    padding-left: 20px;
    width: 95%;
}


.popup-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    padding-left: 20px;
    width: 90%;
}

/* 小按钮 */
.fixed-bottom-right {
    position: fixed;
    right: 7px;
    bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    color: rgb(255, 255, 255);
    background-color: #000;
    /* box-shadow: 0px 0px 4px 2px rgba(255, 255, 255, 0.872); */
    transition: all 0.3s ease-in-out;
    transform-origin: bottom right;
    animation: expand 0.3s forwards;
}

/* 小按钮的尺寸 */
.small-btn {
    width: 70px;
    height: 70px;
    border-radius: 10px;
    cursor: pointer;
}

.small-btn:hover {
    background-color: #81818150;
}

.small-btn:active {
    background-color: #81818195;
}

/* 展开后的大弹窗 */
.expanded-popup {
    width: 450px;
    height: 500px;
    border-radius: 20px;
    background-color: #000;
    box-shadow: 0px 0px 1px 1px rgba(238, 151, 151, 0.872);
}

.expanded-popup-large {
    width: 1300px;
    height: 885px;
    border-radius: 20px;
    background-color: #000;
    /* box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.872); */
}

@keyframes expand {
    from {
        transform: scale(0);
    }
    to {
        transform: scale(1);
    }
}

/* 弹窗内容 */
.popup-content {
    width: 100%;
    height: 100%;
    color: white;
    box-shadow: none;

}

</style>
