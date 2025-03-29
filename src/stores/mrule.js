import { modiMrule, mruleInfo, mruleInfos } from "@/api/mrule";
import { defineStore } from "pinia";

export const useMRuleStore = defineStore('mrule', {
    state: () => {
        return {
        }
    },
    actions: {
        mruleInfo: async (app_id) => {
            const resp = await mruleInfo(app_id)
            console.log(JSON.stringify(resp, null, 2))
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            return 'error'
        } ,
        mruleInfos: async () => {
            const resp = await mruleInfos()
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            return 'error'
        },
        modiMrule: async (app) => {
            const resp = await modiMrule(app)
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            alert(resp.result.message)
        }
    }
})