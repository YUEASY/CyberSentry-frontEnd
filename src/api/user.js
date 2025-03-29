import api from "./axios"

const login = (email, code) => {
    return api.post('/api/login', {
        "email": email,
        "code": code
    });
}


const vercode = (email) => {
    return api.post('/api/verification_code', {    
        "email": email
    });
}

const update = (user) => {
    return api.post(`/api/user/${user.id}/update`, {
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "is_locked": true
    });
}


export { login, vercode, update }