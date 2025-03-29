import api from "./axios"


const sysMonitorLongInfo = () => {
    return api.get('/api/system_monitor/long')
}

const sysMonitorShortInfo = () => {
    return api.get('/api/system_monitor/short')
}

export {sysMonitorLongInfo, sysMonitorShortInfo}