import api from "./axios"

const createUserInfo = (userLog) => {
    return api.post('/api/user_operation_log', {
        body: JSON.stringify({
            "user_id": userLog.id,
            "operation_type": userLog.opType,
            "target_id": userLog.targetId,
            "operation_detail": userLog.opDetail,
            "client_info": userLog.clientInfo,
            "operation_time": userLog.time,
            "result_status": userLog.resStatus
        })
    })
}

const showUserInfos = () => {
    return api.get('/api/user_operation_logs')
}

const showUserInfoId = (id) => {
    return api.get(`/api/user_operation_logs/${id}`)
}

export {createUserInfo, showUserInfoId, showUserInfos}