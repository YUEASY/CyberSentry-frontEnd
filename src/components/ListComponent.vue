<template>
    <div style="width: 100%; height: 100%;">
        <a-table :columns="columns" :data="data" :style="chartStyles" :pagination="pagination">
        </a-table>
    </div>
</template>

<script setup>
import {computed, defineProps} from 'vue'

const props = defineProps({
    columns: Array,
    data: Array,
    pagination: Number,
    width: { type: String, default: '100%' }, // 图表宽度
    height: { type: String, default: '400px' }, // 图表高度
})

    // 计算 `div` 的动态样式
const chartStyles = computed(() => ({
  width: props.width,
  height: props.height,
}));

</script>
