import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAiPostsStore = defineStore('aiPosts', () => {
    const posts = ref([]);  // 全局共享的 posts
    const ask = ref('');  // 记录用户输入

    return { posts, ask };
});
