import { appInfoId, appInfos } from "@/api/app"
import { defineStore } from "pinia"

export const useAppInfoStore = defineStore("app", {
    state: () => {
        return {
            id: -1,
            app_name: "",
            executable_path: "",
            icon_path: "",
            list: [],
        }
    },
    actions: {
        async appInfoId(id) {
            const resp = await appInfoId(id)
            if (resp.result && resp.result.status === "success") {
                const data = resp.result.data
                this.id = data.id
                this.app_name = data.app_name
                this.executable_path = data.executable_path
                this.icon_path = data.icon_path
                return data
            }
            return "error"
        },
        async appInfos() {
            const resp = await appInfos()
            if (resp.result && resp.result.status === "success") {
                this.list = resp.result.data
                return resp.result.data
            }
            return "error"
        },
    },
})

