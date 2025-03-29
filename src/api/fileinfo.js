import api from "./axios"

const files = () => {
    return api.get('/api/files')
}

const fileId = (id) => {
    return api.get(`/api/files/${id}`)
}

const fileEncrypt = (file) => {
    return api.post('/api/files/encrypt', {
        body: JSON.stringify({
            "file_id": file.id,
            "secret_key": file.secretKey
        })
    })
}

const fileDecrypt = (file) => {
    return api.post('/api/files/decrypt', {
        body: JSON.stringify({
            "file_id": file.id,
            "secret_key": file.secretKey
        })
    })
}


export {files, fileId, fileEncrypt, fileDecrypt}