<script setup>
import { ref } from 'vue';
import { router, routes } from '@/route/router';
import DotsHorizontalIcon from 'vue-material-design-icons/DotsHorizontal.vue';

// 定义选中状态
const selectedRoute = ref(null);

// 处理点击事件
const handleRouteClick = (route) => {
  selectedRoute.value = route;
  // 跳转到选中的路由
  router.push(route.path);
};

</script>

<template>
    <nav>        
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
                :size="36" 
            />
            <div class="name-nav">{{ r.name }}</div>          
        </div>
    </nav>
    <div class="user-info">
        <a-avatar :size="48" shape="square">Arco</a-avatar>
        <div class="user-font">
            <div class="username">username</div>
            <div class="useremail">@email</div>
        </div>
        <DotsHorizontalIcon class="icon-dot" :size="32"/>
    </div>
</template>

<style scoped>
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
    color: rgba(246, 209, 91, 1.00);

}

.user-info {
    display: flex;
    cursor: pointer;
    align-items: center;
    width: min-content;
    padding: 15px;
    border-radius: 10px;
    margin-top: 40px;
}

.user-info:hover, .wrapper-nav:hover {
    background-color: #81818150;
}

.user-info:active, .wrapper-nav:active {
    background-color: #81818195;
}

.user-font {
    font-size: 24px;
    margin-left: 20px;
    margin-right: 70px;
}

.username {
    color: rgba(246, 209, 91, 1.00);
    width: max-content;
}

.useremail {
    width: max-content;
    color: rgb(180, 165, 122);
}

.icon-dot {
    color: aliceblue;
}
</style>