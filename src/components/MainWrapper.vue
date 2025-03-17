<template>
    <div class="main-wrapper">
        <div class="icon-background">
            <CPUModel></CPUModel>
        </div>
        <a-row class="content">
            <a-col :flex="2" class="siderbar">
                <SiderBar />
            </a-col>
            <a-col :flex="10" class="main-window">
                <MainWindow>
                    <router-view />
                </MainWindow>
            </a-col>
            <div class="fixed-bottom-right">AI</div>
        </a-row>
    </div>
</template>

<script setup>
import SiderBar from './SiderBar.vue';
// import ShieldSwordIcon from 'vue-material-design-icons/ShieldSword.vue';
import MainWindow from './MainWindow.vue';
import CPUModel from './threejs/CPUModel.vue';
</script>

<style scoped>

.fixed-bottom-right {
    position: fixed;
    right: 20px; /* 右侧间距 */
    bottom: 20px; /* 底部间距 */
    height: 70px;
    width: 70px;

    font-size: 24px;
    font-weight: bold;

    display: flex;
    align-items: center;
    justify-content: center;
    background-color: black;
    color: rgba(246, 209, 91, 1.00);
    border-radius: 10px;

    box-shadow: 0px 0px 2px 1px rgba(255, 255, 255, 0.872);


    cursor: pointer;
}


.main-wrapper {
    height: 100vh;
    width: 100vw;
    background-size: cover;
    background-color: #212121;
    position: relative;
}

.icon-background {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    opacity: 1; /* 调整透明度以确保内容可见 */
    color: rgb(255, 183, 0);
}

.content {
    position: relative;
    z-index: 1;

    height: 100%;
    width: 100%;
}

.siderbar {
    /* background-color: #00b621; */
    padding: 50px;
}

.main-window {
    margin-top: 30px;
}
</style>