import { login, vercode, update } from "@/api/user";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
    state: () => ({
        id: -1,
        user_id: -1,
        username: "",
        password: "",
        role: "",
        email: "",
        phone: "",
        last_login_ip: "",
        last_login_time: "",
    }),
    actions: {
        async login(email, code) {
            const resp = await login(email, code);
            if (resp && resp.result && resp.result.status === "success") {
                const data = resp.result.data;
                this.user_id = data.user_id;
                this.username = data.username;
                this.role = data.role;
                this.email = data.email;
                this.phone = data.phone;
                this.last_login_ip = data.last_login_ip;
                this.last_login_time = data.last_login_time;
                this.id = data.id;

                localStorage.setItem('token', resp.result.token)
                localStorage.setItem('user', JSON.stringify(resp.result.data))
            }
            
            return resp.result.status
        },
        async vercode(email) {
            const resp = await vercode(email);
            if (resp && resp.result && resp.result.status === "success") {
                return resp.result.status;
            }
            return "error";
        },
        async update(user) {
            const resp = await update(user);
            if (resp && resp.result && resp.result.status === "success") {
                return true;
            }
            return false;
        },
        async logout() {
            this.user_id = -1;
            this.username = "";
            this.role = "";
            this.email = "";
            this.phone = "";
            this.last_login_ip = "";
            this.last_login_time = "";
            this.id = -1;
        },
        userinfo () {
            const userStr = localStorage.getItem('user')
            if (userStr !== null) {
                const data = JSON.parse(userStr)
                this.user_id = data.user_id;
                this.username = data.username;
                this.role = data.role;
                this.email = data.email;
                this.phone = data.phone;
                this.last_login_ip = data.last_login_ip;
                this.last_login_time = data.last_login_time;
                this.id = data.id;
            }
        }

    }
});