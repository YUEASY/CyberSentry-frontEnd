<template>
    <div :class="[ 'ai-content-container', props.aiContentClass ]">

        <div v-if=" aiPosts.posts.length == 0" :class="[!props.isExpanded 
            ?'content-margin-head' :'content-margin-head-large']">
            Cyber
        </div>

        <a-scrollbar :style="scrollbarStyle">
            <div :class="[!props.isExpanded ? 'content-margin' : 'content-margin-large']">
                <div v-for="p in aiPosts.posts" :key="p.idx" :class="['post-container',
                         p.sender != 'ai' ? 'post-user' : '']">
                        <div v-if="p.sender != 'ai'" class="bgc-user">
                            {{ p.content }}
                        </div>
                        <div v-else >
                            <div class="post-ai" v-html="p.content"></div>
                            <div class="line"></div>
                        </div>
                </div>
            </div>
        </a-scrollbar>
        <div :class="[ aiPosts.posts.length == 0 ? 
              !props.isExpanded ? 'input-container' : 'input-container-large' :
              !props.isExpanded ? 'input-container-down' : 'input-container-down-large' ]">

            <input type="text" placeholder="输入消息..." v-model="aiPosts.ask" :disabled="aiApi.loading"/>
            <Send class="send-button" :size="24" @click="sendAks" v-if="!aiApi.loading"/>
            <a-spin dot v-else class="send-button"></a-spin>
        </div>
    </div>
</template>


<script setup>
import Send from 'vue-material-design-icons/Send.vue';
import { computed, defineProps } from 'vue';
import { useAiAResStore } from '@/stores/aiAres';
import { useUserStore } from '@/stores/user';
import { useAiPostsStore } from '@/stores/aiPosts';

const props = defineProps({
    aiContentClass: String,
    isExpanded: Boolean
})

const aiApi = useAiAResStore()
const user = useUserStore()
const aiPosts = useAiPostsStore();

const sendAks = async () => {
    aiApi.aiAnalysis({user_id: user.user_id, prompt: aiPosts.ask})
    aiPosts.ask = ''
}

aiPosts.posts = computed(() => aiApi.posts);

const scrollbarStyle = computed(() => ({
    height: '100%',
    maxHeight: !props.isExpanded ? '340px' : '700px',
    overflowY: 'auto',
    'margin-left': !props.isExpanded ? '0px' : '230px' 
}));
</script>


<style scoped>

.line {
    width: 100%;
    border-bottom: 1px solid rgb(214, 177, 114); /* 下划线颜色和厚度 */
    opacity: 0.08;
}

.content-margin-head-large {
    margin-top: 240px;
    
}

.content-margin-large {
    margin-top: 60px;
    width: 80%;
}

.input-container-down-large {
    /* align-items: flex-end; */
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 800px; /* 适当调整宽度 */
    height: auto;
    margin-top: 25px;
}


.input-container-down {
    /* align-items: flex-end; */
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 400px; /* 适当调整宽度 */
    height: auto;
    margin-top: 5px;
}

.content-margin-head {
    margin-top: 15px;
    font-size: 28px;
    font-weight: bold;
}

.content-margin {
    margin-top: 15px; 
    height: 100%;
    width: 100%;
}

.bgc-user {
    background-color: #81818150;
    padding: 10px 10px 10px 10px;
    border-radius: 15px;
    margin-right: 5px;

}

.post-user {
    justify-content: flex-end;
    font-size: 16px;
    font-weight: 300;
    width: min-content;
}

.post-ai {
    justify-content: flex-start;
    font-weight: 400;
    font-size: 16px;
    padding: 0px 10px 10px 10px;
}

.post-container {
    display: flex;
    width: 100%;
    margin-bottom: 10px;

}

.ai-content-container {
    display: flex;
    /* justify-content: center; */
    align-items: center;
    flex-direction: column;
}

/* 输入框外层容器 */
.input-container {
  margin-top: 5px;
  position: relative;
  display: flex;
  align-items: center;
  width: 400px; /* 适当调整宽度 */
}

/* 输入框外层容器 */
.input-container-large {
  margin-top: 5px;
  position: relative;
  display: flex;
  align-items: center;
  width: 800px; /* 适当调整宽度 */
}


/* 输入框 */
input {
  width: 100%;
  padding: 10px 40px 10px 10px; /* 右侧预留空间给按钮 */
  font-size: 16px;
  font-size: 16px;
  color: aliceblue;

  border-radius: 25px;

  outline: none;
  background-color: #81818150;
  height: 45px;
}

input:focus {
    border: 1px solid #c6c5c5;
    background-color: #81818195;
}

/* 发送按钮 */
.send-button {
  position: absolute;
  right: 10px; /* 距离右侧 10px */
  color: rgb(222, 126, 10);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}



/* 发送按钮鼠标悬停效果 */
.send-button:hover {
    color: rgb(245, 159, 54);
}

/* 发送按钮鼠标悬停效果 */
.send-button:active {
    color: rgb(97, 54, 2);
}



</style>