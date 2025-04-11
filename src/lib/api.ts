import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
})

api.interceptors.request.use(
    config => {
        if(typeof window !== 'undefined'){
            const token = localStorage.getItem('access')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config;
    },
    error => Promise.reject(error)
)

export default api;