import { createRouter, createWebHistory } from "vue-router"

import AccountCogOutlineIcon from 'vue-material-design-icons/AccountCogOutline.vue';
import AccountCogIcon from 'vue-material-design-icons/AccountCog.vue';
import MainCharts from "@/view/MainCharts.vue";
import AppView from "@/view/AppView.vue";
import CheckboxBlankBadge from 'vue-material-design-icons/CheckboxBlankBadge.vue';
import CheckboxBlankBadgeOutline from 'vue-material-design-icons/CheckboxBlankBadgeOutline.vue';
import HeadSnowflakeOutline from 'vue-material-design-icons/HeadSnowflakeOutline.vue';
import HeadSnowflake from 'vue-material-design-icons/HeadSnowflake.vue';
import Snail from 'vue-material-design-icons/Snail.vue';
import UsrView from "@/view/UsrView.vue";
import AiView from "@/view/AiView.vue";
import AppDetailView from "@/view/AppDetailView.vue"


const routes = [
  {
    idx: 0,
    path: "/dashboard",
    name: "",
    component: MainCharts,
    icon: Snail,
    selectedIcon: Snail
  },
  {
    idx: 1,
    path: "/apps",
    name: "应用",
    component: AppView,
    icon:CheckboxBlankBadgeOutline,
    selectedIcon: CheckboxBlankBadge
  },
  {
    idx: 3,
    path: "/aichart",
    name: "智能AI",
    component: AiView,
    icon: HeadSnowflakeOutline,
    selectedIcon: HeadSnowflake

  },
  {
    idx: 2,
    path: "/usr",
    name: "个人资料",
    component: UsrView,
    icon: AccountCogOutlineIcon,
    selectedIcon: AccountCogIcon

  },
  {
    path: "/apps/:id",
    component: AppDetailView,
    meta: { hideInMenu: true },
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})


export {routes, router}