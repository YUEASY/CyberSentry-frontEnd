import { appRMCPUInfo, appRMInfoAppId, appRMInfoId, appRMInfos, appRMMEMORYInfo } from "@/api/apprm";
import { defineStore } from "pinia";


export const useAppRMStore = defineStore('apprm', {
    state: () => {
        return {
        }
    },
    actions: {
        appRMInfos: async () => {
            const resp = await appRMInfos()
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            return "error"
        },
        appRMInfoAppId: async (id) => {
            const resp = await appRMInfoAppId(id)
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        },
        appRMInfoId: async (id) => {
            const resp = await appRMInfoId(id)
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        },
        appRMCPUInfo: async () => {
            const resp = await appRMCPUInfo()
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            return "error"
        },
        appRMMEMORYInfo: async () => {
            const resp = await appRMMEMORYInfo()
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            return "error"
        }
    }
})