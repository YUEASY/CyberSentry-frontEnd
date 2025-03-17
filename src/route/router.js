import { createRouter, createWebHistory } from "vue-router"

import HomeKKK from "@/view/HomeKKK.vue"
import AccountCogOutlineIcon from 'vue-material-design-icons/AccountCogOutline.vue';
import AccountCogIcon from 'vue-material-design-icons/AccountCog.vue';
import MainCharts from "@/view/MainCharts.vue";
import UsrKKK from "@/view/UsrKKK.vue";



const routes = [
  {
    idx: 0,
    path: "/",
    name: "cyber",
    component: MainCharts,
    icon: AccountCogOutlineIcon,
    selectedIcon: AccountCogIcon
  },
  {
    idx: 1,
    path: "/home",
    name: "家",
    component: HomeKKK,
    icon: AccountCogOutlineIcon,
    selectedIcon: AccountCogIcon
  },
  {
    idx: 2,
    path: "/usr",
    name: "个人资料",
    component: UsrKKK,
    icon: AccountCogOutlineIcon,
    selectedIcon: AccountCogIcon

  }

]


const router = createRouter({
  history: createWebHistory(),
  routes
})


export {routes, router}