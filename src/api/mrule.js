import api from "./axios"


const mruleInfo = (app_id) => {
    return api.get(`/api/monitoring_rule/${app_id}`)
}


const mruleInfos = () => {
    return api.get('/api/monitoring_rules')
}


const modiMrule = (app) => {
    return api.post('/api/monitoring_rules', {
        "app_id": app.app_id,
        "is_camouflaged": app.is_camouflaged,
        "camouflage_pid": app.camouflage_pid,
        "is_recording_prevention_enabled": app.is_recording_prevention_enabled,
        "is_protected": app.is_protected
    })
}

export {mruleInfo, mruleInfos, modiMrule}