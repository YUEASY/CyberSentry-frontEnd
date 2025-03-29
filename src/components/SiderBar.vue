<script setup>
import { ref } from 'vue';
import { router, routes } from '@/route/router';
import DotsHorizontalIcon from 'vue-material-design-icons/DotsHorizontal.vue';
import { useUserStore } from '@/stores/user';

// 定义选中状态
const selectedRoute = ref(null);

// 处理点击事件
const handleRouteClick = (route) => {
    selectedRoute.value = route;
    // 跳转到选中的路由
    router.push(route.path);
};
const user = useUserStore()

const handleLogout = () => {
    user.logout()
};



</script>

<template>
<div class="position-div"> 
    <nav class="margin-nav">
        <div
            v-for="r in routes" 
            :key="r.idx" 
            class="wrapper-nav" 
            @click="handleRouteClick(r)"
            :class="{ 'selected': selectedRoute && selectedRoute.idx === r.idx }"
        > 
            <component 
                :is="selectedRoute && selectedRoute.idx === r.idx ? r.selectedIcon : r.icon" 
                class="icon-nav" 
                :size="r.idx == 0 ? 48 : 36" 
            />
            <div class="name-nav">{{ r.name }}</div>          
        </div>
    </nav>

        <a-popover
        position="top"
        :content-style="{ 'padding': '0', 'background-color': ' #000', 'box-shadow': '0px 4px 10px rgba(0, 0, 0, 0.1)', 'border': '1px solid rgba(255, 255, 255, 0.3)'}"
        class="position-popover"
        >
        <template #content>
            <div class="content-wrapper"
            >
            <div class="logout" @click="handleLogout">
                登出
            </div>
        </div> 
    </template>
    <template #default>
        <div class="user-info">
            <a-avatar :size="32" shape="square"><IconUser /></a-avatar>
            <div class="user-font">
                <div class="username">{{ user.username }}</div>
                <div class="useremail">@{{ user.email }}</div>
            </div>
            <DotsHorizontalIcon class="icon-dot" :size="32"/>
        </div>
    </template>
</a-popover>
</div>
</template>

<style scoped>

.margin-nav {
    /* margin-top: 50px; */
    
}

.position-div {
    position: relative;
    height: 100%;
}

.content-wrapper {
    width: 300px;
    height: 70px;
    display: flex;
    align-items: center; 
    justify-content: center;
}

.logout {
    font-size: 16px;
    color: rgb(243, 243, 243);
    cursor: pointer;
    padding: 10px;
    width: 100%;
    display: flex;
    align-items: center; 
    justify-content: center;

}

.icon-nav {
    /* color: rgba(246, 209, 91, 1.00); */
    margin-right: 20px;
}

.name-nav {
    font-size: 24px;
}

.wrapper-nav {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: min-content;
    padding: 15px;
    border-radius: 30px;
    font-weight: 300;
    width: max-content;
    color: rgb(243, 243, 243);
}

.wrapper-nav.selected {
    color: #000; /* 选中时的文字颜色 */
    font-weight: 700;
    width: max-content;
    color: rgb(255, 255, 255);
}

.user-info {
    display: flex;
    cursor: pointer;
    align-items: center;
    width: min-content;
    padding: 5px;
    border-radius: 10px;
    margin-top: 40px;
    bottom: 0px;
    position: absolute;
}

.user-info:hover, .wrapper-nav:hover, .logout:hover {
    background-color: #81818150;
}

.user-info:active, .wrapper-nav:active, .logout:active {
    background-color: #81818195;
}

.user-font {
    font-size: 20px;
    margin-left: 10px;
    margin-right: 40px;
}

.username {
    color: rgb(255, 255, 255);
    width: max-content;
}

.useremail {
    width: max-content;
    color: rgb(134, 133, 129);
}

.icon-dot {
    color: aliceblue;
}
</style>
