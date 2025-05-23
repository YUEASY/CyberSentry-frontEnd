import { fileModiLogs, fileModiLogsId } from "@/api/filemlog"
import { defineStore } from "pinia"

export const useFileMLogStore = defineStore("filemlog", {
    state: () => {
        return {
            id: -1,
            app_id: -1,
            file_path: "",
            operation_type: "",
            file_hash: "",
            alert_time: "",
        }
    },
    actions: {
        async fileModiLogsId(id) {
            const resp = await fileModiLogsId(id)
            if (resp.result.status === "success") {
                return resp.result.data
            }
            return resp.result.status
        },
        async fileModiLogs() {
            const resp = await fileModiLogs()
            if (resp.result.status === "success") {
                return resp.result.data
            }
            return resp.result.status
        },
    },
})