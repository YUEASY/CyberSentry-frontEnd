<script setup>
import { ref, computed, onMounted } from 'vue';
import { router, routes } from '@/route/router';
import { useUserStore } from '@/stores/user';
import { LogOut, ChevronRight } from 'lucide-vue-next';

// Get current user
const user = useUserStore();

// Define selected state based on current route
const selectedRoute = ref(null);

// Track if sidebar is collapsed
const isCollapsed = ref(false);

// Toggle sidebar collapse state
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  // Save preference to localStorage
  localStorage.setItem('sidebarCollapsed', isCollapsed.value);
};

// Handle route click
const handleRouteClick = (route) => {
  selectedRoute.value = route;
  // Navigate to selected route
  router.push(route.path);
};

// Handle logout
const handleLogout = () => {
  user.logout();
  window.location.href = '/';
};

// Get first letter of username for avatar
const userInitial = computed(() => {
  return user.username ? user.username.charAt(0).toUpperCase() : 'U';
});

// Check if route is active
const isRouteActive = (route) => {
  return selectedRoute.value && selectedRoute.value.idx === route.idx;
};

// Set initial selected route based on current path
onMounted(() => {
  // Get current route
  const currentPath = router.currentRoute.value.path;
  const currentRoute = routes.find(route => route.path === currentPath);
  if (currentRoute) {
    selectedRoute.value = currentRoute;
  } else {
    // Default to first route if no match
    selectedRoute.value = routes[0];
  }
  
  // Check if sidebar was previously collapsed
  const savedState = localStorage.getItem('sidebarCollapsed');
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true';
  }
});
</script>

<template>
  <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- Sidebar toggle button -->
    <div class="sidebar-toggle" @click="toggleSidebar">
      <ChevronRight :class="{ 'rotate-180': isCollapsed }" />
    </div>
    
    <!-- Logo/Brand section -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <component 
          :is="routes[0].selectedIcon" 
          :size="36"
        />
      </div>
      <div class="brand-text" v-if="!isCollapsed">CyberSentry</div>
    </div>
    
    <!-- Navigation menu -->
    <nav class="sidebar-nav">
      <div
        v-for="route in routes.filter(r => !r.meta?.hideInMenu)" 
        :key="route.idx" 
        class="nav-item" 
        :class="{ 'active': isRouteActive(route) }"
        @click="handleRouteClick(route)"
      > 
        <div class="nav-icon">
          <component 
            :is="isRouteActive(route) ? route.selectedIcon : route.icon" 
            :size="24" 
          />
        </div>
        <div class="nav-text" v-if="!isCollapsed">{{ route.name }}</div>
        <div class="active-indicator" v-if="isRouteActive(route)"></div>
      </div>
    </nav>
    
    <!-- User profile section -->
    <div class="sidebar-footer">
      <div class="user-profile" @click="handleLogout">
        <div class="user-avatar">
          <span>{{ userInitial }}</span>
        </div>
        <div class="user-info" v-if="!isCollapsed">
          <div class="username">{{ user.username }}</div>
          <div class="user-email">{{ user.email }}</div>
        </div>
        <div class="logout-icon" v-if="!isCollapsed">
          <LogOut size="18" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 240px;
  height: 823px;
  background-color: #1a1a1a;
  color: #e0e0e0;
  position: relative;
  transition: all 0.3s ease;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-toggle {
  position: absolute;
  top: 20px;
  right: 10px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #a0a0a0;
  z-index: 10;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.sidebar-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.rotate-180 {
  transform: rotate(180deg);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  padding: 20px;
  height: 70px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: rgba(233, 220, 167, 0.877);
}

.brand-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  position: relative;
  margin-bottom: 5px;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin-left: 10px;
  margin-right: 10px;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background-color: rgba(233, 220, 167, 0.15);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #a0a0a0;
  transition: color 0.2s ease;
}

.active .nav-icon {
  color: rgba(233, 220, 167, 0.877);
}

.nav-text {
  margin-left: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #e0e0e0;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.active .nav-text {
  color: rgba(233, 220, 167, 0.877);
  font-weight: 600;
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background-color: rgba(233, 220, 167, 0.877);
  border-radius: 0 3px 3px 0;
}

.sidebar-footer {
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-profile:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: rgba(233, 220, 167, 0.2);
  color: rgba(233, 220, 167, 0.877);
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.user-info {
  margin-left: 12px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #a0a0a0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-icon {
  margin-left: 8px;
  color: #a0a0a0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.user-profile:hover .logout-icon {
  opacity: 1;
}

/* Scrollbar styling */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>

