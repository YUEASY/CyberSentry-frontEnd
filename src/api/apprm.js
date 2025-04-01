import api from "./axios"

const appRMInfos = () => {
    return api.get('/api/app_resource_monitors', {headers:{'Content-Type': 'application/json; charset=utf-8',}})
}


const appRMInfoId = (id) => {
    return api.get(`/api/app_resource_monitor/${id}`)
}


const appRMInfoAppId = (id) => {
    return api.get(`/api/app_resource_monitors/app/${id}`)
}

const appRMCPUInfo = () => {
    return api.get('/api/app_resource_monitors/cpu')
}

const appRMMEMORYInfo = () => {
    return api.get('/api/app_resource_monitors/memory')
}

export {appRMInfoAppId, appRMInfoId, appRMInfos, appRMCPUInfo, appRMMEMORYInfo}