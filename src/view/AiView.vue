<template>
    <div 
        class="fixed-bottom-right expanded-popup-large"
    >
        <div class="popup-content">
            <div class="popup-head-large">
                <AiModel />
            </div>
            <AiContent :is-expanded="true" />
        </div>
    </div>
</template>

<script setup>
import AiContent from '@/components/AiContent.vue';
import AiModel from '@/components/AiModel.vue';


</script>

<style scoped>

.popup-head-large {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 20px;
    padding-left: 20px;
    width:90%;
}



/* 小按钮 */
.fixed-bottom-right {
    position: fixed;
    right: 7px;
    bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    color: rgb(255, 255, 255);
    background-color: #000;
    /* box-shadow: 0px 0px 4px 2px rgba(255, 255, 255, 0.872); */
}

/* 小按钮的尺寸 */
.small-btn {
    width: 70px;
    height: 70px;
    border-radius: 10px;
    cursor: pointer;
}

.small-btn:hover {
    background-color: #81818150;
}

.small-btn:active {
    background-color: #81818195;
}


.expanded-popup-large {
    width: 1520px;
    height: 885px;
    border-radius: 20px;
    background-color: #000;
    /* box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.872); */
}


/* 弹窗内容 */
.popup-content {
    width: 100%;
    height: 100%;
    color: white;
    box-shadow: none;

}

</style>
