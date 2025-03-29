<template>
  <!-- <HomeView v-if="user.username === ''" /> -->
  <MainWrapper />
</template>

<script setup>                                             
import { onMounted } from 'vue';
import MainWrapper from './components/MainWrapper.vue';
import { useUserStore } from './stores/user';
// import HomeView from './view/HomeView.vue';

const user = useUserStore()

onMounted(() => {
  user.userinfo()
})

</script>

