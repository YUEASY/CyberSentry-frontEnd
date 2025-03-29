import { sysMonitorLongInfo, sysMonitorShortInfo } from "@/api/sys";
import { defineStore } from "pinia";

export const useSysMStore = defineStore('sys', {
    state: () => {
        return {
        }
    },
    actions: {
        sysMonitorLongInfo: async () => {
            const resp = await sysMonitorLongInfo()
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        },
        sysMonitorShortInfo: async () => {
            const resp = await sysMonitorShortInfo()
            if (resp.result.status === 'success') {
                
                return resp.result.data
            }
            return resp.result.status
        }
    }
})