import { fileModiLogs, fileModiLogsId } from "@/api/filemlog";
import { defineStore } from "pinia";

export const useFileMLogStore = defineStore('filemlog', {
    state: () => {
        return {
            id: -1,
            app_id: -1,
            file_path: "",
            operation_type: "",
            file_hash: "",
            alert_time: ""
        }
    },
    actions: () => {
        fileModiLogsId: async (id) => {
            const resp = await fileModiLogsId(id)
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        } 
        fileModiLogs: async () => {
            const resp = await fileModiLogs()
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        }
    }
})