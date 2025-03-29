import api from "./axios"



const appInfoId = (id) => {
    return api.get(`/api/app_info/${id}`)
}

const appInfos = () => {
    return api.get('/api/app_infos')
}


export {appInfos, appInfoId}