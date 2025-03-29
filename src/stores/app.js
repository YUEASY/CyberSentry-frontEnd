import { appInfoId, appInfos } from "@/api/app";
import { defineStore } from "pinia";

export const useAppInfoStore = defineStore('app', {
    state: () => {
        return {
            id: -1,
            app_name: "",
            executable_path: "",
            icon_path: "",
            list: '',
        }
    },
    actions: () => {
        appInfoId: async (id) => {
            const resp = await appInfoId(id)
            if (resp.status === "success") {
                const data = resp.data
                id = data.id
                app_name = data.app_name
                executable_path = data.executable_path
                icon_path = data.icon_path
            }
            return resp.status
        };

        appInfos: async () => {
            const resp = await appInfos()
            if (resp.status === "success") {
                list = resp.data
            }
            return resp.status
        }
    }
})