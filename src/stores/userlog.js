import { createUserInfo, showUserInfoId } from "@/api/userlog";
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
    actions: () => {
        createUserInfo: async (userLog) => {
            const resp = await createUserInfo(userLog)
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        }
        showUserInfoId: async (id) => {
            const resp = await showUserInfoId(id)
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        }
        showUserInfos: async () => {
            const resp = await showUserInfos()
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        }
    }
})