import { aiAnalysis, aiAnalysisRes, aiAnalysisResUserId } from "@/api/aiAres";
import MarkdownIt from "markdown-it";
import { defineStore } from "pinia";


export const useAiAResStore = defineStore('aiAres', {
    state: () => {
        return {
            list: "",
            posts: [],
            loading: false
        }
    },
    actions: {
        async aiAnalysis(AiContent) {
            const md = new MarkdownIt({
                html: true,
                linkify: true,
                typographer: true,
            });
            this.loading = true
            this.posts.push({idx: this.posts.length + 1, sender: 'user', content: AiContent.prompt})
            const resp = await aiAnalysis(AiContent)

            if (resp.result.status === 'success') {
                console.log("data变量内容:", JSON.stringify(resp.result.data, null, 2));

                this.posts.push({idx: this.posts.length + 1, sender: 'ai', 
                    content: md.render(resp.result.data.result)})

            } else this.posts.push({idx: this.posts.length + 1, sender: 'ai', content: '系统繁忙，请稍后重试' })
            this.loading = false
        },
        async aiAnalysisRes(id) {
            const resp = await aiAnalysisRes(id)
            if (resp.status === 'success') {
                return  resp.data
            }
            return resp.status
        },
        aiAnalysisResUserId: async (user_id) => {
            const resp = await aiAnalysisResUserId(user_id)
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            return resp.result.status
        }
    },
})