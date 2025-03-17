import axios from 'axios';

// 白名单，不需要 token 的接口
const ignores = ['/login', '/register'];


// 环境
const ev = {
    "dev": {
        remoteUrl: "127.0.0.1",
        remotePort: 8080
    },
    "prod": {
        remoteUrl: "127.0.0.1",
        remotePort: 8080
    }
}

// 使用环境
const useEnv = ev.dev

const url = (a, b) => a + ":" + b

// 创建 axios 实例
const api = axios.create({
    baseURL: url(useEnv.remoteUrl, useEnv.remotePort),
    // timeout: 5000, // 请求超时时间
});


// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 检查请求是否在白名单中
    if (!ignores.includes(config.url)) {
      // 获取 token
      const token = localStorage.getItem('token');
      if (token) {
        // 在请求头中添加 token
        config.headers['token'] = token;
      } else {
        // 如果没有 token，可以跳转到登录页面或抛出错误
        return Promise.reject(new Error('No token found'));
      }
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
api.interceptors.response.use(
  (response) => {
    const res = response.data;
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      // remind users

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if ([50008, 50012, 50014].includes(res.code)) {
        // 清除 token 并跳转到登录页面
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api