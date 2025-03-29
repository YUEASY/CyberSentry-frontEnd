<template>
  <HomeView v-if="user.username === ''" />
  <MainWrapper v-else/>
</template>

<script setup>                                             
import MainWrapper from './components/MainWrapper.vue';
import { useUserStore } from './stores/user';
import HomeView from './view/HomeView.vue';

const user = useUserStore()

</script>

