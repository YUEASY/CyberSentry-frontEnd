<template>
    <div class="main-wrapper">
        <div class="icon-background">
            <ShieldSwordIcon :size="450" />
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
            <AiWindow />
        </a-row>
    </div>
</template>

<script setup>
import SiderBar from './SiderBar.vue';
import ShieldSwordIcon from 'vue-material-design-icons/ShieldSword.vue';
import MainWindow from './MainWindow.vue';
import AiWindow from './AiWindow.vue';
</script>

<style scoped>

.main-wrapper {
    height: 100vh;
    width: 100vw;
    background-size: cover;
    background-color: #000000;
    position: relative;
}

.icon-background {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    opacity: 0.07; /* 调整透明度以确保内容可见 */
    color: rgba(100, 120, 233, 0.878);
}

.content {
    position: relative;
    z-index: 1;

    height: 100%;
    width: 100%;
}

.siderbar {
    /* background-color: #00b621; */
    height: 100%;
    padding: 50px;
}

.main-window {
    margin-top: 30px;
}
</style>