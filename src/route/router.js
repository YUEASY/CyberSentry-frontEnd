import { createRouter, createWebHistory } from "vue-router"

import AccountCogOutlineIcon from 'vue-material-design-icons/AccountCogOutline.vue';
import AccountCogIcon from 'vue-material-design-icons/AccountCog.vue';
import MainCharts from "@/view/MainCharts.vue";
import AppView from "@/view/AppView.vue";
import CheckboxBlankBadge from 'vue-material-design-icons/CheckboxBlankBadge.vue';
import CheckboxBlankBadgeOutline from 'vue-material-design-icons/CheckboxBlankBadgeOutline.vue';
import HeadSnowflakeOutline from 'vue-material-design-icons/HeadSnowflakeOutline.vue';
import HeadSnowflake from 'vue-material-design-icons/HeadSnowflake.vue';
import ViewDashboard from 'vue-material-design-icons/ViewDashboard.vue';
import UsrView from "@/view/UsrView.vue";
import AiView from "@/view/AiView.vue";
import AppDetailView from "@/view/AppDetailView.vue"
import AiAnalysisView from "@/view/AiAnalysisView.vue"
import FileOperationView from "@/view/FileOperationView.vue"
import { FileTextOutlined } from "@ant-design/icons-vue";
import { FileText } from "lucide-vue-next";
import ChartTimelineVariant from 'vue-material-design-icons/ChartTimelineVariant.vue';
import ChartTimelineVariantShimmer from 'vue-material-design-icons/ChartTimelineVariantShimmer.vue';


const routes = [
  {
    idx: 0,
    path: "/dashboard",
    name: "",
    component: MainCharts,
    icon: ViewDashboard,
    selectedIcon:ViewDashboard,
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
    idx: 4,
    path: "/ai-analysis",
    name: "AI分析中心",
    component: AiAnalysisView,
    icon: ChartTimelineVariant,
    selectedIcon: ChartTimelineVariantShimmer,
  },
  {
    idx: 5,
    path: "/file-operations",
    name: "文件操作中心",
    component: FileOperationView,
    icon: FileTextOutlined,
    selectedIcon: FileText,
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
    idx: 6,
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