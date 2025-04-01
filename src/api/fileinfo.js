import api from "./axios"

const files = () => {
    return api.get('/api/files')
}

const fileId = (id) => {
    return api.get(`/api/files/${id}`)
}

const fileEncrypt = (file) => {
    return api.post('/api/files/encrypt', {
        "path": file.path,
        "secret_key": file.secret_key
    })
}

const fileDecrypt = (file) => {
    return api.post('/api/files/decrypt', {
            "path": file.path,
            "secret_key": file.secret_key
    })
}

const fileDelete = (file) => {
    return api.post('/api/files/decrypt', {
            "path": file.path,
    })
}



export {files, fileId, fileEncrypt, fileDecrypt, fileDelete}