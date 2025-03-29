import api from "./axios"

const fileModiLogsId = (id) => {
    return api.get(`/api/file_modification_logs/${id}`)
}

const fileModiLogs = () => {
    return api.get('/api/file_modification_logs')
}

export {fileModiLogs, fileModiLogsId}