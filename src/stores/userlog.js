import { createUserInfo, showUserInfoId, showUserInfos } from "@/api/userlog";
import { defineStore } from "pinia";

export const useUserLogStore = defineStore('userlog', {
    state: () => {
        return {
            log_id: -1,
            user_id: -1,
            operation_type: "",
            target_id: 0,
            operation_detail: "",
            client_info: "",
            operation_time: "",
            result_status: false
        }
    },
    actions: {
        createUserInfo: async (userLog) => {
            const resp = await createUserInfo(userLog)
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            return resp.result.status
        },
        showUserInfoId: async (id) => {
            const resp = await showUserInfoId(id)
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            return resp.result.status
        },
        showUserInfos: async () => {
            const resp = await showUserInfos()
            if (resp.result.status === 'success') {
                return resp.result.data
            }
            return resp.result.status
        }
    }
})