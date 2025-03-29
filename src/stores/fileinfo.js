import { fileDecrypt, fileEncrypt, fileId, files } from "@/api/fileinfo";
import { defineStore } from "pinia";

export const useFileInfoStore = defineStore('fileinfo', {
    state: () => {
        return {
            file_id: -1,
            path: "",
            force_delete: false,
            is_encrypted: false,
            secret_key: ""
        }
    },
    actions: () => {
        files: async () => {
            const resp = await files()
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        }
        fileId: async (id) => {
            const resp = await fileId(id)
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        }
        fileEncrypt: async (file) => {
            const resp = await fileEncrypt(file)
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        }
        fileDecrypt: async (file) => {
            const resp = await fileDecrypt(file)
            if (resp.status === 'success') {
                return resp.data
            }
            return resp.status
        }
    }
})