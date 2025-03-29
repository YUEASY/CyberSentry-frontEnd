<template>
<ListComponent :columns="columns" :data="data" :pagination="10" :height="700"/>    
</template>

<script setup>
import { ref } from 'vue';
import ListComponent from './ListComponent.vue';

const columns = [
    {title: '图片', dataIndex: 'img'},
    {title: '标题', dataIndex: 'name1'},
    {title: '标题', dataIndex: 'name2'},
    {title: '按钮', dataIndex: 'button'},
]

const data = ref([])

</script>