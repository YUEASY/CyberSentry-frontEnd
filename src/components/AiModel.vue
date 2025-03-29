<template>
    <a-space direction="vertical" size="large">

        <a-select 
        default-value="deepseek" 
        :style="{
            'width': '160px',
            'background-color': 'transparent',
            'color': 'white',
            'font-weight': '300'
        }"
        :size="large"
        placeholder="AI 模型"
        >
        <a-option>deepseek</a-option>
        <a-option>星火</a-option>
    </a-select>
</a-space>
</template>


<script>

</script>


<style scoped>


</style>