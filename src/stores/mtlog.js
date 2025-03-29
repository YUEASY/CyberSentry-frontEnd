import { maliciousThreadLogs, maliciousThreadLogsId } from "@/api/mtlog";
import { defineStore } from "pinia";


export const useMTLogStore = defineStore('mtlog', {
    state: () => {
        return {
            id: -1,
            app_id: -1,
            thread_name: "",
            thread_hash: "",
            risk_level: 0,
            detection_time: ""
        }
    },
    actions: {
        maliciousThreadLogs: async () => {
            const resp = await maliciousThreadLogs() 
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            return resp.result.status
        },
        maliciousThreadLogsId: async (id) => {
            const resp = await maliciousThreadLogsId(id)
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        }
    }
})