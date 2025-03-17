<script setup>
import AppList from '@/components/AppList.vue';
import CpuLineCharts from '@/components/echarts/CpuLineCharts.vue';
import MemoryLineCharts from '@/components/echarts/MemoryLineCharts.vue';


</script>

<template>
    <a-row>
        <a-col :flex="7">
            <CpuLineCharts/>
            <MemoryLineCharts />
        </a-col>
        <a-col :flex="3" >
            <AppList />
        </a-col>
    </a-row>
</template>