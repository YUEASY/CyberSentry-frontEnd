import api from "./axios"

const maliciousThreadLogsId = (id) => {
    return api.get(`/api/malicious_thread_logs/${id}`)
}

const maliciousThreadLogs = () => {
    return api.get('/api/malicious_thread_logs')
}


export {maliciousThreadLogs, maliciousThreadLogsId}