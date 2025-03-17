<script setup>
import { ref, onMounted } from 'vue';

import CheckboxBlankBadge from 'vue-material-design-icons/CheckboxBlankBadge.vue';
import Cpu64Bit from 'vue-material-design-icons/Cpu64Bit.vue';
import Memory from 'vue-material-design-icons/Memory.vue';
import TriangleSmallDown from 'vue-material-design-icons/TriangleSmallDown.vue';


// 定义一个存储当前时间的状态
const currentTime = ref(new Date().toLocaleTimeString());

// 定义一个存储危机值的状态
const crisisValue = ref(0);

// 设置一个定时器，每秒更新一次当前时间和危机值
onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString();
    // 模拟危机值变化
    crisisValue.value = (crisisValue.value + 10) % 100;
  }, 1000);
});

// 根据危机值获取进度条颜色
const getProgressBarColor = (value) => {
  if (value < 33) {
    return 'green';
  } else if (value < 66) {
    return 'orange';
  } else {
    return 'red';
  }
};


const apps = [
    {idx: 0, path: "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp", name: "QQ"},
    {idx: 1, path: "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp", name: "QQ"},
    {idx: 2, path: "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp", name: "QQ"},
    {idx: 3, path: "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp", name: "QQ"},
    {idx: 4, path: "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp", name: "QQ"},
]




</script>

<template>
    <div class="time-container">
        <p class="time-text">{{ currentTime }}</p>
        <p>
            总状态：
        </p>
        <div class="progress-bar-container">
            <div 
                class="progress-bar" 
                :style="{ width: crisisValue + '%', backgroundColor: getProgressBarColor(crisisValue) }"
            ></div>
        </div>  
    </div>
    <div>
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
                        <TriangleSmallDown :size="40" class="traing-icon"/>
                    </div>
                    <div class="icon-name">cpu↓</div>
                </li>
                <li class="app-li-icon">
                    <div>

                        <Memory :size="40" class="icon-sort"/>
                        <TriangleSmallDown :size="40"  class="traing-icon"/>
                    </div>
                    <div class="icon-name">memory↓</div>
                </li>
            </div>
            <div class="flex-div">
                <div>
                    <li v-for="a in apps" :key="a.idx" class="app-li">
                        <img 
                            :width="30"
                            :src="a.path"
                            :alt="a.name"
                            class="app-icon"
                        />
                        <div class="app-name">{{ a.name }}</div>
                    </li>
                </div>
                <div>
                    <li v-for="a in apps" :key="a.idx" class="app-li">
                        <img 
                            :width="30"
                            :src="a.path"
                            :alt="a.name"
                            class="app-icon"
                        />
                        <div class="app-name">{{ a.name }}</div>
                    </li>
                </div>
            </div>            
        </ul>
    </div>
</template>

<style scoped>

.icon-name {
    margin-left: 20px;
    color: white;
    font-size: 16px;
    font-weight: 500px;
}

.traing-icon {
    color: rgb(221, 104, 91);
    z-index: 1;
    position: absolute;
    right: 152px;
    bottom: 0;
    height: 33px;
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
    margin-right: 3px;
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
    background-color: rgba(246, 209, 91, 1.00);
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
    font-size: 25px;
    color: rgba(246, 209, 91, 1.00);
    font-family: 'Arial', sans-serif;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(72, 71, 71, 0.393);
}

.time-text {
    margin-right: 20px; /* 添加右边距 */
}

.progress-bar-container {
    width: 220px;
    height: 15px;
    background-color: #ddd;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(72, 71, 71, 0.393); /* 添加阴影 */

}

.progress-bar {
    height: 100%;
    transition: width 0.5s ease;
    box-shadow: 0 2px 4px rgba(72, 71, 71, 0.393); /* 为进度条添加阴影 */

}
</style>