import api from "./axios"

const login = () => {
    return  api.get("posts/1");
}


export { login }